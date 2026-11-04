"use client";
import { useEffect, useRef } from "react";

// Engraved guilloche rosettes, like banknote lathe work, drawn on a canvas behind the hero.
// Canvas 2D, no library: a few kilobytes, runs on phones, pauses offscreen, static under reduced motion.
export function Guilloche() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, t = 0, visible = true;
    const size = () => { const r = c.parentElement!.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2); c.width = r.width * dpr; c.height = r.height * dpr; c.style.width = r.width + "px"; c.style.height = r.height + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = () => {
      const w = c.clientWidth, h = c.clientHeight; ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 0.6; ctx.strokeStyle = "rgba(122,31,31,0.28)";
      const cx = w / 2, cy = h * 0.42, R = Math.min(w, h) * 0.62;
      // Three hypotrochoid rings with slowly drifting phase.
      const rings = [[7, 0.62, 0.0], [11, 0.48, 1.3], [5, 0.80, 2.1]];
      for (const [k, s, ph] of rings) {
        ctx.beginPath();
        for (let i = 0; i <= 1400; i++) {
          const a = (i / 1400) * Math.PI * 2 * k;
          const r = R * (s + (1 - s) * 0.5 * (1 + Math.cos(a * (k - 1) / k + t * 0.4 + ph)));
          const x = cx + r * Math.cos(a / k + t * 0.05), y = cy + r * 0.62 * Math.sin(a / k + t * 0.05);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      // Fade edges into the paper.
      const g = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R * 0.95);
      g.addColorStop(0, "rgba(247,243,234,0)"); g.addColorStop(1, "rgba(247,243,234,1)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    };
    const loop = () => { if (visible && !reduce) { t += 0.012; draw(); } raf = requestAnimationFrame(loop); };
    size(); draw(); if (!reduce) raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(c);
    addEventListener("resize", size);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="guilloche" aria-hidden="true" />;
}
