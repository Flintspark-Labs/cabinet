"use client";
import { useRef } from "react";
import { Seal } from "./Seal";

// The hero seal tilts toward the pointer like an embossed medallion; on touch it floats on its own.
export function TiltSeal({ size = 140 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current!; const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(600px) rotateX(${(-y * 18).toFixed(1)}deg) rotateY(${(x * 18).toFixed(1)}deg)`;
    el.style.setProperty("--sx", `${(x * 100 + 50).toFixed(0)}%`); el.style.setProperty("--sy", `${(y * 100 + 50).toFixed(0)}%`);
  };
  const reset = () => { const el = ref.current!; el.style.transform = ""; };
  return <div ref={ref} className="tilt" onPointerMove={move} onPointerLeave={reset}><Seal size={size} /><span className="sheen" /></div>;
}
