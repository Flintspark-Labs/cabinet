-- Personal access tokens for Principal tools on the Secure Line (Article V, Secure Line 3 fallback).
create table personal_access_tokens (
  id uuid primary key default gen_random_uuid(),
  principal_id uuid not null references profiles on delete cascade,
  name text not null check (length(name) between 1 and 80),
  token_hash text not null unique,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table personal_access_tokens enable row level security;
create policy pats_own on personal_access_tokens for all to authenticated using (principal_id = auth.uid()) with check (principal_id = auth.uid());
revoke update on personal_access_tokens from authenticated;
