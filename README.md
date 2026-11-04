# The Cabinet

Convene a Cabinet of trusted advisors, put a Request for Counsel to them, and receive signed Opinions drafted by each advisor's own AI from their own record. Built to Specification FSL-CAB-001 (see `SPEC.md`).

The Cabinet Office never receives a Secretary's sources. Only signed Opinions cross.

## Stack

Next.js (App Router, TypeScript) on Vercel. Supabase for auth, Postgres and row-level security. Resend for mail. The Brief is compiled without a model: every signed Opinion, attributed, labels kept. An MCP server at `/api/mcp` is the Secure Line.

## Layout

- `app/` routes. `/` is the public site; `/cabinets`, `/requests` are the Principal's; `/d/[token]` is the Secretary's.
- `lib/` services. `principal.ts` (convene, appoint, issue), `secretary.ts` (accept, recuse, draft, sign), `brief.ts`, `packet.ts` (the Dispatch Packet and Standing Orders), `mail.ts`, `token.ts`.
- `mcp/` the Secure Line tool definitions, served by `app/api/mcp`.
- `emails/` plain-text mail templates.
- `supabase/migrations/` the Record. `supabase/tests/` pgTAP row-level security tests.

## Self-hosting

1. Create a Supabase project. `supabase link --project-ref <ref>` then `supabase db push`.
2. In Supabase Auth, set the Site URL to your domain and add `https://<domain>/**` to the redirect allow-list. The default Supabase mailer sends two auth emails an hour; configure custom SMTP for real use.
3. Copy `.env.example` to `.env.local` and fill it in. `CRON_SECRET` is any random string. `APP_SECRET` is 32 random bytes as hex (`openssl rand -hex 32`); it encrypts questions, Opinions and Briefs, so back it up and never rotate it without re-encrypting.
4. `npm install && npm run dev`.
5. Deploy to Vercel. Set the same variables in the project. `vercel.json` schedules the hourly Clock at `/api/cron`; Vercel sends `CRON_SECRET` automatically.
6. Verify a sending domain in Resend and set `MAIL_FROM`.

## Tests

- `npm test` runs the unit tests (packet, tokens).
- `npm run e2e` runs the whole procedure over MCP and the site against a running server (see NOTES.md).
- `DATABASE_URL=postgresql://... npm run test:rls` runs the pgTAP row-level security tests (`create extension pgtap` once; Supabase ships it). `supabase test db` also works where Docker is available.

## License

MIT.
