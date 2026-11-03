import { requireUser } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions";

export default async function Account() {
  const { supabase, user } = await requireUser();
  const { data: p } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();
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
    </>
  );
}
