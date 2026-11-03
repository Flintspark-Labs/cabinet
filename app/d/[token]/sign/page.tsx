import Link from "next/link";
import { dispatchByToken, isOpen } from "@/lib/secretary";
import { signOpinion } from "@/lib/actions";
import { ActionForm } from "@/components/ActionForm";
import { rfcNumber } from "@/lib/classes";

export default async function Sign({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const d = await dispatchByToken(token);
  if (!d || !isOpen(d)) return <><h1>Dispatch closed</h1><p><Link href={`/d/${token}`}>Back</Link></p></>;
  if (!d.opinion) return <><h1>No draft yet</h1><p>File a draft first: <Link href={`/d/${token}/paper`}>the Paper Process</Link>, or submit one over the Secure Line.</p></>;
  return (
    <>
      <p className="docno"><Link href={`/d/${token}`}>{rfcNumber(d.request.rfc_number)}</Link> / Signing</p>
      <h1>Review and sign</h1>
      <p className="lede">{d.request.question}</p>
      <p>Read every line. Remove anything you would not say to {d.request.principal.display_name ?? "the Principal"} in person. Names, figures and anything confidential should already be gone; check. Signing is the only act that sends the Opinion.</p>
      <ActionForm action={signOpinion} submit="Sign and send">
        <input type="hidden" name="token" value={token} />
        <label htmlFor="body">Opinion</label>
        <textarea id="body" name="body" required maxLength={6000} style={{ minHeight: "18rem" }} defaultValue={d.opinion.body} />
        <fieldset><legend>Basis</legend>
          <label><input type="radio" name="basis" value="record" required defaultChecked={d.opinion.basis === "record"} /> From the Record</label>
          <label><input type="radio" name="basis" value="general" defaultChecked={d.opinion.basis === "general"} /> General Counsel</label>
        </fieldset>
        <fieldset><legend>Signature</legend>
          <label><input type="radio" name="authorship" value="staff_drafted" required defaultChecked={d.opinion.authorship === "staff_drafted"} /> Staff-Drafted, Signed</label>
          <label><input type="radio" name="authorship" value="own_hand" defaultChecked={d.opinion.authorship === "own_hand"} /> In Own Hand</label>
        </fieldset>
        <p className="docno">Signed by {d.appointment.display_name} ({d.appointment.email})</p>
      </ActionForm>
    </>
  );
}
