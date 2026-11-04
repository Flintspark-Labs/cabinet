import Link from "next/link";
import { appUrl } from "@/lib/classes";
import { CopyButton } from "@/components/CopyButton";

export const metadata = { title: "The Standing Connection" };

export default function Standing() {
  const url = `${appUrl()}/api/mcp`;
  return (
    <>
      <p className="docno">The Secure Line · Standing Connection</p>
      <h1>Connect once. Your assistant picks up every Request after that.</h1>
      <p className="lede">The Secure Line hands your AI one Dispatch at a time, by a token from your email. A Standing Connection is the same line with your own key on it: your assistant asks The Cabinet what is waiting for you and gets the open Dispatches back, with their tokens, from any colleague who has appointed you. No inbox search, nothing to paste. You still sign every Opinion on this site.</p>

      <h2>For teams</h2>
      <p>Inside a company the Cabinet is the roster. A Principal appoints colleagues by their work email, exactly as now. Each colleague who sets up a Standing Connection is picked up by their own assistant from then on, for every later Request, from every Principal who has them on a Cabinet. Colleagues who have not connected keep getting email with a link, and nothing changes for them.</p>

      <h2>What changes, what does not</h2>
      <table>
        <thead><tr><th></th><th>Secure Line</th><th>Standing Connection</th></tr></thead>
        <tbody>
          <tr><td>How a Dispatch reaches you</td><td>Email with a private link; you hand the token to your AI</td><td>Your AI asks <code>my_dispatches</code> and gets every open one</td></tr>
          <tr><td>Setup</td><td>Add the connector, no account</td><td>Sign in once, create a personal access token, give it to your AI</td></tr>
          <tr><td>The email</td><td>Carries the link</td><td>Still sent; the link still works as a fallback</td></tr>
          <tr><td>Drafting</td><td colSpan={2}>Your AI, from your record, under the Standing Orders. Same packet, same rules.</td></tr>
          <tr><td>Signing</td><td colSpan={2}>You, on this site. Nothing reaches a Principal unsigned.</td></tr>
          <tr><td>What the Cabinet Office learns</td><td colSpan={2}>Nothing new. The token proves your email; your sources never cross.</td></tr>
        </tbody>
      </table>

      <h2>Set it up</h2>
      <ol className="procedure">
        <li><Link href="/login">Sign in</Link> with the email your colleagues use for you. Any email works; signing in makes you no one's Principal.</li>
        <li>On <Link href="/account">Account</Link>, create a personal access token. It is shown once; revoke it there any time.</li>
        <li>Give it to your assistant as the bearer token for <code>{url}</code>.
          <ul>
            <li><strong>Claude Code with the plugin:</strong> put <code>export CABINET_TOKEN=cab_…</code> in your shell profile. The plugin sends it.</li>
            <li><strong>Claude, ChatGPT, any MCP client:</strong> on the connector, add a header <code>Authorization: Bearer cab_…</code>.</li>
          </ul>
        </li>
        <li>Ask your assistant to check for Cabinet requests. In Claude Code that is <code>/check-for-cabinet-requests</code>, by hand or on a daily routine; elsewhere, ask it to call <code>my_dispatches</code>. It lists what is open and drafts the ones you pick. You sign.</li>
      </ol>
      <pre className="packet">{`claude plugin marketplace add Flintspark-Labs/cabinet\nclaude plugin install cabinet@cabinet\nexport CABINET_TOKEN=cab_…`}</pre>
      <p><CopyButton text={"claude plugin marketplace add Flintspark-Labs/cabinet\nclaude plugin install cabinet@cabinet"} label="Copy install commands" /> &nbsp; <CopyButton text={url} label="Copy server URL" /></p>

      <h2>Good to know</h2>
      <ul>
        <li>Each check issues fresh tokens and retires the ones from the last check. Use the newest signing link your assistant gives you; the link in your email always works.</li>
        <li>The token is a key to your Dispatches and, if you convene Cabinets, to your Principal tools. Treat it like a password. Revoke on Account.</li>
        <li>Nothing is pushed. Your assistant asks when you ask it, or on the routine you set. Push into a running session is on the list; see the <Link href="/connect">Secure Line page</Link> for the daily routine options.</li>
        <li>Opting out at <Link href="/opt-out">/opt-out</Link> stops Dispatches to your address on every channel, including this one.</li>
      </ul>
      <p className="hero" style={{ borderBottom: 0 }}><Link href="/account" className="button">Create a token</Link> &nbsp; <Link href="/connect" className="button secondary">The Secure Line</Link></p>
    </>
  );
}
