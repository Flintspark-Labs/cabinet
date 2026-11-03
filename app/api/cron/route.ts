import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/supabase/admin";
import { maybeCompileBrief } from "@/lib/brief";
import { sendMail } from "@/lib/mail";
import { reminderEmail } from "@/emails/dispatch";
import { rfcNumber, appUrl } from "@/lib/classes";

export const maxDuration = 300;

// The Clock (Article VII.3). Hourly: expire stale Dispatches, send reminders, close RFCs past return-by, compile Briefs, apply retention.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized", { status: 401 });
  const now = new Date();
  const out: Record<string, number> = { expired: 0, reminded: 0, briefed: 0, deleted: 0 };

  // Reminders 48 hours before return-by. shortcut: an hourly window instead of a reminded_at column; if the cron drifts, a reminder can be skipped or doubled.
  const { data: due } = await db().from("dispatches")
    .select("id, request:requests!inner(id, rfc_number, return_by), appointment:appointments!inner(email, display_name)")
    .in("status", ["sent", "accepted", "drafted"])
    .gte("requests.return_by", new Date(now.getTime() + 47 * 3600e3).toISOString())
    .lt("requests.return_by", new Date(now.getTime() + 48 * 3600e3).toISOString());
  for (const d of due ?? []) {
    const r = d.request as unknown as { id: string; rfc_number: number; return_by: string };
    const a = d.appointment as unknown as { email: string; display_name: string };
    // The token is never stored, so the reminder links to the Request page the Secretary already has in their first email.
    await sendMail(a.email, `Reminder · ${rfcNumber(r.rfc_number)} returns in 48 hours`, reminderEmail({ secretary: a.display_name, rfc_number: r.rfc_number, return_by: r.return_by, link: "Use the link in your original Dispatch email.", email: a.email }));
    out.reminded++;
  }

  // Expire, close and compile for every open RFC past return-by.
  const { data: overdue } = await db().from("requests").select("id").eq("status", "open").lt("return_by", now.toISOString());
  for (const r of overdue ?? []) {
    const { count } = await db().from("dispatches").update({ status: "expired", resolved_at: now.toISOString() }, { count: "exact" }).eq("request_id", r.id).in("status", ["sent", "accepted", "drafted"]);
    out.expired += count ?? 0;
    await maybeCompileBrief(r.id);
    out.briefed++;
  }

  // Retention: delete 180 days after close unless pinned (Article IX.2). Dispatches and Opinions cascade.
  const { data: old } = await db().from("requests").select("id").eq("status", "closed").eq("pinned", false).lt("return_by", new Date(now.getTime() - 180 * 86400e3).toISOString());
  for (const r of old ?? []) {
    await db().from("requests").delete().eq("id", r.id);
    await db().from("audit_log").insert({ actor: "clock", action: "delete", entity: "request", entity_id: r.id });
    out.deleted++;
  }
  return NextResponse.json(out);
}
