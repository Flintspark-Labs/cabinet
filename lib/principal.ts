import "server-only";
import { db } from "./supabase/admin";
import { newToken } from "./token";
import { audit } from "./audit";
import { sendMail } from "./mail";
import { dispatchEmail } from "@/emails/dispatch";
import { appUrl, rfcNumber, CLASSES, type RfcClass } from "./classes";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Secretary = { email: string; name: string; portfolio?: string | null };

const cleanEmail = (e: string) => e.trim().toLowerCase();
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;

// Principal writes go through the user's own RLS client. Returns the cabinet id.
export async function conveneCabinet(supabase: SupabaseClient, userId: string, name: string, secretaries: Secretary[]) {
  name = name.trim();
  if (!name) throw new Error("A Cabinet needs a name.");
  const { data: cab, error } = await supabase.from("cabinets").insert({ principal_id: userId, name }).select("id").single();
  if (error) throw new Error(error.message);
  for (const s of secretaries) await appoint(supabase, cab.id, s);
  await audit(userId, "convene", "cabinet", cab.id);
  return cab.id as string;
}

export async function appoint(supabase: SupabaseClient, cabinetId: string, s: Secretary) {
  const email = cleanEmail(s.email);
  const name = s.name.trim();
  if (!validEmail(email) || !name) throw new Error(`Secretary needs a valid email and a name (${s.email}).`);
  const { count } = await supabase.from("appointments").select("id", { count: "exact", head: true }).eq("cabinet_id", cabinetId);
  if ((count ?? 0) >= 25) throw new Error("A Cabinet holds at most 25 Secretaries.");
  const row = { cabinet_id: cabinetId, email, display_name: name, portfolio: s.portfolio?.trim() || null };
  const { data: existing } = await supabase.from("appointments").select("id").eq("cabinet_id", cabinetId).eq("email", email).maybeSingle();
  const { error } = existing ? await supabase.from("appointments").update(row).eq("id", existing.id) : await supabase.from("appointments").insert(row);
  if (error) throw new Error(error.message);
}

export async function issueRequest(supabase: SupabaseClient, userId: string, input: { cabinet_id: string; question: string; class: string; context: string; return_by?: string | null }) {
  const question = input.question.trim();
  if (!question) throw new Error("The question is required.");
  if (!(input.class in CLASSES)) throw new Error("Pick a class.");
  const days = 24 * 3600 * 1000;
  const returnBy = input.return_by ? new Date(input.return_by) : new Date(Date.now() + 7 * days);
  if (isNaN(returnBy.getTime()) || returnBy.getTime() < Date.now() + 1 * 3600 * 1000 || returnBy.getTime() > Date.now() + 30 * days)
    throw new Error("Return-by must be between one hour and 30 days from now.");

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
    principal_id: userId, cabinet_id: input.cabinet_id, question, class: input.class as RfcClass, context: input.context.trim(), return_by: returnBy.toISOString(),
  }).select("id, rfc_number, share_token").single();
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
    await sendMail(s.email, `Request for Counsel · ${rfcNumber(req.rfc_number)}`, dispatchEmail({
      first: !prior, secretary: s.display_name, principal: profile?.display_name ?? "A Principal", rfc_number: req.rfc_number,
      cls: input.class as RfcClass, question, return_by: returnBy.toISOString(), link: `${appUrl()}/d/${token}`, email: s.email,
    }));
    await audit(userId, "dispatch", "dispatch", d.id);
    sent++;
  }
  return { request_id: req.id as string, rfc_number: req.rfc_number as number, dispatch_count: sent, share_url: `${appUrl()}/r/${req.share_token}` };
}
