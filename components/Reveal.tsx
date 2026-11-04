"use client";
import { useEffect } from "react";

// Adds .in to cards, windows and headings as they scroll into view. Pure CSS does the motion.
export function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("main .card, main .window, main h2, main table, main ol.procedure li");
    els.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
