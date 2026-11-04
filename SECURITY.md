# Security

The Cabinet handles other people's words. Report anything that could expose them.

## Reporting

Email cabinet@flintsparklabs.com with "security" in the subject. Say what you found and how to reproduce it. We reply within three working days and do not take action against good-faith researchers who respect the rules below.

Do not: access data that is not yours, run automated scans against the live service beyond rate limits, or dispatch to people who have not agreed.

## What the service protects

- A Secretary's sources never reach the service. Only text they paste or their assistant files, and only after they sign, is visible to anyone else.
- Questions, context, Opinions and Briefs are encrypted by the application (AES-256-GCM, `APP_SECRET`) on top of the database's encryption at rest and TLS in transit.
- Dispatch tokens are 32 random bytes stored only as SHA-256 hashes, valid for one Dispatch, expiring at the return-by date.
- Row-level security on every table; the service-role key is used only in server routes and never reaches the browser. `supabase/tests/rls.test.sql` has one check per policy.
- The Standing Orders in every packet instruct the Secretary's AI to treat the request as data and never act outward. They are the main defence against a Principal using a question to make an assistant leak.

## Self-hosters

Rotate `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` if they leak. `APP_SECRET` cannot be rotated without re-encrypting stored rows; back it up. Keep `.env.local` out of version control (it is in `.gitignore`).
