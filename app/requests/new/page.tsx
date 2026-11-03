import { requireUser } from "@/lib/supabase/server";
import { ActionForm } from "@/components/ActionForm";
import { issue } from "@/lib/actions";
import { CLASSES } from "@/lib/classes";

export default async function NewRequest({ searchParams }: { searchParams: Promise<{ cabinet?: string }> }) {
  const { cabinet } = await searchParams;
  const { supabase } = await requireUser();
  const { data: cabinets } = await supabase.from("cabinets").select("id, name").order("created_at");
  const defaultReturn = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
  return (
    <>
      <p className="docno">Principal</p>
      <h1>Issue a Request for Counsel</h1>
      <p>One question. Your Secretaries see the question, the class, and the context you add here. Nothing else.</p>
      <ActionForm action={issue} submit="Issue and dispatch">
        <label htmlFor="cabinet_id">Cabinet</label>
        <select id="cabinet_id" name="cabinet_id" defaultValue={cabinet} required>{cabinets?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <label htmlFor="question">Question</label>
        <textarea id="question" name="question" required maxLength={2000} />
        <fieldset><legend>Class</legend>
          {Object.entries(CLASSES).map(([k, c], i) => <label key={k}><input type="radio" name="class" value={k} defaultChecked={i === 0} required /> <strong>{c.label}</strong> <small>&nbsp;“{c.example}”</small></label>)}
        </fieldset>
        <label htmlFor="context">Context to share <small>optional</small></label>
        <textarea id="context" name="context" maxLength={4000} />
        <label htmlFor="return_by">Return by <small>default 7 days, maximum 30</small></label>
        <input id="return_by" type="datetime-local" name="return_by" defaultValue={defaultReturn} />
      </ActionForm>
    </>
  );
}
