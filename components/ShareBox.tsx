import { CopyButton } from "./CopyButton";

// The Principal's share panel: the link and a ready-to-paste invitation.
export function ShareBox({ link, principal, rfc, cls, question, returnBy, uses, max, requestId, setMax }: { link: string; principal: string; rfc: string; cls: string; question: string; returnBy: string; uses: number; max: number; requestId: string; setMax: (f: FormData) => Promise<void> }) {
  const invitation = `${principal} is asking a few people they trust for counsel through The Cabinet.

${rfc} · ${cls}
“${question}”
Return by ${returnBy}.

Take a seat here: ${link}

Give your name, read the question, then either write your answer or paste the Dispatch Packet into your own AI (Claude, ChatGPT, Gemini, anything) so it drafts from your own notes and history. You review and sign before anything is sent. Nothing from your side is stored except the answer you sign; it is encrypted and deleted 30 days after the question closes. No account needed.`;
  return (
    <div className="card">
      <p className="docno">Share link · {uses} of {max} seats used{uses >= max ? " · used up" : ""}</p>
      <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}>
        <code style={{ wordBreak: "break-all", fontSize: "0.95rem" }}>{link}</code>
        <CopyButton text={link} label="Copy link" />
      </div>
      <p className="docno">Invitation, ready to paste</p>
      <pre className="packet" style={{ maxHeight: "none" }}>{invitation}</pre>
      <p><CopyButton text={invitation} label="Copy invitation" /></p>
      <p className="small">Anyone with the link can take a seat by giving their name, until the seats are used. Whoever opens it gets their own private Dispatch; nothing is sent to you until they sign.</p>
      <form action={setMax} style={{ margin: 0, display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <input type="hidden" name="id" value={requestId} />
        <label htmlFor="share_max_uses" style={{ margin: 0 }}>Seats</label>
        <input id="share_max_uses" type="number" name="share_max_uses" min={0} max={25} defaultValue={max} style={{ width: "5rem" }} />
        <button className="secondary" style={{ padding: "0.3rem 0.8rem" }}>Set</button>
      </form>
    </div>
  );
}
