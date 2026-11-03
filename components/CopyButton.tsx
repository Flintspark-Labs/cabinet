"use client";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}>
      {done ? "Copied" : "Copy the Dispatch Packet"}
    </button>
  );
}
