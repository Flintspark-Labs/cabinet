-- Shareable Request links. A Secretary may join by link with a name alone; email becomes optional.
alter table appointments alter column email drop not null;
alter table appointments drop constraint appointments_cabinet_id_email_key;
create unique index appointments_cabinet_email_idx on appointments (cabinet_id, email) where email is not null;
alter table requests add column share_token text not null unique default replace(gen_random_uuid()::text, '-', '');
