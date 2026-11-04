alter table cabinets add column purpose text check (length(purpose) <= 500);
