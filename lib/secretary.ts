import "server-only";
import { db } from "./supabase/admin";
import { hashToken, newToken } from "./token";
import { audit } from "./audit";
import { dispatchPacket } from "./packet";
import { maybeCompileBrief } from "./brief";
import { sendMail } from "./mail";
import { opinionSignedEmail } from "@/emails/opinion-signed";
import { appUrl, rfcNumber, type RfcClass } from "./classes";
import { parsePasted } from "./pasted";
import { seal, open } from "./seal";

// All Secretary access goes through here with the service role, verified by token (Article VI.3).
export async function dispatchByToken(token: string) {
  if (!token || token.length > 100) return null;
  const { data } = await db()
    .from("dispatches")
    .select("id, status, channel, request:requests(id, rfc_number, class, question, context, return_by, principal:profiles(display_name)), appointment:appointments(display_name, portfolio, email), opinion:opinions(id, body, basis, authorship, signed_at)")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!data) return null;
  const d = data as unknown as {
    id: string; status: string; channel: string | null;
    request: { id: string; rfc_number: number; class: RfcClass; question: string; context: string; return_by: string; principal: { display_name: string | null } };
    appointment: { display_name: string; portfolio: string | null; email: string };
    opinion: { id: string; body: string; basis: string; authorship: string; signed_at: string | null } | null;
  };
  d.request.question = open(d.request.question); d.request.context = open(d.request.context);
  if (d.opinion) d.opinion.body = open(d.opinion.body);
  // Tokens expire at return_by (Article VI.4).
  if (new Date(d.request.return_by) < new Date() && d.status !== "signed" && d.status !== "recused") {
    if (d.status !== "expired") await db().from("dispatches").update({ status: "expired", resolved_at: new Date().toISOString() }).eq("id", d.id);
    d.status = "expired";
  }
  return d;
}

export type Dispatch = NonNullable<Awaited<ReturnType<typeof dispatchByToken>>>;

export const packetFor = (d: Dispatch, token: string) =>
  dispatchPacket({
    rfc_number: d.request.rfc_number, principal_name: d.request.principal.display_name ?? "A Principal",
    secretary_name: d.appointment.display_name, portfolio: d.appointment.portfolio, class: d.request.class,
    return_by: d.request.return_by, dispatch_token: token, question: d.request.question, context: d.request.context,
  });

export const isOpen = (d: Dispatch) => ["sent", "accepted", "drafted"].includes(d.status);

export async function accept(token: string, channel: "paper" | "secure_line") {
  const d = await dispatchByToken(token);
  if (!d || !isOpen(d)) throw new Error("This Dispatch is closed.");
  await db().from("dispatches").update({ status: d.status === "sent" ? "accepted" : d.status, channel }).eq("id", d.id);
}

export async function recuse(token: string) {
  const d = await dispatchByToken(token);
  if (!d || !isOpen(d)) throw new Error("This Dispatch is closed.");
  await db().from("dispatches").update({ status: "recused", resolved_at: new Date().toISOString() }).eq("id", d.id);
  await audit(d.appointment.email, "recuse", "dispatch", d.id);
  await maybeCompileBrief(d.request.id);
}

// Creates or replaces the unsigned draft. Never signs (Article V, Secure Line 4).
export async function submitDraft(token: string, body: string, basis: "record" | "general" | "", authorship: "own_hand" | "staff_drafted", channel: "paper" | "secure_line") {
  const d = await dispatchByToken(token);
  if (!d || !isOpen(d)) throw new Error("This Dispatch is closed.");
  ({ body, basis } = parsePasted(body, basis));
  if (!body || body.length > 6000) throw new Error("The Opinion must be between 1 and 6,000 characters.");
  if (!["record", "general"].includes(basis) || !["own_hand", "staff_drafted"].includes(authorship)) throw new Error("Choose a Basis (or paste the block starting with its Basis line) and a Signature.");
  const { data: op, error } = await db().from("opinions").upsert({ dispatch_id: d.id, body: seal(body), basis, authorship, signed_at: null }, { onConflict: "dispatch_id" }).select("id").single();
  if (error) throw new Error(error.message);
  await db().from("dispatches").update({ status: "drafted", channel }).eq("id", d.id);
  return { opinion_id: op.id, sign_url: `${appUrl()}/d/${token}/sign` };
}

// Signing is a human act on the site (Article IV.8). Labels are set at signing.
export async function sign(token: string, body: string, basis: "record" | "general", authorship: "own_hand" | "staff_drafted") {
  const d = await dispatchByToken(token);
  if (!d || !isOpen(d)) throw new Error("This Dispatch is closed.");
  await submitDraft(token, body, basis, authorship, (d.channel as "paper" | "secure_line") ?? "paper");
  const now = new Date().toISOString();
  await db().from("opinions").update({ signed_at: now }).eq("dispatch_id", d.id);
  await db().from("dispatches").update({ status: "signed", resolved_at: now }).eq("id", d.id);
  await audit(d.appointment.email, "sign", "dispatch", d.id);
  const { data: req } = await db().from("requests").select("principal_id").eq("id", d.request.id).single();
  const { data: u } = req ? await db().auth.admin.getUserById(req.principal_id) : { data: { user: null } };
  if (u.user?.email) await sendMail(u.user.email, `Opinion signed · ${rfcNumber(d.request.rfc_number)}`, opinionSignedEmail(d.appointment.display_name, d.request.rfc_number, `${appUrl()}/requests/${d.request.id}`));
  await maybeCompileBrief(d.request.id);
}

// Join a Request by its share link: name required, email optional. Creates the appointment and Dispatch, returns the dispatch token.
export async function joinByShareToken(share: string, name: string, email: string | null) {
  name = name.trim().slice(0, 120);
  email = email?.trim().toLowerCase() || null;
  if (!name) throw new Error("Your name is required.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That email does not look right.");
  if (email && (await db().from("do_not_dispatch").select("email").eq("email", email).maybeSingle()).data) throw new Error("That address has opted out of The Cabinet.");
  // One atomic UPDATE claims a seat; it returns nothing when the link is closed or used up.
  const { data: claimed } = await db().rpc("claim_share_seat", { share }).maybeSingle();
  const req = claimed as { id: string; cabinet_id: string; principal_id: string } | null;
  if (!req) {
    const { data: r } = await db().from("requests").select("status, return_by, share_uses, share_max_uses").eq("share_token", share).maybeSingle();
    throw new Error(r && r.status === "open" && new Date(r.return_by) > new Date() ? `This link has been used ${r.share_max_uses} of ${r.share_max_uses} times. Ask the Principal to raise the limit.` : "This Request is closed.");
  }
  const release = async (msg: string) => { await db().rpc("release_share_seat", { req: req.id }); throw new Error(msg); };
  const { count } = await db().from("appointments").select("id", { count: "exact", head: true }).eq("cabinet_id", req.cabinet_id);
  if ((count ?? 0) >= 25) await release("This Cabinet is full (25 Secretaries).");
  const { count: today } = await db().from("dispatches").select("id, requests!inner(principal_id)", { count: "exact", head: true })
    .eq("requests.principal_id", req.principal_id).gte("sent_at", new Date(Date.now() - 86400e3).toISOString());
  if ((today ?? 0) >= 50) await release("This Principal's daily Dispatch limit is reached. Try tomorrow.");
  const { data: appt, error } = await db().from("appointments").insert({ cabinet_id: req.cabinet_id, email, display_name: name }).select("id").single();
  if (error || !appt) await release(error?.code === "23505" ? "Someone with that email already joined this Cabinet. Use the link from your email, or join without an email." : error?.message ?? "Could not take a seat.");
  const { token, hash } = newToken();
  const { data: d, error: dErr } = await db().from("dispatches").insert({ request_id: req.id, appointment_id: appt!.id, token_hash: hash, status: "accepted" }).select("id").single();
  if (dErr || !d) await release(dErr?.message ?? "Could not create the Dispatch.");
  await audit(email ?? name, "dispatch", "dispatch", d!.id);
  return token;
}
