// An original seal mark, rendered as a rubber stamp: uneven ink edge, speckled voids, slight tilt. It imitates no real government seal.
// SVG filters only (turbulence + displacement + speckle mask), a few hundred bytes, cheap at seal sizes. Static, so reduced-motion needs nothing.
export function Seal({ size = 120, flat = false }: { size?: number; flat?: boolean }) {
  const id = `seal${size}${flat ? "f" : ""}`;
  const ink = flat ? undefined : `url(#${id}-ink)`;
  return (
    <svg className="seal" width={size} height={size} viewBox="-6 -6 132 132" role="img" aria-label="Seal of The Cabinet">
      <defs>
        <path id={`${id}-ring`} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        {!flat && (<>
          <filter id={`${id}-ink`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="edge" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.9" result="speckle" />
            <feComposite in="edge" in2="speckle" operator="in" result="inked" />
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" seed="11" result="density" />
            <feColorMatrix in="density" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0.6" result="pressure" />
            <feComposite in="inked" in2="pressure" operator="in" />
          </filter>
        </>)}
      </defs>
      <g filter={ink} transform={flat ? undefined : "rotate(-4 60 60)"} fill="none" stroke="#8a2420" strokeLinecap="round">
        <circle cx="60" cy="60" r="56" strokeWidth="2.6" />
        <circle cx="60" cy="60" r="51" strokeWidth="0.9" />
        <circle cx="60" cy="60" r="35" strokeWidth="1.3" />
        <text fontFamily="Georgia, serif" fontSize="8.4" fill="#8a2420" stroke="none" fontWeight="700">
          <textPath href={`#${id}-ring`} textLength="274" lengthAdjust="spacing">THE CABINET · COUNSEL SIGNED BY HAND ·</textPath>
        </text>
        <g strokeWidth="2.1">
          <path d="M42 78 L78 78" />
          <path d="M46 74 L46 52 M54 74 L54 48 M66 74 L66 48 M74 74 L74 52" />
          <path d="M40 48 L60 36 L80 48" />
          <path d="M60 36 L60 30" />
        </g>
        <circle cx="60" cy="27" r="2.2" fill="#8a2420" stroke="none" />
      </g>
    </svg>
  );
}
