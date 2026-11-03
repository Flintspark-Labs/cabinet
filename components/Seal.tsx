// An original seal mark. It imitates no real government seal or agency.
export function Seal({ size = 120 }: { size?: number }) {
  return (
    <svg className="seal" width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Seal of The Cabinet">
      <defs><path id="ring" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#7a1f1f" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="51" fill="none" stroke="#7a1f1f" strokeWidth="0.8" />
      <circle cx="60" cy="60" r="35" fill="none" stroke="#7a1f1f" strokeWidth="1.2" />
      <text fontFamily="Georgia, serif" fontSize="8.2" fill="#7a1f1f" letterSpacing="2.4" fontWeight="700">
        <textPath href="#ring" startOffset="2%">THE CABINET · COUNSEL SIGNED BY HAND · FLINTSPARK LABS ·</textPath>
      </text>
      <g stroke="#7a1f1f" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M42 78 L78 78" />
        <path d="M46 74 L46 52 M54 74 L54 48 M66 74 L66 48 M74 74 L74 52" />
        <path d="M40 48 L60 36 L80 48" />
        <path d="M60 36 L60 30" />
      </g>
      <circle cx="60" cy="27" r="2.2" fill="#7a1f1f" />
    </svg>
  );
}
