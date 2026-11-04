export default function Privacy() {
  return (
    <>
      <p className="docno">Flintspark Labs · Office of the Cabinet</p>
      <h1>Privacy</h1>
      <p>The Cabinet is a small open-source service run by Flintspark Labs. This page says what it holds, for how long, and what it never sees. Last revised 3 November 2026.</p>
      <h2>What we hold</h2>
      <ul>
        <li><strong>Principals:</strong> your email (for sign-in), a display name, the Cabinets you convene and the Requests you issue.</li>
        <li><strong>Secretaries:</strong> the name you give, your email only if you give it, and the Opinion you sign. Nothing else from your side. A draft you never sign is deleted with the Request.</li>
        <li><strong>Records:</strong> timestamps, status of each Dispatch, and an audit log of issues, dispatches, recusals, signatures and deletions.</li>
      </ul>
      <h2>What we never see</h2>
      <p>Your sources. Your AI reads your email, files and notes on your side. The Cabinet Office receives only the text you paste or your assistant files, and only after you sign it does anyone else see it.</p>
      <h2>Encryption</h2>
      <p>Everything travels over TLS and is stored encrypted at rest. The question, the context, every Opinion and the Brief are additionally encrypted by the application with a key that is held outside the database.</p>
      <h2>Retention</h2>
      <p>Requests, Dispatches, Opinions and the Brief are deleted 30 days after a Request closes, unless the Principal pins it. Dispatch links expire at the return-by date.</p>
      <h2>Email</h2>
      <p>We send Dispatches, a reminder before the return-by date, and notices to the Principal. Every message to a Secretary carries a one-click opt-out that stops all future Dispatches to that address from anyone. <a href="/opt-out">Opt out here.</a></p>
      <h2>No model of our own</h2>
      <p>The Cabinet Office runs no AI. The Brief is the signed Opinions stacked and attributed. Nothing you send is used to train anything.</p>
      <h2>Providers</h2>
      <p>Hosting on Vercel, database and sign-in on Supabase, mail via Resend. Each processes data only to run the service.</p>
      <h2>Questions and deletion</h2>
      <p>Write to cabinet@flintsparklabs.com. A Principal can delete a Cabinet or Request at any time; a Secretary can ask us to delete anything tied to their name or email.</p>
      <p>The Cabinet is not a government service.</p>
    </>
  );
}
