import Link from "next/link";
import { dispatchByToken, isOpen } from "@/lib/secretary";
import { acceptDispatch, recuseDispatch } from "@/lib/actions";
import { CLASSES, rfcNumber, STATUS_LABEL } from "@/lib/classes";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Stamp } from "@/components/Stamp";

export default async function DispatchPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ signed?: string }> }) {
  const { token } = await params;
  const { signed } = await searchParams;
  const d = await dispatchByToken(token);
  if (!d) return <><h1>No such Dispatch</h1><p>This link is not valid. It may have been mistyped, or the Request may have been deleted.</p></>;
  const principal = d.request.principal.display_name ?? "A Principal";
  return (
    <>
      <p className="docno">Cabinet Dispatch · {rfcNumber(d.request.rfc_number)}</p>
      <h1>Request for Counsel</h1>
      <p>Dear {d.appointment.display_name}{d.appointment.portfolio ? `, ${d.appointment.portfolio}` : ""}: <strong>{principal}</strong> asks for your counsel.</p>
      <div className={`card${d.status === "signed" || d.status === "recused" ? " stamped" : ""}${signed ? " shake" : ""}`}>
        <p className="docno">{CLASSES[d.request.class].label} · return by {new Date(d.request.return_by).toUTCString()}</p>
        <p className="lede">{d.request.question}</p>
        {d.request.context && <p><em>Context from the Principal:</em> {d.request.context}</p>}
        {d.status === "signed" && <Stamp text="Signed" sub={`${rfcNumber(d.request.rfc_number)} · filed ${new Date(d.opinion?.signed_at ?? Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`} slam={!!signed} />}
        {d.status === "recused" && <Stamp text="Recused" sub={rfcNumber(d.request.rfc_number)} slam />}
      </div>
      {signed && <p className="notice">Your Opinion is signed and filed. {principal} has been notified. Thank you.</p>}
      <p className="status">Status: {STATUS_LABEL[d.status]}</p>
      {isOpen(d) && <AutoRefresh />}
      {d.status === "drafted" && <div className="notice"><p>A draft Opinion is filed and waiting for your signature. <Link href={`/d/${token}/sign`}>Review and sign</Link>.</p></div>}

      {isOpen(d) && (<>
        <h2>Accept or recuse</h2>
        <p>Accepting opens the Dispatch Packet. Copy it into your own AI; it reads your record on your side and hands back a draft you paste here and sign. Nothing reaches the Cabinet Office until you sign. You may recuse without giving a reason.</p>
        <div className="grid">
          <form action={acceptDispatch} className="card"><input type="hidden" name="token" value={token} /><input type="hidden" name="channel" value="paper" />
            <h3 style={{ marginTop: 0 }}>The Paper Process</h3><p>Copy the packet, paste it into Claude, ChatGPT, Gemini or any assistant, paste its reply back here. Works with anything. Recommended.</p><button>Accept · Paper Process</button></form>
          <form action={acceptDispatch} className="card"><input type="hidden" name="token" value={token} /><input type="hidden" name="channel" value="secure_line" />
            <h3 style={{ marginTop: 0 }}>The Secure Line</h3><p>Only if your AI client already has The Cabinet connected over MCP: it fetches the Dispatch and files the draft itself. You still sign here.</p><button className="secondary">Accept · Secure Line</button></form>
        </div>
        <form action={recuseDispatch}><input type="hidden" name="token" value={token} /><button className="secondary">Recuse</button></form>
        {d.status !== "sent" && <p><Link href={`/d/${token}/paper`}>Open the Dispatch Packet</Link> · <Link href={`/d/${token}/sign`}>Go to signing</Link></p>}
      </>)}
      {d.status === "recused" && <p>You have recused. Nothing further is needed.</p>}
      {d.status === "expired" && <p>The return-by date has passed. This Dispatch is closed.</p>}
      {d.status === "signed" && !signed && <p>You signed this Opinion. Thank you.</p>}
    </>
  );
}
