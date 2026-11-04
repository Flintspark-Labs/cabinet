import "server-only";
import { db } from "./supabase/admin";
import { newToken } from "./token";
import { audit } from "./audit";
import { sendMail } from "./mail";
import { dispatchEmail } from "@/emails/dispatch";
import { inviteEmail } from "@/emails/invite";
import { appUrl, rfcNumber, CLASSES, type RfcClass, type RequestKind } from "./classes";
import type { SupabaseClient } from "@supabase/supabase-js";
import { seal } from "./seal";

export type Secretary = { email?: string | null; name: string; portfolio?: string | null };

const cleanEmail = (e: string) => e.trim().toLowerCase();
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;

// Principal writes go through the user's own RLS client. Returns the cabinet id.
export async function conveneCabinet(supabase: SupabaseClient, userId: string, name: string, secretaries: Secretary[], purpose?: string | null) {
  name = name.trim();
  if (!name) throw new Error("A Cabinet needs a name.");
  const { data: cab, error } = await supabase.from("cabinets").insert({ principal_id: userId, name, purpose: purpose?.trim().slice(0, 500) || null }).select("id").single();
  if (error) throw new Error(error.message);
  for (const s of secretaries) await appoint(supabase, cab.id, s);
  await audit(userId, "convene", "cabinet", cab.id);
  return cab.id as string;
}

export async function appoint(supabase: SupabaseClient, cabinetId: string, s: Secretary) {
  // Email optional: a name-only Secretary takes their seat through the Request's share link.
  const email = s.email ? cleanEmail(s.email) : null;
  const name = s.name.trim();
  if (!name || (email && !validEmail(email))) throw new Error(`Secretary needs a name and, if given, a valid email (${s.name || s.email}).`);
  const { count } = await supabase.from("appointments").select("id", { count: "exact", head: true }).eq("cabinet_id", cabinetId);
  if ((count ?? 0) >= 25) throw new Error("A Cabinet holds at most 25 Secretaries.");
  const row = { cabinet_id: cabinetId, email, display_name: name, portfolio: s.portfolio?.trim() || null };
  const { data: existing } = email ? await supabase.from("appointments").select("id").eq("cabinet_id", cabinetId).eq("email", email).maybeSingle() : { data: null };
  const { error } = existing ? await supabase.from("appointments").update(row).eq("id", existing.id) : await supabase.from("appointments").insert(row);
  if (error) throw new Error(error.message);
  // First appointment by email gets an invitation explaining the role and the optional one-time setup.
  if (email && !existing && !(await db().from("do_not_dispatch").select("email").eq("email", email).maybeSingle()).data) {
    const { data: cab } = await supabase.from("cabinets").select("name, principal:profiles(display_name)").eq("id", cabinetId).single();
    const principal = (cab?.principal as unknown as { display_name: string | null } | null)?.display_name ?? "A Principal";
    try { await sendMail(email, `${principal} appointed you to their Cabinet`, inviteEmail({ secretary: name, principal, cabinet: cab?.name ?? "their Cabinet", portfolio: row.portfolio, email })); } catch (e) { console.error("invite mail failed:", (e as Error).message); }
  }
}

export async function issueRequest(supabase: SupabaseClient, userId: string, input: { cabinet_id: string; question: string; class: string; context: string; return_by?: string | null; share_max_uses?: number | null; kind?: RequestKind | null; nest_url?: string | null }) {
  const question = input.question.trim();
  if (!question) throw new Error("The question is required.");
  if (!(input.class in CLASSES)) throw new Error("Pick a class.");
  const days = 24 * 3600 * 1000;
  const kind: RequestKind = input.kind === "context" ? "context" : "counsel";
  const nestUrl = input.nest_url?.trim() || null;
  if (nestUrl && !/^https?:\/\/[^\s]{1,490}$/.test(nestUrl)) throw new Error("The ContextNest link must be an http(s) URL.");
  const returnBy = input.return_by ? new Date(input.return_by) : new Date(Date.now() + (kind === "context" ? 14 : 7) * days);
  if (isNaN(returnBy.getTime()) || returnBy.getTime() < Date.now() + 1 * 3600 * 1000 || returnBy.getTime() > Date.now() + 30 * days)
    throw new Error("Return-by must be between one hour and 30 days from now.");
  const shareMax = input.share_max_uses == null ? 10 : Math.floor(Number(input.share_max_uses));
  if (!Number.isFinite(shareMax) || shareMax < 0 || shareMax > 25) throw new Error("Share link uses must be between 0 and 25.");

  const { data: secretaries, error: aErr } = await supabase.from("appointments").select("id, email, display_name, portfolio").eq("cabinet_id", input.cabinet_id);
  if (aErr) throw new Error(aErr.message);

  // 50 Dispatches per Principal per day (Article IX).
  const { count } = await db().from("dispatches").select("id, requests!inner(principal_id)", { count: "exact", head: true })
    .eq("requests.principal_id", userId).gte("sent_at", new Date(Date.now() - days).toISOString());
  if ((count ?? 0) + secretaries.length > 50) throw new Error("Daily Dispatch limit reached (50). Try again tomorrow.");

  const mailable = secretaries.filter((s): s is typeof s & { email: string } => !!s.email);
  const { data: optedOut } = await db().from("do_not_dispatch").select("email").in("email", mailable.map((s) => s.email));
  const skip = new Set((optedOut ?? []).map((o) => o.email.toLowerCase()));

  const { data: req, error } = await supabase.from("requests").insert({
    principal_id: userId, cabinet_id: input.cabinet_id, question: seal(question), class: input.class as RfcClass, context: seal(input.context.trim()), return_by: returnBy.toISOString(), share_max_uses: shareMax, kind, nest_url: nestUrl,
  }).select("id, rfc_number, share_token, share_max_uses").single();
  if (error) throw new Error(error.message);
  await audit(userId, "issue", "request", req.id);

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", userId).single();
  let sent = 0;
  for (const s of mailable) {
    if (skip.has(s.email.toLowerCase())) continue;
    const { token, hash } = newToken();
    const { data: d, error: dErr } = await db().from("dispatches").insert({ request_id: req.id, appointment_id: s.id, token_hash: hash }).select("id").single();
    if (dErr) throw new Error(dErr.message);
    const { count: prior } = await db().from("dispatches").select("id, appointments!inner(email)", { count: "exact", head: true }).eq("appointments.email", s.email).neq("id", d.id);
    await sendMail(s.email, `${kind === "context" ? "Request for Context" : "Request for Counsel"} · ${rfcNumber(req.rfc_number)}`, dispatchEmail({
      first: !prior, secretary: s.display_name, principal: profile?.display_name ?? "A Principal", rfc_number: req.rfc_number,
      cls: input.class as RfcClass, question, return_by: returnBy.toISOString(), link: `${appUrl()}/d/${token}`, email: s.email,
    }));
    await audit(userId, "dispatch", "dispatch", d.id);
    sent++;
  }
  return { request_id: req.id as string, rfc_number: req.rfc_number as number, dispatch_count: sent, share_url: `${appUrl()}/r/${req.share_token}`, share_max_uses: req.share_max_uses as number };
}
