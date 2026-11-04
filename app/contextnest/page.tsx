import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata = { title: "Requests for Context" };

export default function ContextNest() {
  return (
    <>
      <Reveal />
      <p className="docno">The Cabinet × ContextNest</p>
      <h1>Ask your Cabinet to fill your nest, not just answer a question.</h1>
      <p className="lede">A Request for Context asks each Secretary for more than an Opinion: a thorough written response and a set of documents their own AI assembles from their record, written in the shape a <a href="https://promptowl.ai/contextnest/">ContextNest</a> accepts. You drop the signed bundle into your nest. Your AI reads it from then on.</p>

      <h2>What a ContextNest is</h2>
      <p>ContextNest, by PromptOwl, is a governed vault of Markdown documents that your AI tools read over MCP. Each document carries frontmatter (type, author, status, tags) and wiki links to the others. A steward approves every document before any AI uses it, every read is logged, and nothing is altered without approval. It is the right place for other people's hard-won knowledge to land.</p>

      <h2>How a Request for Context differs</h2>
      <table>
        <thead><tr><th></th><th>Request for Counsel</th><th>Request for Context</th></tr></thead>
        <tbody>
          <tr><td>What you ask</td><td>One question</td><td>A topic to document: "Everything you learned running podcast ad sales"</td></tr>
          <tr><td>What comes back</td><td>An Opinion under 600 words</td><td>A response up to 3,000 words plus documents: decisions, playbooks, lessons, reference, contact patterns</td></tr>
          <tr><td>Shape</td><td>Plain text</td><td>ContextNest Markdown with frontmatter and [[wiki links]], author set to the Secretary</td></tr>
          <tr><td>Return by</td><td>7 days</td><td>14 days</td></tr>
          <tr><td>Where it lands</td><td>Your Briefing Room</td><td>Your Briefing Room, with a one-click bundle for your nest; your steward approves each document</td></tr>
        </tbody>
      </table>

      <h2>Same safeguards, longer leash</h2>
      <ul>
        <li>The Standing Orders travel with the packet. Staff reads only what bears on the topic, from every source it is connected to, read only.</li>
        <li>Documents are rewritten knowledge in the Secretary's voice, never copies of sources. Names and figures become roles and ranges unless the Secretary adds them back.</li>
        <li>The Secretary reads every document on the signing page. Each carries their name as author. Nothing crosses until they sign.</li>
        <li>Encrypted by the application; deleted thirty days after the Request closes unless pinned.</li>
      </ul>

      <h2>How it works today</h2>
      <ol className="procedure">
        <li>Issue a Request for Context from any Cabinet. Add your nest's link if you want Secretaries to see where it lands.</li>
        <li>Each Secretary's AI drafts the response and the documents from the packet. They paste, review and sign.</li>
        <li>In your Briefing Room, copy all signed documents as one bundle and add them to your ContextNest. Your steward approves them there.</li>
      </ol>
      <p>A deeper integration with PromptOwl, where signed documents file straight into your nest for approval, is in the works.</p>
      <p className="hero" style={{ borderBottom: 0 }}><Link href="/requests/new?kind=context" className="button">Issue a Request for Context</Link> &nbsp; <Link href="/" className="button secondary">The Cabinet</Link></p>
    </>
  );
}
