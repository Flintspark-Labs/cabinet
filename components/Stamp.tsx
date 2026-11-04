// A rubber stamp. `slam` animates it landing (use once, on the page the signer lands on).
export function Stamp({ text, sub, slam = false, small = false }: { text: string; sub?: string; slam?: boolean; small?: boolean }) {
  return (
    <div className={`stamp${slam ? " slam" : ""}${small ? " small" : ""}`} aria-label={`${text}${sub ? ` ${sub}` : ""}`}>
      <span className="stamp-text">{text}</span>
      {sub && <span className="stamp-sub">{sub}</span>}
    </div>
  );
}
