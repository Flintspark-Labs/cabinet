import { db } from "./supabase/admin";
import { BASIS_LABEL, AUTHORSHIP_LABEL, rfcNumber, appUrl } from "./classes";
import { sendMail } from "./mail";
import { briefReadyEmail } from "@/emails/brief-ready";

// Compile the Brief when every Dispatch has resolved or the return-by date has passed (Article III.9).
// The Cabinet Office runs no model. The Brief is every signed Opinion, attributed, with its labels;
// the Principal, or their own AI over the Secure Line, draws the conclusions.
export async function maybeCompileBrief(requestId: string) {
  const { data: req } = await db().from("requests").select("id, rfc_number, question, return_by, principal_id").eq("id", requestId).single();
  if (!req) return;
  const { data: dispatches } = await db().from("dispatches").select("id, status").eq("request_id", requestId);
  const unresolved = (dispatches ?? []).some((d) => ["sent", "accepted", "drafted"].includes(d.status));
  if (unresolved && new Date(req.return_by) > new Date()) return;

  const { data: opinions } = await db()
    .from("opinions")
    .select("body, basis, authorship, signed_at, dispatch:dispatches(appointment:appointments(display_name, portfolio))")
    .in("dispatch_id", (dispatches ?? []).map((d) => d.id))
    .not("signed_at", "is", null)
    .order("signed_at");

  const counts = (dispatches ?? []).reduce<Record<string, number>>((m, d) => ((m[d.status] = (m[d.status] ?? 0) + 1), m), {});
  const head = `# Brief · ${rfcNumber(req.rfc_number)}\n\n${req.question}\n\nDispatched ${dispatches?.length ?? 0} · signed ${counts.signed ?? 0} · recused ${counts.recused ?? 0} · expired ${counts.expired ?? 0}`;
  const body = !opinions?.length
    ? `${head}\n\nNo signed Opinions were received before the return-by date.`
    : `${head}\n\n` + opinions.map((o, i) => {
        const a = (o.dispatch as unknown as { appointment: { display_name: string; portfolio: string | null } }).appointment;
        return `## ${i + 1}. ${a.display_name}${a.portfolio ? `, ${a.portfolio}` : ""}\n${BASIS_LABEL[o.basis as keyof typeof BASIS_LABEL]} · ${AUTHORSHIP_LABEL[o.authorship as keyof typeof AUTHORSHIP_LABEL]} · signed ${new Date(o.signed_at!).toUTCString()}\n\n${o.body}`;
      }).join("\n\n");

  await db().from("briefs").upsert({ request_id: requestId, body, model: "none" }, { onConflict: "request_id" });
  await db().from("requests").update({ status: "closed" }).eq("id", requestId);
  const { data: u } = await db().auth.admin.getUserById(req.principal_id);
  if (u.user?.email) await sendMail(u.user.email, `Brief ready · ${rfcNumber(req.rfc_number)}`, briefReadyEmail(req.rfc_number, `${appUrl()}/requests/${req.id}`));
}
