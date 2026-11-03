import { requireUser } from "@/lib/supabase/server";
import { updateProfile, revokePat } from "@/lib/actions";
import { PatForm } from "@/components/PatForm";

export default async function Account() {
  const { supabase, user } = await requireUser();
  const { data: p } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
  const { data: pats } = await supabase.from("personal_access_tokens").select("id, name, created_at, last_used_at").order("created_at");
  return (
    <>
      <p className="docno">Principal</p>
      <h1>Account</h1>
      <p>Signed in as {user.email}. Secretaries see the name below on every Dispatch.</p>
      <form action={updateProfile}>
        <label htmlFor="display_name">Display name</label>
        <input id="display_name" type="text" name="display_name" defaultValue={p?.display_name ?? ""} maxLength={120} />
        <p><button>Save</button></p>
      </form>

      <h2>Personal access tokens</h2>
      <p>Let your own AI convene Cabinets, issue Requests and read Opinions over the Secure Line. Send a token as <code>Authorization: Bearer</code> to <code>/api/mcp</code>. Revoke any token here.</p>
      {pats?.length ? (
        <table><thead><tr><th>Name</th><th>Issued</th><th>Last used</th><th></th></tr></thead>
          <tbody>{pats.map((t) => <tr key={t.id}><td>{t.name}</td><td>{new Date(t.created_at).toLocaleDateString()}</td><td>{t.last_used_at ? new Date(t.last_used_at).toLocaleString() : "never"}</td>
            <td><form action={revokePat} style={{ margin: 0 }}><input type="hidden" name="id" value={t.id} /><button className="secondary" style={{ padding: "0.1rem 0.5rem", fontSize: "0.85rem" }}>Revoke</button></form></td></tr>)}</tbody></table>
      ) : null}
      <PatForm />
    </>
  );
}
