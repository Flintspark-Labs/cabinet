"use client";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { optOut } from "@/lib/actions";

function Form() {
  const email = useSearchParams().get("email") ?? "";
  const [state, action, pending] = useActionState(optOut, {});
  return state.done ? <p className="notice">Done. No Cabinet will dispatch to that address again.</p> : (
    <form action={action}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" name="email" required defaultValue={email} />
      {state.error && <p className="error">{state.error}</p>}
      <p><button disabled={pending}>Stop all Dispatches</button></p>
    </form>
  );
}

export default function OptOut() {
  return (
    <>
      <p className="docno">Global opt-out</p>
      <h1>Opt out of Dispatches</h1>
      <p>Add your address and no Principal can dispatch a Request for Counsel to it, from any Cabinet, now or later. This cannot be undone from the site; write to us if you change your mind.</p>
      <Suspense><Form /></Suspense>
    </>
  );
}
