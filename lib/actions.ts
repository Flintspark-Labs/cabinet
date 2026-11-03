"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, supabaseServer } from "./supabase/server";
import { db } from "./supabase/admin";
import * as P from "./principal";
import * as S from "./secretary";
import { appUrl } from "./classes";

const str = (f: FormData, k: string) => String(f.get(k) ?? "");
// Server actions return an error string the form shows; a successful one redirects.
type Result = { error?: string } | void;

export async function sendMagicLink(_: unknown, f: FormData): Promise<{ error?: string; sent?: boolean }> {
  const email = str(f, "email").trim();
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${appUrl()}/auth/callback` } });
  return error ? { error: error.message } : { sent: true };
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

export async function convene(_: unknown, f: FormData): Promise<Result> {
  const { supabase, user } = await requireUser();
  const secretaries = str(f, "secretaries").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [email, name, portfolio] = l.split(",").map((x) => x.trim());
    return { email, name: name || email.split("@")[0], portfolio };
  });
  let id: string;
  try { id = await P.conveneCabinet(supabase, user.id, str(f, "name"), secretaries); } catch (e) { return { error: (e as Error).message }; }
  redirect(`/cabinets/${id}`);
}

export async function appointSecretary(_: unknown, f: FormData): Promise<Result> {
  const { supabase } = await requireUser();
  const cabinetId = str(f, "cabinet_id");
  try { await P.appoint(supabase, cabinetId, { email: str(f, "email"), name: str(f, "name"), portfolio: str(f, "portfolio") }); } catch (e) { return { error: (e as Error).message }; }
  revalidatePath(`/cabinets/${cabinetId}`);
}

export async function removeSecretary(f: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("appointments").delete().eq("id", str(f, "id"));
  revalidatePath(`/cabinets/${str(f, "cabinet_id")}`);
}

export async function issue(_: unknown, f: FormData): Promise<Result> {
  const { supabase, user } = await requireUser();
  let r: { request_id: string };
  try {
    r = await P.issueRequest(supabase, user.id, { cabinet_id: str(f, "cabinet_id"), question: str(f, "question"), class: str(f, "class"), context: str(f, "context"), return_by: str(f, "return_by") || null });
  } catch (e) { return { error: (e as Error).message }; }
  redirect(`/requests/${r.request_id}`);
}

export async function rateOpinion(f: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("opinions").update({ rating: Number(str(f, "rating")) }).eq("id", str(f, "id"));
  revalidatePath(`/requests/${str(f, "request_id")}`);
}

export async function pinRequest(f: FormData) {
  const { supabase } = await requireUser();
  await supabase.from("requests").update({ pinned: str(f, "pinned") === "true" }).eq("id", str(f, "id"));
  revalidatePath(`/requests/${str(f, "id")}`);
}

export async function updateProfile(f: FormData) {
  const { supabase, user } = await requireUser();
  await supabase.from("profiles").update({ display_name: str(f, "display_name").trim().slice(0, 120) || null }).eq("id", user.id);
  revalidatePath("/account");
}

// Secretary actions: token in the form, no session.
export async function acceptDispatch(f: FormData) {
  const token = str(f, "token");
  const channel = str(f, "channel") === "secure_line" ? "secure_line" : "paper";
  await S.accept(token, channel);
  redirect(channel === "paper" ? `/d/${token}/paper` : `/connect?token=${token}`);
}

export async function recuseDispatch(f: FormData) {
  const token = str(f, "token");
  await S.recuse(token);
  revalidatePath(`/d/${token}`);
}

export async function submitPaperOpinion(_: unknown, f: FormData): Promise<Result> {
  const token = str(f, "token");
  try { await S.submitDraft(token, str(f, "body"), str(f, "basis") as "record", str(f, "authorship") as "own_hand", "paper"); } catch (e) { return { error: (e as Error).message }; }
  redirect(`/d/${token}/sign`);
}

export async function signOpinion(_: unknown, f: FormData): Promise<Result> {
  const token = str(f, "token");
  try { await S.sign(token, str(f, "body"), str(f, "basis") as "record", str(f, "authorship") as "own_hand"); } catch (e) { return { error: (e as Error).message }; }
  redirect(`/d/${token}?signed=1`);
}

export async function optOut(_: unknown, f: FormData): Promise<{ error?: string; done?: boolean }> {
  const email = str(f, "email").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  await db().from("do_not_dispatch").upsert({ email });
  await db().from("audit_log").insert({ actor: email, action: "opt_out", entity: "do_not_dispatch", entity_id: null });
  return { done: true };
}
