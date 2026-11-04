# The Cabinet plugin for Claude Code

Installs the Secure Line MCP server and the `/check-for-cabinet-requests` skill.

```
claude plugin marketplace add Flintspark-Labs/cabinet
claude plugin install cabinet@cabinet
```

Then in any session: `/check-for-cabinet-requests`. It searches your connected mail for Cabinet Dispatches, lists the open ones, and drafts Opinions from your own record when you ask. You always sign on the site.

## Daily routine

Pick one:

- **Claude Code routine (cloud, no machine needed):** `/schedule` and give it `Run /check-for-cabinet-requests and message me if anything is open.` on a daily cadence. It needs your mail connected in that environment.
- **Local loop while a session is open:** `/loop 24h /check-for-cabinet-requests`
- **cron on your machine:** `0 9 * * * cd ~ && claude -p "/check-for-cabinet-requests" >> ~/cabinet-check.log 2>&1`

Without the plugin, the MCP server alone works in any client: `https://cabinet.flintsparklabs.com/api/mcp` (Streamable HTTP, no auth for Secretary tools).
