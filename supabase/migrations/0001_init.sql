-- The Record. Specification FSL-CAB-001, Article VI.
create extension if not exists citext;

create type rfc_class as enum ('recommend', 'handle', 'find', 'weigh_in', 'coordinate');
create type request_status as enum ('open', 'closed');
create type dispatch_status as enum ('sent', 'accepted', 'recused', 'drafted', 'signed', 'expired');
create type channel as enum ('paper', 'secure_line');
create type basis as enum ('record', 'general');
create type authorship as enum ('own_hand', 'staff_drafted');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table cabinets (
  id uuid primary key default gen_random_uuid(),
  principal_id uuid not null references profiles on delete cascade,
  name text not null check (length(name) between 1 and 120),
  created_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references cabinets on delete cascade,
  email citext not null,
  display_name text not null check (length(display_name) between 1 and 120),
  portfolio text check (length(portfolio) <= 120),
  created_at timestamptz not null default now(),
  unique (cabinet_id, email)
);

create table requests (
  id uuid primary key default gen_random_uuid(),
  principal_id uuid not null references profiles on delete cascade,
  cabinet_id uuid not null references cabinets on delete cascade,
  rfc_number serial not null unique,
  class rfc_class not null,
  question text not null check (length(question) between 1 and 2000),
  context text not null default '' check (length(context) <= 4000),
  return_by timestamptz not null,
  status request_status not null default 'open',
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create table dispatches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests on delete cascade,
  appointment_id uuid not null references appointments on delete cascade,
  token_hash text not null unique,
  status dispatch_status not null default 'sent',
  channel channel,
  sent_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (request_id, appointment_id)
);

create table opinions (
  id uuid primary key default gen_random_uuid(),
  dispatch_id uuid not null unique references dispatches on delete cascade,
  body text not null check (length(body) between 1 and 6000),
  basis basis not null,
  authorship authorship not null,
  signed_at timestamptz,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create table briefs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references requests on delete cascade,
  body text not null,
  model text not null,
  created_at timestamptz not null default now()
);

create table do_not_dispatch (
  email citext primary key,
  created_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  entity text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

-- One profile per Principal, created with the auth user.
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name) values (new.id, split_part(new.email, '@', 1));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Row-level security on every table. Secretaries have no session; the service role bypasses RLS from server routes only.
alter table profiles enable row level security;
alter table cabinets enable row level security;
alter table appointments enable row level security;
alter table requests enable row level security;
alter table dispatches enable row level security;
alter table opinions enable row level security;
alter table briefs enable row level security;
alter table do_not_dispatch enable row level security;
alter table audit_log enable row level security;

create policy profiles_own on profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy cabinets_own on cabinets for all to authenticated using (principal_id = auth.uid()) with check (principal_id = auth.uid());
create policy appointments_own on appointments for all to authenticated
  using (exists (select 1 from cabinets c where c.id = cabinet_id and c.principal_id = auth.uid()))
  with check (exists (select 1 from cabinets c where c.id = cabinet_id and c.principal_id = auth.uid()));
create policy requests_own on requests for all to authenticated using (principal_id = auth.uid()) with check (principal_id = auth.uid());
create policy dispatches_read on dispatches for select to authenticated
  using (exists (select 1 from requests r where r.id = request_id and r.principal_id = auth.uid()));
-- Opinions reach the Principal only once signed.
create policy opinions_read_signed on opinions for select to authenticated
  using (signed_at is not null and exists (
    select 1 from dispatches d join requests r on r.id = d.request_id where d.id = dispatch_id and r.principal_id = auth.uid()));
create policy opinions_rate on opinions for update to authenticated
  using (signed_at is not null and exists (
    select 1 from dispatches d join requests r on r.id = d.request_id where d.id = dispatch_id and r.principal_id = auth.uid()));
revoke update on opinions from authenticated;
grant update (rating) on opinions to authenticated;
create policy briefs_read on briefs for select to authenticated
  using (exists (select 1 from requests r where r.id = request_id and r.principal_id = auth.uid()));
-- do_not_dispatch and audit_log: service role only. audit_log is append-only.
revoke all on do_not_dispatch from anon, authenticated;
revoke all on audit_log from anon, authenticated;
revoke update, delete on audit_log from public;
-- Principals never write dispatches, opinions or briefs directly; server routes do.
revoke insert, update, delete on dispatches from authenticated;
revoke insert, delete on opinions from authenticated;
revoke insert, update, delete on briefs from authenticated;

create index dispatches_request_idx on dispatches (request_id);
create index requests_return_by_idx on requests (return_by) where status = 'open';
