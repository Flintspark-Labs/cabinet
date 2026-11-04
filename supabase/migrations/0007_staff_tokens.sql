-- Connected Secretaries: a second, hashed token per Dispatch minted for the Secretary's own assistant over the Secure Line.
-- The emailed token keeps working; the Staff token is replaced on every my_dispatches call.
alter table dispatches add column staff_token_hash text unique;
