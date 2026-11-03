import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;
// Service role: bypasses RLS. Server routes only. Created lazily so builds without env still succeed.
export function db() {
  return (client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
}
