import { appUrl } from "@/lib/classes";
import { CopyButton } from "@/components/CopyButton";
import { AutoRefresh } from "@/components/AutoRefresh";
import { dispatchByToken } from "@/lib/secretary";
import Link from "next/link";

export default async function Connect({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const url = `${appUrl()}/api/mcp`;
  const d = token ? await dispatchByToken(token) : null;
  return (
    <>
      <p className="docno">The Secure Line</p>
      <h1>Connect your AI to The Cabinet</h1>
      <p>The Secure Line is an MCP server at <code>{url}</code>. Your assistant fetches a Dispatch by its token, drafts under the Standing Orders from your own record, and files the draft. Signing stays a click on this site. No account is needed for Secretary tools.</p>
      {d?.status === "drafted" && <div className="notice"><p>Your draft is filed. <Link href={`/d/${token}/sign`}>Review and sign it</Link>.</p></div>}
      {d && ["sent", "accepted"].includes(d.status) && <AutoRefresh />}
      {token && (() => { const prompt = `I have a Cabinet dispatch. Call get_dispatch on The Cabinet with dispatch_token "${token}", follow the Standing Orders in the packet, and draft my Opinion from my own notes and history. Show me the draft before filing anything.`; return (
        <div className="notice">
          <p className="docno">Your prompt, ready to paste into your assistant</p>
          <pre className="packet" style={{ maxHeight: "none" }}>{prompt}</pre>
          <p><CopyButton text={prompt} label="Copy prompt" /> &nbsp; <CopyButton text={url} label="Copy server URL" /></p>
          <p className="small">When the draft is filed, your assistant returns a signing link. Signing is a click on this site.</p>
        </div>); })()}

      <h2>Claude Code: plugin and a daily check</h2>
      <p>The plugin installs the Secure Line and a <code>/check-for-cabinet-requests</code> skill that searches your connected mail for Dispatches, lists the open ones, and drafts from your own record when you ask. You always sign here.</p>
      <pre className="packet">{`claude plugin marketplace add Flintspark-Labs/cabinet\nclaude plugin install cabinet@cabinet`}</pre>
      <p><CopyButton text={"claude plugin marketplace add Flintspark-Labs/cabinet\nclaude plugin install cabinet@cabinet"} label="Copy install commands" /></p>
      <p><strong>Make it a daily routine.</strong> Any of these:</p>
      <ol className="procedure">
        <li>In Claude Code, run <code>/schedule</code> and give it: <em>Run /check-for-cabinet-requests and message me if anything is open</em>, daily. This runs in the cloud; connect your mail there.</li>
        <li>While a session is open: <code>/loop 24h /check-for-cabinet-requests</code>.</li>
        <li>On your own machine: a cron line such as <code>0 9 * * * claude -p &quot;/check-for-cabinet-requests&quot;</code>.</li>
      </ol>
      <p>Without Claude Code, add the server URL below to any client; the skill is just a written procedure, so you can also paste it: <a href="https://github.com/Flintspark-Labs/cabinet/blob/main/plugin/skills/check-for-cabinet-requests/SKILL.md">read the skill</a>.</p>

      <h2>Claude</h2>
      <ol className="procedure">
        <li>In claude.ai or Claude Desktop, open Settings → Connectors → Add custom connector.</li>
        <li>Name it “The Cabinet” and enter <code>{url}</code>. No authentication is needed for Secretary tools.</li>
        <li>Open a chat with your files, mail or notes connected. Paste your dispatch token and ask Claude to fetch the Dispatch and draft your Opinion.</li>
        <li>When Claude files the draft, open the signing link it returns and sign.</li>
      </ol>
      <h2>ChatGPT</h2>
      <ol className="procedure">
        <li>Enable Developer mode under Settings → Connectors (requires a plan that allows custom MCP connectors).</li>
        <li>Create a connector with the URL <code>{url}</code> and no authentication.</li>
        <li>In a chat, enable the connector, paste your dispatch token, and ask for a draft Opinion.</li>
        <li>Sign on the link ChatGPT returns.</li>
      </ol>
      <h2>Any MCP client</h2>
      <p>Transport: Streamable HTTP. Endpoint: <code>{url}</code>. Secretary tools: <code>get_dispatch</code>, <code>submit_opinion</code>, <code>recuse</code>, each taking <code>dispatch_token</code>. Principal tools (<code>convene_cabinet</code>, <code>issue_request</code>, <code>list_opinions</code>, <code>get_brief</code>) require a personal access token from your Account page sent as <code>Authorization: Bearer</code>.</p>
      <pre className="packet">{`{ "mcpServers": { "cabinet": { "type": "streamable-http", "url": "${url}" } } }`}</pre>
      <p><CopyButton text={`{ "mcpServers": { "cabinet": { "type": "streamable-http", "url": "${url}" } } }`} label="Copy config" /></p>
    </>
  );
}
