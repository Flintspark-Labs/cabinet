import { requireUser } from "@/lib/supabase/server";
import { ActionForm } from "@/components/ActionForm";
import { issue } from "@/lib/actions";
import { CLASSES } from "@/lib/classes";

export default async function NewRequest({ searchParams }: { searchParams: Promise<{ cabinet?: string; kind?: string }> }) {
  const { cabinet, kind } = await searchParams;
  const context = kind === "context";
  const { supabase } = await requireUser();
  const { data: cabinets } = await supabase.from("cabinets").select("id, name").order("created_at");
  const defaultReturn = new Date(Date.now() + (context ? 14 : 7) * 86400000).toISOString().slice(0, 16);
  return (
    <>
      <p className="docno">Principal</p>
      <h1>{context ? "Issue a Request for Context" : "Issue a Request for Counsel"}</h1>
      {context
        ? <p>Ask your Secretaries to contribute to your <a href="/contextnest">ContextNest</a>: a thorough written response plus documents their AI assembles from their record, in ContextNest's Markdown shape. Longer limits, a two-week default. <a href={`/requests/new?cabinet=${cabinet ?? ""}`}>Switch to a Request for Counsel.</a></p>
        : <p>One question. Your Secretaries see the question, the class, and the context you add here. Nothing else. Appointed Secretaries are emailed; you also get a share link anyone can open to take a seat, no email required. <a href={`/requests/new?kind=context&cabinet=${cabinet ?? ""}`}>Or issue a Request for Context.</a></p>}
      <ActionForm action={issue} submit="Issue and dispatch">
        <input type="hidden" name="kind" value={context ? "context" : "counsel"} />
        <label htmlFor="cabinet_id">Cabinet</label>
        <select id="cabinet_id" name="cabinet_id" defaultValue={cabinet} required>{cabinets?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <label htmlFor="question">Question</label>
        <textarea id="question" name="question" required maxLength={2000} />
        <fieldset><legend>Class</legend>
          {Object.entries(CLASSES).map(([k, c], i) => <label key={k}><input type="radio" name="class" value={k} defaultChecked={i === 0} required /> <strong>{c.label}</strong> <small>&nbsp;“{c.example}”</small></label>)}
        </fieldset>
        {context && (<>
          <label htmlFor="nest_url">Your ContextNest <small>optional link, shown to Secretaries in the packet</small></label>
          <input id="nest_url" type="text" name="nest_url" placeholder="https://…" maxLength={500} />
        </>)}
        <label htmlFor="context">Context to share <small>optional</small></label>
        <textarea id="context" name="context" maxLength={4000} />
        <label htmlFor="return_by">Return by <small>default 7 days, maximum 30</small></label>
        <input id="return_by" type="datetime-local" name="return_by" defaultValue={defaultReturn} />
        <label htmlFor="share_max_uses">Share link seats <small>how many people may take a seat through the share link. 0 disables it. Default 10, maximum 25.</small></label>
        <input id="share_max_uses" type="number" name="share_max_uses" min={0} max={25} defaultValue={10} style={{ width: "6rem" }} />
      </ActionForm>
    </>
  );
}
