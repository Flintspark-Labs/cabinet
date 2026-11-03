import "server-only";
import { db } from "./supabase/admin";
import { hashToken } from "./token";
import { audit } from "./audit";
import { dispatchPacket } from "./packet";
import { maybeCompileBrief } from "./brief";
import { sendMail } from "./mail";
import { opinionSignedEmail } from "@/emails/opinion-signed";
import { appUrl, rfcNumber, type RfcClass } from "./classes";

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
export async function submitDraft(token: string, body: string, basis: "record" | "general", authorship: "own_hand" | "staff_drafted", channel: "paper" | "secure_line") {
  const d = await dispatchByToken(token);
  if (!d || !isOpen(d)) throw new Error("This Dispatch is closed.");
  body = body.trim();
  if (!body || body.length > 6000) throw new Error("The Opinion must be between 1 and 6,000 characters.");
  if (!["record", "general"].includes(basis) || !["own_hand", "staff_drafted"].includes(authorship)) throw new Error("Both labels are required.");
  const { data: op, error } = await db().from("opinions").upsert({ dispatch_id: d.id, body, basis, authorship, signed_at: null }, { onConflict: "dispatch_id" }).select("id").single();
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
