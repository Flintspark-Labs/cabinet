// Illustrations for the public site: what the Secure Line looks like from each side. Static, no live data.
const Tool = ({ name, args, result }: { name: string; args: string; result: string }) => (
  <div className="tool">
    <div className="tool-call"><span className="tool-dot" />Called <code>{name}</code> on The Cabinet <span className="tool-args">{args}</span></div>
    <div className="tool-result">{result}</div>
  </div>
);
const User = ({ children }: { children: React.ReactNode }) => <div className="msg user"><span className="who">You</span><div>{children}</div></div>;
const Ai = ({ children }: { children: React.ReactNode }) => <div className="msg ai"><span className="who">Claude</span><div>{children}</div></div>;

export function SecretaryExhibit() {
  return (
    <div className="window">
      <div className="titlebar"><span className="dots" /><span>Claude Desktop</span><span className="conn">connector: The Cabinet · files, mail and notes: on</span></div>
      <div className="chat">
        <User>Flint sent me a Cabinet dispatch. Token: <code>q8Zx…Vm2k</code>. Draft my opinion.</User>
        <Ai>
          <Tool name="get_dispatch" args="{ dispatch_token: “q8Zx…Vm2k” }" result="RFC-0012 · Recommend · return by Tue 10 Nov. Standing Orders received. Question: “What database would you pick for a small ad-ops platform, and why?”" />
          <p>I read the Standing Orders. I'll answer only this question, from your own record, and replace names and figures with roles and ranges.</p>
          <p className="local">Reading on this machine, nothing sent: <em>2023 database migration notes · #platform-infra thread, Mar–Jun 2024 · two on-call postmortems</em></p>
          <div className="draft">
            <p><strong>Basis:</strong> From the Record</p>
            <p><strong>Opinion:</strong> Postgres, managed. You chose it for a system of similar size after a migration off a document store, and the notes record why: the ad-serving queries were relational from day one, and the document model forced application-side joins. The migration cost roughly a quarter of one engineer's time. Since then it has been the one component that never appeared in a postmortem. For a two-person team on Vercel, use a managed provider with backups and row-level security built in; you wrote in the thread that running your own instance was the mistake you would not repeat.</p>
            <p><strong>Sources consulted:</strong> the migration notes, the infra channel thread, the postmortems. Not quoted.</p>
          </div>
          <p>Shall I file this as a draft? You will sign it on the site; nothing is sent until then.</p>
        </Ai>
        <User>Yes, file it.</User>
        <Ai>
          <Tool name="submit_opinion" args="{ dispatch_token, body, basis: “record”, authorship: “staff_drafted” }" result="status: drafted · sign_url: https://cabinet.flintsparklabs.com/d/q8Zx…/sign" />
          <p>Filed as an unsigned draft. Review and sign here: <a href="#sign">cabinet.flintsparklabs.com/d/q8Zx…/sign</a></p>
        </Ai>
      </div>
    </div>
  );
}

export function SignExhibit() {
  return (
    <div className="window page" id="sign">
      <div className="titlebar"><span className="dots" /><span>cabinet.flintsparklabs.com/d/q8Zx…/sign</span></div>
      <div className="page-body">
        <p className="docno">RFC-0012 / Signing</p>
        <h3 style={{ marginTop: 0 }}>Review and sign</h3>
        <p className="small">Read every line. Remove anything you would not say to Flint in person. Signing is the only act that sends the Opinion.</p>
        <div className="fake-textarea">Postgres, managed. You chose it for a system of similar size after a migration off a document store…</div>
        <div className="labels"><span className="label">From the Record</span><span className="label seal">Staff-Drafted, Signed</span></div>
        <p className="docno">Signed by Ada Okafor (ada@…)</p>
        <p><span className="button">Sign and send</span></p>
      </div>
    </div>
  );
}

export function PrincipalExhibit() {
  return (
    <div className="window">
      <div className="titlebar"><span className="dots" /><span>Claude</span><span className="conn">connector: The Cabinet · signed in as Flint</span></div>
      <div className="chat">
        <User>Ask my Kitchen Cabinet what database they'd pick for the ad-ops platform. Give them a week.</User>
        <Ai>
          <Tool name="issue_request" args="{ cabinet_id, class: “recommend”, question, return_by: +7d }" result="RFC-0012 issued · dispatched to 4 Secretaries" />
          <p>Issued as RFC-0012. Ada, Lin, Marcus and Priya each have a private link. I'll check back when Opinions are signed.</p>
        </Ai>
        <User>Three days later: what came back?</User>
        <Ai>
          <Tool name="get_brief" args="{ request_id }" result="Brief · RFC-0012 · dispatched 4 · signed 3 · recused 1" />
          <p>Three signed Opinions, one recusal. All three say Postgres. Two answer <em>From the Record</em>: Ada from a migration she ran, Lin from an incident review. Marcus answers as <em>General Counsel</em> and adds one caution about connection limits on serverless hosts, which the other two do not mention. Priya recused. The signed Opinions and the full Brief are in your Briefing Room.</p>
        </Ai>
      </div>
    </div>
  );
}
