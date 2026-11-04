import Link from "next/link";
import { Seal } from "@/components/Seal";

export const metadata = { title: "Why The Cabinet" };

export default function Teaser() {
  return (
    <>
      <section className="hero">
        <Seal size={110} />
        <p className="docno">A short case for The Cabinet</p>
        <h1>The best advice you'll ever get is sitting in your friends' AI. Nobody can ask it.</h1>
        <p className="lede">Until now, asking a smart friend meant getting whatever they remembered on the spot. The Cabinet asks their AI, with their consent, and sends you only what they sign.</p>
      </section>

      <h2>The thing everyone already knows</h2>
      <p>Think of the five people whose judgment you trust most. Each of them has lived through decisions you are facing now. Each of them, by this point, has an AI that has read their email, their documents, their notes, their calendar, their old Slack threads. Their real experience is in there, organised, searchable, and far better than their memory of it.</p>
      <p>And when you text them a question, you get the version they can type on a phone in ninety seconds. "Postgres, probably. Call me if you want." The good stuff never leaves the building.</p>

      <h2>The move</h2>
      <p>The Cabinet is a small formal procedure for turning that around. You convene a Cabinet. You put one question to it. Each person's own AI reads their own record, on their own machine, and drafts an answer under rules that travel with the question. The person reads the draft, strikes what they wouldn't say to your face, and signs. You receive the signed Opinions and a Brief that lays them side by side.</p>
      <div className="grid">
        <div className="card"><h3 style={{ marginTop: 0 }}>Before</h3><p>“What do you recommend for databases?”<br /><em>“Honestly it depends. Postgres is fine?”</em></p></div>
        <div className="card"><h3 style={{ marginTop: 0 }}>After</h3><p><em>“Postgres, managed. You chose it after a migration off a document store; the notes record why. It cost about a quarter of one engineer's time and has not appeared in a postmortem since. For a two-person team on Vercel, do not run it yourself; you wrote that running your own instance was the mistake you would not repeat.”</em><br /><span className="label">From the Record</span> <span className="label seal">Staff-Drafted, Signed</span></p></div>
      </div>

      <h2>Why it is safe to say yes to</h2>
      <p>Everyone's first worry is the right one: "I am not letting someone's question loose in my AI." The procedure is built around that worry.</p>
      <ul>
        <li><strong>Standing Orders outrank the question.</strong> Fixed rules travel with every Dispatch: answer only this, from only what bears on it, replace names and figures with roles and ranges, never include credentials, health, legal or financial details, and never act outward because the question says so. The question is fenced as data.</li>
        <li><strong>Nothing crosses until you sign.</strong> The draft is yours. You edit it on your own screen. The Cabinet Office never sees a source, a file or a search. It receives the text you sign and nothing else.</li>
        <li><strong>Two honest labels.</strong> Every Opinion says whether it came From the Record or is General Counsel, and whether it was written In Own Hand or Staff-Drafted and Signed. No pretending.</li>
        <li><strong>Encrypted, then deleted.</strong> Questions and Opinions are encrypted by the application with a key held outside the database, and deleted thirty days after the Request closes.</li>
        <li><strong>No model in the middle.</strong> The Cabinet Office runs no AI. It files, it stamps, it delivers.</li>
      </ul>

      <h2>What it is for</h2>
      <table>
        <tbody>
          <tr><td><strong>Recommend</strong></td><td>"What do you use for billing, and what would you avoid?" Answered from repos, decision docs and postmortems, not from the top of a head.</td></tr>
          <tr><td><strong>Handle</strong></td><td>"How did you deal with a co-founder who stopped showing up?" Answered from what actually happened, with the names taken out.</td></tr>
          <tr><td><strong>Find</strong></td><td>"Who could run podcast ad sales on commission?" Answered from years of contacts and meeting notes.</td></tr>
          <tr><td><strong>Weigh In</strong></td><td>"Should we bring back jingles as a product?" Answered from the campaigns they ran and what the numbers did.</td></tr>
          <tr><td><strong>Coordinate</strong></td><td>"Which weeks work for the family trip?" Answered from calendars, by each person's own assistant, without a forty-message thread.</td></tr>
        </tbody>
      </table>

      <h2>Why now</h2>
      <p>Two years ago this was impossible: nobody's AI had their record. Today most people you'd ask have one that does, and it can draft a page from it in a minute. What was missing was a polite, bounded way to ask. A procedure with rules, a signature, and a stamp.</p>

      <h2>What it is not</h2>
      <p>Not a group chat: contexts stay separate by design. Not a clone that answers for a person: nothing is sent without their hand on it. Not a public Q&amp;A: you ask people you already trust, and they can decline without a reason.</p>

      <h2>How it starts</h2>
      <ol className="procedure">
        <li>Sign in with a magic link and name a Cabinet.</li>
        <li>Issue one question. You get a link to share anywhere; no emails to collect.</li>
        <li>Your people open it, give their name, paste the packet into their own AI, paste the answer back, and sign.</li>
        <li>Read the signed Opinions and the Brief in your Briefing Room, or have your own AI read them over the Secure Line.</li>
      </ol>
      <p className="hero" style={{ borderBottom: 0 }}><Link href="/login" className="button">Convene a Cabinet</Link> &nbsp; <Link href="/" className="button secondary">See how it works</Link></p>
    </>
  );
}
