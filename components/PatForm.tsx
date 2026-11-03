"use client";
import { useActionState } from "react";
import { createPat } from "@/lib/actions";

export function PatForm() {
  const [state, action, pending] = useActionState(createPat, {});
  return (
    <form action={action}>
      {state.token && <div className="notice"><p>Copy this token now. It is shown once.</p><pre className="packet">{state.token}</pre></div>}
      <label htmlFor="pat_name">Token name <small>e.g. Claude Desktop</small></label>
      <input id="pat_name" type="text" name="name" maxLength={80} required />
      {state.error && <p className="error">{state.error}</p>}
      <p><button disabled={pending}>Issue token</button></p>
    </form>
  );
}
