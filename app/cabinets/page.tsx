import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { ActionForm } from "@/components/ActionForm";
import { convene } from "@/lib/actions";

export default async function Cabinets() {
  const { supabase } = await requireUser();
  const { data: cabinets } = await supabase.from("cabinets").select("id, name, purpose, created_at, appointments(count)").order("created_at", { ascending: false });
  return (
    <>
      <p className="docno">Principal</p>
      <h1>Your Cabinets</h1>
      {cabinets?.length ? (
        <table><thead><tr><th>Cabinet</th><th>Secretaries</th><th>Convened</th></tr></thead>
          <tbody>{cabinets.map((c) => <tr key={c.id}><td><Link href={`/cabinets/${c.id}`}>{c.name}</Link>{c.purpose && <div className="small" style={{ color: "var(--muted)" }}>{c.purpose}</div>}</td><td>{(c.appointments as unknown as { count: number }[])[0]?.count ?? 0}</td><td>{new Date(c.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>
      ) : <p>You have not convened a Cabinet yet.</p>}

      <h2>Convene a Cabinet</h2>
      <ActionForm action={convene} submit="Convene">
        <label htmlFor="name">Name</label>
        <input id="name" type="text" name="name" required maxLength={120} placeholder="Kitchen Cabinet" />
        <label htmlFor="purpose">Purpose <small>optional, shown to you only</small></label>
        <input id="purpose" type="text" name="purpose" maxLength={500} placeholder="Infrastructure decisions for the ad-ops platform" />
        <label htmlFor="secretaries">Secretaries <small>one per line: email, name, portfolio. Or just a name; they take their seat by share link. Up to 25. You can also leave this empty.</small></label>
        <textarea id="secretaries" name="secretaries" placeholder={"ada@example.com, Ada, Secretary of Databases\nLin\nmarcus@example.com, Marcus"} />
      </ActionForm>
    </>
  );
}
