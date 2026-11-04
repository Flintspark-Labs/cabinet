# Contributing

The Cabinet is an open-source build of Flintspark Labs, specified in `SPEC.md`. Changes that follow the specification are welcome; changes to the specification need a conversation first, in an issue.

## Setup

See the self-hosting section of `README.md`. You need a Supabase project (free tier is fine) and Node 20+.

## Before a pull request

- `npm run lint` (typecheck) and `npm test` pass.
- If you touched a policy or a table, run the row-level security suite: `DATABASE_URL=… npm run test:rls`.
- If you touched the flow, run `npm run e2e` against a local `next start` (instructions in `NOTES.md`).
- Keep the house style: plain official English, serif headings, no imitation of any real government mark.
- Nothing may let an unsigned Opinion reach a Principal, and nothing may let the service receive a Secretary's sources. Pull requests that weaken either will not be merged.

## Licence

MIT. By contributing you agree your contribution is licensed the same way.
