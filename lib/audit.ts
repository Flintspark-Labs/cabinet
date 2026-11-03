import { db } from "./supabase/admin";

export async function audit(actor: string, action: string, entity: string, entity_id: string | null) {
  await db().from("audit_log").insert({ actor, action, entity, entity_id });
}
