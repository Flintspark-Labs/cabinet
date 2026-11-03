# Build notes (agent working file)

Kept by the build agent so a later session can pick up without re-deriving.

## Infra (set up 2026-11-03)
- GitHub: https://github.com/Flintspark-Labs/cabinet (public)
- Vercel: project `cabinet` in team "Flint's projects" (`team_tyFgOtguckEGtcYnv5hxgYvg`, scope `flints-projects-048cced2`). Production: https://cabinet-eight-alpha.vercel.app
- Supabase: project `cabinet`, ref `yrmhzntrncdubilpfbbz`, org "Flintspark Labs". Region us-east-1. Migration 0001 applied. Auth site URL and redirect list set to the Vercel domain and localhost.
- Vercel env set: Supabase URL/anon/service role, ANTHROPIC_MODEL, APP_URL, CRON_SECRET, MAIL_FROM. NOT yet set: RESEND_API_KEY, ANTHROPIC_API_KEY (mail logs to console and the Brief fails until set).

## Decisions made while building
- Licence: MIT (Annex C left it open).
- `requests.pinned` added for the 180-day retention exemption.
- Reminder emails cannot carry the dispatch link because tokens are stored only hashed (Article VI.4). The reminder tells the Secretary to use the link in the original email.
- Rating uses a column-level grant (`update (rating)`) under RLS rather than a function.
- No middleware; every Principal page calls `requireUser()`.
- `db()` (service role) is created lazily so builds without env succeed.

## Open
- Supabase default auth mailer is limited to 2 emails/hour. Set custom SMTP (Resend) in Supabase Auth once a sending domain is verified.
- Final name and domain not chosen. When chosen: add domain in Vercel, update APP_URL, Supabase site URL and allow-list.
- Secretary reciprocity (seeing the Brief) undecided.
