-- Row-level security: one Principal cannot read another's rows (Article IX). Run: supabase test db --linked
begin;
select plan(11);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a', 'a@example.com'), ('00000000-0000-0000-0000-00000000000b', 'b@example.com');
insert into cabinets (id, principal_id, name) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'A cabinet');
insert into appointments (id, cabinet_id, email, display_name) values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 's@example.com', 'S');
insert into requests (id, principal_id, cabinet_id, class, question, return_by) values ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', '10000000-0000-0000-0000-000000000001', 'recommend', 'Q?', now() + interval '7 days');
insert into dispatches (id, request_id, appointment_id, token_hash) values ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'hash');
insert into opinions (dispatch_id, body, basis, authorship, signed_at) values ('40000000-0000-0000-0000-000000000001', 'signed', 'record', 'own_hand', now());
insert into briefs (request_id, body, model) values ('30000000-0000-0000-0000-000000000001', 'brief', 'test');

-- Principal B sees nothing of A's.
set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000000b","role":"authenticated"}';
select is((select count(*) from profiles where id = '00000000-0000-0000-0000-00000000000a'), 0::bigint, 'profiles: B cannot read A');
select is((select count(*) from cabinets), 0::bigint, 'cabinets: B cannot read A');
select is((select count(*) from appointments), 0::bigint, 'appointments: B cannot read A');
select is((select count(*) from requests), 0::bigint, 'requests: B cannot read A');
select is((select count(*) from dispatches), 0::bigint, 'dispatches: B cannot read A');
select is((select count(*) from opinions), 0::bigint, 'opinions: B cannot read A');
select is((select count(*) from briefs), 0::bigint, 'briefs: B cannot read A');

-- Principal A sees their own, and only signed Opinions.
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-00000000000a","role":"authenticated"}';
select is((select count(*) from requests), 1::bigint, 'requests: A reads own');
select throws_ok($$update opinions set signed_at = null where dispatch_id = '40000000-0000-0000-0000-000000000001'$$, '42501', null, 'opinions: Principal cannot change signed_at');
select lives_ok($$update opinions set rating = 4 where dispatch_id = '40000000-0000-0000-0000-000000000001'$$, 'opinions: Principal can rate');
reset role;
update opinions set signed_at = null where dispatch_id = '40000000-0000-0000-0000-000000000001';
set local role authenticated;
select is((select count(*) from opinions), 0::bigint, 'opinions: unsigned Opinion is invisible to the Principal');

select * from finish();
rollback;
