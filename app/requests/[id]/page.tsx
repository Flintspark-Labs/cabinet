import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { rateOpinion, pinRequest, setShareMax } from "@/lib/actions";
import { ShareBox } from "@/components/ShareBox";
import { AutoRefresh } from "@/components/AutoRefresh";
import { open } from "@/lib/seal";
import { Stamp } from "@/components/Stamp";
import { CopyButton } from "@/components/CopyButton";
import { appUrl, KIND_LABEL, type RequestKind, CLASSES, rfcNumber, STATUS_LABEL, BASIS_LABEL, AUTHORSHIP_LABEL, type RfcClass } from "@/lib/classes";

export default async function BriefingRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: r } = await supabase.from("requests")
    .select("id, rfc_number, class, question, context, return_by, status, pinned, share_token, share_uses, share_max_uses, kind, nest_url, cabinet:cabinets(id, name), principal:profiles(display_name), dispatches(id, status, sent_at, resolved_at, appointment:appointments(display_name, portfolio), opinion:opinions(id, body, documents, basis, authorship, signed_at, rating)), brief:briefs(body, model, created_at)")
    .eq("id", id).maybeSingle();
  if (!r) notFound();
  r.question = open(r.question); r.context = open(r.context);
  type D = { id: string; status: string; sent_at: string; resolved_at: string | null; appointment: { display_name: string; portfolio: string | null }; opinion: { id: string; body: string; documents: string | null; basis: keyof typeof BASIS_LABEL; authorship: keyof typeof AUTHORSHIP_LABEL; signed_at: string; rating: number | null } | null };
  const dispatches = r.dispatches as unknown as D[];
  const cabinet = r.cabinet as unknown as { id: string; name: string };
  const brief = r.brief as unknown as { body: string; model: string; created_at: string } | null;
  const signed = dispatches.filter((d) => d.opinion?.signed_at);
  for (const d of signed) { d.opinion!.body = open(d.opinion!.body); d.opinion!.documents = d.opinion!.documents ? open(d.opinion!.documents) : null; }
  const bundle = signed.map((d) => d.opinion!.documents).filter(Boolean).join("\n\n");
  if (brief) brief.body = open(brief.body);
  return (
    <>
      <p className="docno"><Link href="/cabinets">Cabinets</Link> / <Link href={`/cabinets/${cabinet.id}`}>{cabinet.name}</Link> / Briefing Room</p>
      <p className="docno">{KIND_LABEL[r.kind as RequestKind]}{r.nest_url && <> · <a href={r.nest_url}>ContextNest</a></>}</p>
      <h1>{rfcNumber(r.rfc_number)} · {CLASSES[r.class as RfcClass].label}</h1>
      <p className="lede">{r.question}</p>
      {r.context && <p><em>Context shared:</em> {r.context}</p>}
      <p className="status">{r.status} · return by {new Date(r.return_by).toUTCString()}</p>
      <form action={pinRequest} style={{ margin: 0 }}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="pinned" value={String(!r.pinned)} />
        <button className="secondary" style={{ fontSize: "0.85rem", padding: "0.2rem 0.6rem" }}>{r.pinned ? "Unpin (delete 30 days after close)" : "Pin (keep past 30 days)"}</button></form>

      {r.status === "open" && <AutoRefresh seconds={10} />}
      <h2>Share this Request</h2>
      <p>Send this in a group chat, a text, wherever your people are. No emails to collect.</p>
      <ShareBox link={`${appUrl()}/r/${r.share_token}`} principal={(r.principal as unknown as { display_name: string | null })?.display_name ?? "A Principal"} rfc={rfcNumber(r.rfc_number)} cls={CLASSES[r.class as RfcClass].label} question={r.question} returnBy={new Date(r.return_by).toUTCString()} uses={r.share_uses} max={r.share_max_uses} requestId={r.id} setMax={setShareMax} />

      <h2>Dispatches</h2>
      <table><thead><tr><th>Secretary</th><th>Portfolio</th><th>Status</th><th>Resolved</th></tr></thead>
        <tbody>{dispatches.map((d) => <tr key={d.id}><td>{d.appointment.display_name}</td><td>{d.appointment.portfolio ?? "—"}</td><td className={`status ${d.status}`}>{STATUS_LABEL[d.status]}</td><td>{d.resolved_at ? new Date(d.resolved_at).toLocaleString() : "—"}</td></tr>)}</tbody></table>

      <h2>Signed Opinions</h2>
      {signed.length === 0 && <p>No Opinion has been signed yet. Drafts never appear here.</p>}
      {signed.map((d) => {
        const o = d.opinion!;
        return (
          <article className="card stamped" key={d.id}>
            <h3 style={{ marginTop: 0 }}>{d.appointment.display_name}{d.appointment.portfolio ? `, ${d.appointment.portfolio}` : ""}</h3>
            <div className="labels"><span className="label">{BASIS_LABEL[o.basis]}</span><span className="label seal">{AUTHORSHIP_LABEL[o.authorship]}</span><span className="label">Signed {new Date(o.signed_at).toLocaleString()}</span></div>
            <div className="opinion" style={{ paddingBottom: o.documents ? "0.5rem" : "2.6rem" }}>{o.body}</div>
            {o.documents && <details style={{ marginBottom: "2.4rem" }}><summary>Documents for your ContextNest</summary><pre className="packet">{o.documents}</pre><p><CopyButton text={o.documents} label="Copy documents" /></p></details>}
            <Stamp text="Signed" sub={new Date(o.signed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} small />
            <form action={rateOpinion} className="rating" style={{ marginTop: "0.8rem" }}>
              <input type="hidden" name="id" value={o.id} /><input type="hidden" name="request_id" value={r.id} />
              <span className="docno" style={{ marginRight: "0.5rem" }}>Usefulness</span>
              {[1, 2, 3, 4, 5].map((n) => <button key={n} name="rating" value={n} className={o.rating === n ? "on" : ""}>{n}</button>)}
            </form>
          </article>
        );
      })}

      {r.kind === "context" && bundle && (<><h2>ContextNest bundle</h2><p>Every signed document in one block, ready to drop into your nest. A steward there approves each before it is used.</p><p><CopyButton text={bundle} label="Copy all documents" /></p></>)}

      <h2>The Brief</h2>
      {brief ? (<>
        <p className="docno">Compiled {new Date(brief.created_at).toUTCString()}</p>
        <div className="card brief">{brief.body.split("\n").map((line, i) => line.startsWith("#") ? <h3 key={i}>{line.replace(/^#+\s*/, "")}</h3> : line.trim() ? <p key={i}>{line.replace(/^[-*]\s+/, "• ")}</p> : null)}</div>
      </>) : <p>The Brief compiles when every Dispatch resolves or the return-by date passes.</p>}
    </>
  );
}
