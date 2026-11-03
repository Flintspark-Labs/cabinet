# Build notes (agent working file)

Kept by the build agent so a later session can pick up without re-deriving.

## Infra (set up 2026-11-03)
- GitHub: https://github.com/Flintspark-Labs/cabinet (public)
- Vercel: project `cabinet` in team "Flint's projects" (`team_tyFgOtguckEGtcYnv5hxgYvg`, scope `flints-projects-048cced2`). Production: https://cabinet-eight-alpha.vercel.app
- Supabase: project `cabinet`, ref `yrmhzntrncdubilpfbbz`, org "Flintspark Labs". Region us-east-1. Migration 0001 applied. Auth site URL and redirect list set to the Vercel domain and localhost.
- Vercel env set: Supabase URL/anon/service role, APP_URL, CRON_SECRET, MAIL_FROM. NOT yet set: RESEND_API_KEY (mail logs to console until set).
- Decision 2026-11-03 (Flint): the Cabinet Office calls no model. The Brief is the signed Opinions stacked and attributed; the Principal's own AI reads them over the Secure Line.

## Decisions made while building
- Licence: MIT (Annex C left it open).
- `requests.pinned` added for the 180-day retention exemption.
- Reminder emails cannot carry the dispatch link because tokens are stored only hashed (Article VI.4). The reminder tells the Secretary to use the link in the original email.
- Rating uses a column-level grant (`update (rating)`) under RLS rather than a function.
- No middleware; every Principal page calls `requireUser()`.
- `db()` (service role) is created lazily so builds without env succeed.

## Testing
- `npm test` unit; `DATABASE_URL=... npm run test:rls` pgTAP (11 checks, all passing 2026-11-03).
- `npm run e2e` drives the whole flow against a running server + real DB: needs `PAT` (a Principal PAT), `MAIL_LOG` (file where the server's stdout goes; dispatch links are read from the logged mail when RESEND_API_KEY is unset), `BASE` (default http://localhost:3457). Start the server with `npx next build && npx next start -p 3457 > $MAIL_LOG`. Passing 2026-11-03.
- E2E test Principal in prod DB: e2e-principal@example.com (profile 00000000-0000-0000-0000-0000000000e2) with a PAT named `e2e`. Delete when real users arrive.
- Vercel runtime logs are 403 on this team plan; test mail flows locally.

## Domain
- cabinet.flintsparklabs.com is attached to the Vercel project and in the Supabase redirect allow-list. DNS is at Cloudflare (not Route 53). Needs CNAME `cabinet` -> `9dcf01da54dbd149.vercel-dns-016.com` (DNS only, not proxied). After it resolves: set Vercel APP_URL and Supabase site_url to https://cabinet.flintsparklabs.com and redeploy.

## Open
- Supabase default auth mailer is limited to 2 emails/hour. Set custom SMTP (Resend) in Supabase Auth once a sending domain is verified.
- Final name and domain not chosen. When chosen: add domain in Vercel, update APP_URL, Supabase site URL and allow-list.
- Secretary reciprocity (seeing the Brief) undecided.
