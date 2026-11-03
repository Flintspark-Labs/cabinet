import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { db } from "./supabase/admin";
import { newToken, hashToken } from "./token";

// Issue a PAT through the Principal's own RLS client. The raw token is shown once.
export async function issuePat(supabase: SupabaseClient, principalId: string, name: string) {
  const { token, hash } = newToken();
  const { error } = await supabase.from("personal_access_tokens").insert({ principal_id: principalId, name: name.trim().slice(0, 80) || "Secure Line", token_hash: hash });
  if (error) throw new Error(error.message);
  return `cab_${token}`;
}

// Returns the principal id for a bearer token, or null.
export async function principalForPat(bearer: string | undefined) {
  if (!bearer?.startsWith("cab_")) return null;
  const { data } = await db().from("personal_access_tokens").select("id, principal_id").eq("token_hash", hashToken(bearer.slice(4))).maybeSingle();
  if (!data) return null;
  await db().from("personal_access_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data.principal_id as string;
}
