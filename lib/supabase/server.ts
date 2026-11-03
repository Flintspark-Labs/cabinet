import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Principal client: anon key + the user's cookie session. RLS applies.
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (all) => {
        try {
          all.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; the session still refreshes in actions and route handlers.
        }
      },
    },
  });
}

export async function requireUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return { supabase, user: data.user };
}
