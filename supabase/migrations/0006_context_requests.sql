-- Requests for Context: a Secretary contributes documents and a longer response for the Principal's ContextNest.
create type request_kind as enum ('counsel', 'context');
alter table requests add column kind request_kind not null default 'counsel';
alter table requests add column nest_url text check (length(nest_url) <= 500);
alter table opinions drop constraint opinions_body_check;
alter table opinions add constraint opinions_body_check check (length(body) between 1 and 80000);
alter table opinions add column documents text check (length(documents) <= 400000);
