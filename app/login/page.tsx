"use client";
import { useActionState } from "react";
import { sendMagicLink } from "@/lib/actions";

export default function Login() {
  const [state, action, pending] = useActionState(sendMagicLink, {});
  return (
    <>
      <p className="docno">Principal sign-in</p>
      <h1>Sign in by magic link</h1>
      <p>Enter your email. We send a link that signs you in. No password. Secretaries never need an account; they answer from the link in their Dispatch.</p>
      {state.sent ? <p className="notice">Check your email for the sign-in link.</p> : (
        <form action={action}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" required autoComplete="email" />
          {state.error && <p className="error">{state.error}</p>}
          <p><button type="submit" disabled={pending}>{pending ? "Sending…" : "Send the link"}</button></p>
        </form>
      )}
    </>
  );
}
