import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { ActionForm } from "@/components/ActionForm";
import { appointSecretary, removeSecretary } from "@/lib/actions";
import { CLASSES, rfcNumber, type RfcClass } from "@/lib/classes";

export default async function Cabinet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: cab } = await supabase.from("cabinets").select("id, name, appointments(id, email, display_name, portfolio), requests(id, rfc_number, class, question, status, return_by, created_at)").eq("id", id).maybeSingle();
  if (!cab) notFound();
  const requests = [...cab.requests].sort((a, b) => b.rfc_number - a.rfc_number);
  return (
    <>
      <p className="docno"><Link href="/cabinets">Cabinets</Link> / Cabinet</p>
      <h1>{cab.name}</h1>
      <p><Link href={`/requests/new?cabinet=${cab.id}`} className="button">Issue a Request for Counsel</Link></p>

      <h2>Secretaries</h2>
      <table><thead><tr><th>Name</th><th>Portfolio</th><th>Email</th><th></th></tr></thead>
        <tbody>{cab.appointments.map((a) => <tr key={a.id}><td>{a.display_name}</td><td>{a.portfolio ?? "—"}</td><td>{a.email ?? "joined by link"}</td>
          <td><form action={removeSecretary} style={{ margin: 0 }}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="cabinet_id" value={cab.id} /><button className="secondary" style={{ padding: "0.1rem 0.5rem", fontSize: "0.85rem" }}>Remove</button></form></td></tr>)}</tbody></table>
      <details><summary>Appoint a Secretary</summary>
        <ActionForm action={appointSecretary} submit="Appoint">
          <input type="hidden" name="cabinet_id" value={cab.id} />
          <label htmlFor="email">Email</label><input id="email" type="email" name="email" required />
          <label htmlFor="name">Name</label><input id="name" type="text" name="name" required maxLength={120} />
          <label htmlFor="portfolio">Portfolio <small>optional, e.g. Secretary of Databases</small></label><input id="portfolio" type="text" name="portfolio" maxLength={120} />
        </ActionForm>
      </details>

      <h2>Requests for Counsel</h2>
      {requests.length ? (
        <table><thead><tr><th>No.</th><th>Class</th><th>Question</th><th>Status</th><th>Return by</th></tr></thead>
          <tbody>{requests.map((r) => <tr key={r.id}><td><Link href={`/requests/${r.id}`}>{rfcNumber(r.rfc_number)}</Link></td><td>{CLASSES[r.class as RfcClass].label}</td><td>{r.question}</td><td className={`status ${r.status}`}>{r.status}</td><td>{new Date(r.return_by).toLocaleDateString()}</td></tr>)}</tbody></table>
      ) : <p>No Requests yet.</p>}
    </>
  );
}
