import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { ActionForm } from "@/components/ActionForm";
import { convene } from "@/lib/actions";

export default async function Cabinets() {
  const { supabase } = await requireUser();
  const { data: cabinets } = await supabase.from("cabinets").select("id, name, created_at, appointments(count)").order("created_at", { ascending: false });
  return (
    <>
      <p className="docno">Principal</p>
      <h1>Your Cabinets</h1>
      {cabinets?.length ? (
        <table><thead><tr><th>Cabinet</th><th>Secretaries</th><th>Convened</th></tr></thead>
          <tbody>{cabinets.map((c) => <tr key={c.id}><td><Link href={`/cabinets/${c.id}`}>{c.name}</Link></td><td>{(c.appointments as unknown as { count: number }[])[0]?.count ?? 0}</td><td>{new Date(c.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>
      ) : <p>You have not convened a Cabinet yet.</p>}

      <h2>Convene a Cabinet</h2>
      <ActionForm action={convene} submit="Convene">
        <label htmlFor="name">Name</label>
        <input id="name" type="text" name="name" required maxLength={120} placeholder="Kitchen Cabinet" />
        <label htmlFor="secretaries">Secretaries <small>one per line: email, name, portfolio (optional). Up to 25.</small></label>
        <textarea id="secretaries" name="secretaries" placeholder={"ada@example.com, Ada, Secretary of Databases\nlin@example.com, Lin"} />
      </ActionForm>
    </>
  );
}
