"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-renders the server page every few seconds so a draft filed over the Secure Line, or a newly signed Opinion, appears without a manual reload.
export function AutoRefresh({ seconds = 5 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
