"use client";
import { useActionState } from "react";
import type { ReactNode } from "react";

type Action = (prev: unknown, f: FormData) => Promise<{ error?: string } | void>;

// A form bound to a server action; shows the action's error above the submit button.
export function ActionForm({ action, children, submit = "Submit", className }: { action: Action; children: ReactNode; submit?: string; className?: string }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error && <p className="error" role="alert">{state.error}</p>}
      <p><button type="submit" disabled={pending}>{pending ? "Working…" : submit}</button></p>
    </form>
  );
}
