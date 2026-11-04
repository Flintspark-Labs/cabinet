import { db } from "@/lib/supabase/admin";
import { ActionForm } from "@/components/ActionForm";
import { joinRequest } from "@/lib/actions";
import { CLASSES, rfcNumber, type RfcClass } from "@/lib/classes";
import { open } from "@/lib/seal";

export default async function Join({ params }: { params: Promise<{ share: string }> }) {
  const { share } = await params;
  const { data: r } = share.length <= 64 ? await db().from("requests").select("rfc_number, class, question, context, return_by, status, share_uses, share_max_uses, principal:profiles(display_name)").eq("share_token", share).maybeSingle() : { data: null };
  if (!r) return <><h1>No such Request</h1><p>This link is not valid.</p></>;
  const principal = (r.principal as unknown as { display_name: string | null })?.display_name ?? "A Principal";
  const closed = r.status !== "open" || new Date(r.return_by) < new Date();
  const full = r.share_uses >= r.share_max_uses;
  return (
    <>
      <p className="docno">Request for Counsel · {rfcNumber(r.rfc_number)}</p>
      <h1>{principal} asks for your counsel</h1>
      <div className="card">
        <p className="docno">{CLASSES[r.class as RfcClass].label} · return by {new Date(r.return_by).toUTCString()}</p>
        <p className="lede">{open(r.question)}</p>
        {open(r.context) && <p><em>Context from the Principal:</em> {open(r.context)}</p>}
      </div>
      {closed ? <p>This Request is closed.</p> : full ? <p>All {r.share_max_uses} seats on this link are taken. Ask {principal} for another.</p> : (<>
        <p>Give your name to take a seat as a Secretary on this Request. No account. Your own AI drafts from your own record; nothing reaches {principal} until you sign it. What you sign is encrypted and deleted 30 days after the question closes. Email is optional: with it we can send a reminder and your private link.</p>
        <ActionForm action={joinRequest} submit="Take a seat">
          <input type="hidden" name="share" value={share} />
          <label htmlFor="name">Your name</label><input id="name" type="text" name="name" required maxLength={120} />
          <label htmlFor="email">Email <small>optional</small></label><input id="email" type="email" name="email" />
        </ActionForm>
      </>)}
    </>
  );
}
