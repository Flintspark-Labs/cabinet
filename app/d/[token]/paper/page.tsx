import Link from "next/link";
import { dispatchByToken, isOpen, packetFor } from "@/lib/secretary";
import { submitPaperOpinion } from "@/lib/actions";
import { ActionForm } from "@/components/ActionForm";
import { CopyButton } from "@/components/CopyButton";
import { rfcNumber } from "@/lib/classes";

export default async function Paper({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const d = await dispatchByToken(token);
  if (!d || !isOpen(d)) return <><h1>Dispatch closed</h1><p><Link href={`/d/${token}`}>Back</Link></p></>;
  const packet = packetFor(d, token);
  return (
    <>
      <p className="docno"><Link href={`/d/${token}`}>{rfcNumber(d.request.rfc_number)}</Link> / The Paper Process</p>
      <h1>The Dispatch Packet</h1>
      <div className="grid">
        <div>
          <p><CopyButton text={packet} label="Copy the Dispatch Packet" /></p>
          <pre className="packet">{packet}</pre>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>How to use it</h3>
          <p><strong>Claude.</strong> Open a chat where Claude can reach your files, mail or notes (Claude Desktop, claude.ai with connectors, or Claude Code). Paste the packet. Review the draft. Paste it below.</p>
          <p><strong>ChatGPT.</strong> Open a chat with memory and any connected apps on. Paste the packet. Review the draft. Paste it below.</p>
          <p><strong>Gemini.</strong> Open Gemini with Workspace extensions on. Paste the packet. Review the draft. Paste it below.</p>
          <p><strong>Any other assistant.</strong> Paste the packet, ask it to follow the Standing Orders, review, paste below.</p>
          <p><strong>No assistant.</strong> Write the Opinion yourself and mark it In Own Hand.</p>
        </div>
      </div>

      <h2>File the Opinion</h2>
      <p>Submitting creates an unsigned draft and opens the signing page. Nothing reaches the Principal until you sign there.</p>
      <ActionForm action={submitPaperOpinion} submit="Continue to signing">
        <input type="hidden" name="token" value={token} />
        <label htmlFor="body">Opinion <small>plain text, up to 6,000 characters</small></label>
        <textarea id="body" name="body" required maxLength={6000} style={{ minHeight: "14rem" }} defaultValue={d.opinion?.body ?? ""} />
        <fieldset><legend>Basis</legend>
          <label><input type="radio" name="basis" value="record" required defaultChecked={d.opinion?.basis === "record"} /> From the Record (your own history)</label>
          <label><input type="radio" name="basis" value="general" defaultChecked={d.opinion?.basis === "general"} /> General Counsel (general knowledge)</label>
        </fieldset>
        <fieldset><legend>Signature</legend>
          <label><input type="radio" name="authorship" value="staff_drafted" required defaultChecked={d.opinion?.authorship !== "own_hand"} /> Staff-Drafted, Signed (your AI drafted it)</label>
          <label><input type="radio" name="authorship" value="own_hand" defaultChecked={d.opinion?.authorship === "own_hand"} /> In Own Hand (you wrote it)</label>
        </fieldset>
      </ActionForm>
    </>
  );
}
