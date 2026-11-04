"use client";
import { useEffect, useRef } from "react";

// An engraved brain, lathe-work style, with the Cabinet's smaller brains linked around it, drawn on a canvas behind the hero.
// Canvas 2D, no library: a few kilobytes, runs on phones, pauses offscreen, static under reduced motion.
export function Guilloche() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, t = 0, visible = true;
    const size = () => { const r = c.parentElement!.getBoundingClientRect(); const dpr = Math.min(devicePixelRatio || 1, 2); c.width = r.width * dpr; c.height = r.height * dpr; c.style.width = r.width + "px"; c.style.height = r.height + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    // Concentric contours whose edges ripple like gyri, a flatter base, and a midline fissure.
    const brain = (cx: number, cy: number, R: number, ph: number, rings: number) => {
      for (let k = 0; k < rings; k++) {
        const s = 1 - k * (0.8 / rings);
        ctx.beginPath();
        for (let i = 0; i <= 720; i++) {
          const a = (i / 720) * Math.PI * 2;
          const bump = 1 + (0.05 + 0.05 * s) * Math.sin(11 * a + ph + k * 0.9 + t * 0.3) + 0.03 * Math.sin(5 * a - t * 0.2 + ph);
          const r = R * s * bump;
          const x = cx + r * Math.cos(a), y = cy + r * 0.74 * Math.sin(a) * (Math.sin(a) > 0 ? 0.85 : 1);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      }
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const f = i / 60; const y = cy - R * 0.72 + f * R * 1.3; const x = cx + Math.sin(f * 9 + ph + t * 0.3) * R * 0.025; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    };
    const draw = () => {
      const w = c.clientWidth, h = c.clientHeight; ctx.clearRect(0, 0, w, h);
      const narrow = w < 640;
      ctx.lineWidth = narrow ? 0.9 : 0.7; ctx.strokeStyle = narrow ? "rgba(122,31,31,0.4)" : "rgba(122,31,31,0.34)";
      const cx = w / 2, cy = h * 0.42, R = narrow ? w * 0.42 : Math.min(w, h) * 0.34;
      brain(cx, cy, R, 0, 6);
      // The Cabinet: smaller brains on the Secure Line, each joined to the Principal's.
      if (!narrow) {
        const seats = [200, 160, 235, 305, 340, 20];
        seats.forEach((deg, i) => {
          const a = (deg * Math.PI) / 180, sx = cx + R * 1.5 * Math.cos(a), sy = cy + R * 1.05 * Math.sin(a);
          ctx.beginPath(); ctx.moveTo(cx + R * 0.92 * Math.cos(a), cy + R * 0.68 * Math.sin(a)); ctx.lineTo(sx, sy); ctx.stroke();
          brain(sx, sy, R * 0.16, i * 1.7, 3);
        });
      }
      // Fade edges into the paper.
      const g = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 2.1);
      g.addColorStop(0, "rgba(247,243,234,0)"); g.addColorStop(1, narrow ? "rgba(247,243,234,0.85)" : "rgba(247,243,234,1)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    };
    const loop = () => { if (visible && !reduce) { t += c.clientWidth < 640 ? 0.02 : 0.012; draw(); } raf = requestAnimationFrame(loop); };
    size(); draw(); if (!reduce) raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(c);
    addEventListener("resize", size);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="guilloche" aria-hidden="true" />;
}
