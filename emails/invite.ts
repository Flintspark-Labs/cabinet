import { appUrl } from "@/lib/classes";

// Sent once when a Principal appoints a Secretary by email. Explains the role and the optional one-time setup.
export const inviteEmail = (p: { secretary: string; principal: string; cabinet: string; portfolio: string | null; email: string }) =>
  `Dear ${p.secretary},

${p.principal} has appointed you to their Cabinet "${p.cabinet}"${p.portfolio ? ` as ${p.portfolio}` : ""} on The Cabinet.

What that means: now and then ${p.principal} will put a question to a few people they trust. You will get an email with a private link. You open it, read the question, and either answer or decline, no reason needed. If you answer, you paste a short packet into your own AI (Claude, ChatGPT, Gemini, anything) so it drafts from your own notes and history; you review, edit and sign before anything is sent. Nothing from your side is stored except what you sign, and that is encrypted and deleted 30 days after the question closes. No account needed.

Nothing to do now.

Optional one-time setup, so answering later takes a minute:
1. Connect your AI to The Cabinet (MCP) with a personal access token from ${appUrl()}/account (sign in with this email). Then it finds and fetches your requests itself, from any colleague who appoints you, and files your draft; you still sign on the site. Steps: ${appUrl()}/standing
2. Claude Code users: install the plugin and run /check-for-cabinet-requests whenever you like, or on a daily routine. Steps on the same page.

—
The Cabinet is not a government service. ${appUrl()}
Stop all future Dispatches to this address: ${appUrl()}/opt-out?email=${encodeURIComponent(p.email)}
Report abuse: reply to this message.`;
