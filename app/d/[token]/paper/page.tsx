import Link from "next/link";
import { dispatchByToken, isOpen, packetFor } from "@/lib/secretary";
import { submitPaperOpinion } from "@/lib/actions";
import { ActionForm } from "@/components/ActionForm";
import { CopyButton } from "@/components/CopyButton";
import { rfcNumber, BODY_MAX } from "@/lib/classes";

export default async function Paper({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const d = await dispatchByToken(token);
  if (!d || !isOpen(d)) return <><h1>Dispatch closed</h1><p><Link href={`/d/${token}`}>Back</Link></p></>;
  const packet = packetFor(d, token);
  const ctx = d.request.kind === "context";
  const max = BODY_MAX[d.request.kind];
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
          <p><strong>Claude.</strong> Open a chat where Claude can reach your files, mail or notes (Claude Desktop, claude.ai with connectors, or Claude Code). Paste the packet. It hands back one block. Copy it, paste it below.</p>
          <p><strong>ChatGPT.</strong> Open a chat with memory and any connected apps on. Paste the packet. Review the draft. Paste it below.</p>
          <p><strong>Gemini.</strong> Open Gemini with Workspace extensions on. Paste the packet. Review the draft. Paste it below.</p>
          <p><strong>Any other assistant.</strong> Paste the packet, ask it to follow the Standing Orders, review, paste below.</p>
          <p><strong>No assistant.</strong> Write the Opinion yourself and mark it In Own Hand.</p>
        </div>
      </div>

      <h2>{ctx ? "File your contribution" : "File the Opinion"}</h2>
      <p>Paste your assistant's whole reply, or write your own. If the paste starts with its Basis line we read it. Submitting creates an unsigned draft and opens the signing page. Nothing reaches the Principal until you sign there.</p>
      <ActionForm action={submitPaperOpinion} submit="Continue to signing">
        <input type="hidden" name="token" value={token} />
        <label htmlFor="body">{ctx ? "Response" : "Opinion"} <small>plain text, up to {max.toLocaleString()} characters. Paste the full block; the Basis line{ctx ? ", “Response:” label and the Documents section" : " and “Opinion:” label"} are handled.</small></label>
        <textarea id="body" name="body" required maxLength={max + 400000} style={{ minHeight: "14rem" }} defaultValue={d.opinion?.body ?? ""} />
        {ctx && (<>
          <label htmlFor="documents">Documents for the ContextNest <small>optional if they are already in the paste above. Markdown with frontmatter, one after another.</small></label>
          <textarea id="documents" name="documents" maxLength={400000} style={{ minHeight: "10rem", fontFamily: "var(--mono)", fontSize: "0.85rem" }} defaultValue={d.opinion?.documents ?? ""} />
        </>)}
        <fieldset><legend>Basis</legend>
          <label><input type="radio" name="basis" value="record" defaultChecked={d.opinion?.basis === "record"} /> From the Record (your own history)</label>
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
