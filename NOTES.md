# Build notes (agent working file)

Kept by the build agent so a later session can pick up without re-deriving.

## Infra (set up 2026-11-03)
- GitHub: https://github.com/Flintspark-Labs/cabinet (public)
- Vercel: project `cabinet` (team and ids in the maintainer's private notes). Production: https://cabinet.flintsparklabs.com
- Supabase: project `cabinet`, org "Flintspark Labs", region us-east-1 (ref in the maintainer's private notes; `supabase link` once per machine). Migration 0001 applied. Auth site URL and redirect list set to the Vercel domain and localhost.
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
- E2E test Principal exists in the production DB (profile id ends in 00e2) with a PAT named `e2e`. Delete when real users arrive.
- Vercel runtime logs are 403 on this team plan; test mail flows locally.

## Domain
- Live at https://cabinet.flintsparklabs.com since 2026-11-03 (Cloudflare CNAME `cabinet` -> 9dcf01da54dbd149.vercel-dns-016.com, DNS only). APP_URL and Supabase site_url point there; the vercel.app URL still works.

## Where we stopped (2026-11-03 evening)
Resend: RESEND_API_KEY and MAIL_FROM ("The Cabinet <cabinet@flintsparklabs.com>") are set in Vercel and deployed. flintsparklabs.com is added in Resend (domain id 84f66958-89f9-462e-8e87-de5dd5fa9568); Flint added the 4 DNS records at Cloudflare and they resolve. NEXT: POST /domains/<id>/verify with the key from .env.local, poll until status "verified", then issue a real test Request to flint@frequency.media (sign in at /login, or via MCP with the e2e PAT and a cabinet containing his email) and confirm delivery in Resend logs. Then point Supabase Auth SMTP at Resend (smtp.resend.com:465, user "resend", pass = key, sender cabinet@flintsparklabs.com) via the management API PATCH /config/auth, and announce_done.

Awaiting Flint's answers: keep audit_log rows after dissolve (built that way); keep/cut/reword/build the ContextNest "deeper integration" line on /contextnest; repo is public, go/no-go on keeping it so; which mobile animation he expected.

## Open
- Supabase default auth mailer is limited to 2 emails/hour. Set custom SMTP (Resend) in Supabase Auth once a sending domain is verified.
- Final name and domain not chosen. When chosen: add domain in Vercel, update APP_URL, Supabase site URL and allow-list.
- Secretary reciprocity (seeing the Brief) undecided.
