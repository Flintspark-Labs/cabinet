-- Share links carry a maximum number of seats. Redemption is one atomic UPDATE, so no race can exceed it.
alter table requests add column share_max_uses int not null default 10 check (share_max_uses between 0 and 25);
alter table requests add column share_uses int not null default 0 check (share_uses >= 0);

create function claim_share_seat(share text) returns table (id uuid, cabinet_id uuid, principal_id uuid)
language sql security definer set search_path = public as $$
  update requests r set share_uses = r.share_uses + 1
  where r.share_token = share and r.status = 'open' and r.return_by > now() and r.share_uses < r.share_max_uses
  returning r.id, r.cabinet_id, r.principal_id;
$$;
revoke all on function claim_share_seat(text) from public, anon, authenticated;

create function release_share_seat(req uuid) returns void language sql security definer set search_path = public as $$
  update requests set share_uses = greatest(share_uses - 1, 0) where id = req;
$$;
revoke all on function release_share_seat(uuid) from public, anon, authenticated;
