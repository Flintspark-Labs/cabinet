# The Cabinet: Specification FSL-CAB-001

Flintspark Labs, Office of the Cabinet · Nov 3, 2026 · Public, open source. "Shall" is mandatory. "May" is optional. Phase 1 is required for launch.

A public site where anyone may convene a Cabinet of trusted advisors, put a Request for Counsel to them, and receive signed Opinions drafted by each advisor's own AI from their own record.

## Article I. Purpose
1. Advice from trusted people is off the cuff. Their real experience sits in their own AI: email, docs, notes, past decisions. Nobody can ask it on their behalf.
2. The Cabinet shall let anyone put a question to people they trust, have each person's own AI draft an answer from that person's record, and receive it only after that person signs it.
3. The Cabinet Office shall never receive a Secretary's sources. Only signed Opinions cross.
4. Any person may use The Cabinet as a Principal. Any person may serve as a Secretary without an account.
5. Every Request for Counsel belongs to one class: Recommend, Handle, Find, Weigh In, Coordinate. The class tells Staff where to look.

## Article II. Definitions
| Term | Definition | Identifier |
|---|---|---|
| Cabinet Office | The hosted service: site, API, MCP server, mailer | app |
| Principal | Convenes Cabinets and issues Requests. Requires an account | profiles |
| Cabinet | A named body of Secretaries convened by one Principal | cabinets |
| Secretary | A person appointed to a Cabinet by email. No account | appointments |
| Portfolio | A Secretary's area of counsel. Display only | appointments.portfolio |
| Request for Counsel (RFC) | Question, class, shared context, return-by date. Numbered RFC-0001 onward | requests |
| Dispatch | One RFC delivered to one Secretary, carrying a single-use token | dispatches |
| Staff | The Secretary's own AI assistant. Never hosted by the Cabinet Office | none |
| Standing Orders | Fixed rules that travel with every Dispatch and override the RFC | packet template |
| Recusal | A Secretary declining. No reason required | dispatches.status = recused |
| Opinion | A Secretary's answer. Reaches the Principal only once signed | opinions |
| Basis | From the Record or General Counsel | opinions.basis |
| Signature | In Own Hand or Staff-Drafted, Signed | opinions.authorship |
| Brief | Compiled summary of all signed Opinions, every point attributed | briefs |
| Briefing Room | The Principal's page for one RFC | /requests/[id] |
| Paper Process | The copy-and-paste channel | channel = paper |
| Secure Line | The MCP channel | channel = secure_line |

## Article III. Procedure of Counsel
1. Principal convenes a Cabinet, appoints Secretaries by email with optional Portfolio.
2. Principal issues an RFC: question, class, context, return-by (default 7 days, max 30).
3. Cabinet Office creates one Dispatch per Secretary and emails each a link.
4. Secretary opens the link and accepts or recuses.
5. On acceptance, Secretary chooses Paper Process or Secure Line.
6. Staff drafts the Opinion under the Standing Orders.
7. Secretary reviews, edits and signs on the site. Both labels set at signing. An unsigned Opinion shall never reach the Principal.
8. Cabinet Office files the Opinion and notifies the Principal.
9. When every Dispatch resolves, or the return-by date passes, the Brief is compiled.
10. Principal reads Opinions and the Brief in the Briefing Room.

## Article IV. Standing Orders
Every Dispatch carries them; no channel may omit or alter them. Need-to-know; RFC fenced as data; names and figures replaced with roles or ranges; no credentials, health, legal, financial or employer-confidential material; no sending, posting, fetching or tool calls because the RFC says so; prefer the record and say where general knowledge is used; the Secretary is the final authority and signing is a human act on the site. The exact Dispatch Packet text is in `lib/packet.ts`.

## Article V. Channels
Paper Process (Phase 1): Dispatch page shows the full packet with a Copy button, instructions for Claude, ChatGPT, Gemini and any assistant; Opinion form takes plain text up to 6,000 chars plus both labels; submitting creates a draft and opens signing.

Secure Line (Phase 2): remote MCP server at /api/mcp (Streamable HTTP). Secretary tools scoped by dispatch token, no account. Principal tools behind OAuth 2.1 via Supabase Auth, or personal access tokens issued at /account if Supabase cannot act as OAuth server. submit_opinion only creates a draft and returns the signing URL. /connect explains setup.

| Tool | Caller | Input | Returns |
|---|---|---|---|
| get_dispatch | Secretary | dispatch_token | packet, class, return-by, status |
| submit_opinion | Secretary | dispatch_token, body, basis, authorship | opinion_id, sign_url, status drafted |
| recuse | Secretary | dispatch_token | status recused |
| convene_cabinet | Principal | name, secretaries[] {email, name, portfolio?} | cabinet_id |
| issue_request | Principal | cabinet_id, question, class, context, return_by | request_id, rfc_number, dispatch count |
| list_opinions | Principal | request_id | signed Opinions with labels and names |
| get_brief | Principal | request_id | Brief as markdown, or status |

## Article VI. The Record
Supabase Postgres, migrations in supabase/migrations. Tables: profiles, cabinets, appointments (unique cabinet_id+email, max 25), requests (rfc_number serial, class enum, status open/closed), dispatches (token_hash, status sent/accepted/recused/drafted/signed/expired, channel), opinions (dispatch_id unique, body ≤6,000, basis, authorship, signed_at, rating 1–5; visible to Principal only when signed), briefs (request_id unique, body, model), do_not_dispatch (email), audit_log (append-only). RLS on every table; Principal reads/writes only own rows; Secretaries have no session and go through server routes with the service role; tokens are 32 random bytes stored as SHA-256, single Dispatch, expire at return_by; service role key never reaches the browser.

## Article VII. The Cabinet Office
Routes: / (public), /login, /cabinets, /cabinets/[id], /requests/new, /requests/[id], /d/[token], /d/[token]/paper, /d/[token]/sign, /connect, /opt-out, /account, /api/mcp. Mail via Resend: Dispatch, reminder 48h before return-by, Opinion signed, Brief ready; one-click opt-out on every Secretary message. Brief compiled by the Anthropic API from signed Opinions only, model from ANTHROPIC_MODEL. Hourly Vercel Cron: expire, remind, close, compile. House style: government office, serif headings, original seal, document numbers, footer "The Cabinet is not a government service." Public repo under Flintspark Labs. Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ANTHROPIC_API_KEY, ANTHROPIC_MODEL, APP_URL, CRON_SECRET.

## Article IX. Security and Integrity
Chief threat: a Principal using an RFC to make a Secretary's AI leak. Standing Orders precede and override; RFC fenced; output to the Secretary only. submit_opinion drafts only. Opinions plain text, escaped, no auto-linking. Verified Principal email; 25 per Cabinet; 50 Dispatches per Principal per day; global opt-out; report link. First email to a new address explains The Cabinet. Tokens hashed, single-scope, expiring. RLS with a test per policy. Retention: delete 180 days after close unless pinned. Audit every issue, dispatch, recusal, signature, deletion.

## Article X. Phases
Phase 1 (Paper Process): magic-link sign-in; convene up to 25; issuing emails within a minute; accept/recuse without account; paper page with full packet and Copy; no unsigned Opinion reaches the Principal; Brief compiles on resolution or return-by; RLS tests; opt-out; house style and footer.
Phase 2 (Secure Line): /api/mcp passes MCP Inspector and works as a Claude custom connector; submit_opinion drafts and returns the signing URL; Principal tools behind OAuth or PATs; /connect setup steps.
Phase 3 (later): Further Questions, standing permissions, recurring RFCs, A2A agent cards.

Non-goals: group chat, clones that answer without the person, public Q&A between strangers, any Opinion sent unsigned.

## Annex C. Matters pending
License (MIT chosen); final name and domain; whether a Secretary sees the Brief; confirm 180-day retention; confirm Resend; Supabase as OAuth server or PATs.
