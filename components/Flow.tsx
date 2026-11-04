// The four steps, just below the fold. Static, engraved glyphs in the seal colour.
const glyph = {
  ask: <path d="M10 6h20a2 2 0 0 1 2 2v26l-6-4H10a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM15 15c0-3 2.5-4.5 5-4.5s5 1.5 5 4c0 3.5-5 3-5 7M20 25.5v1.5" />,
  link: <path d="M17 23l6-6M14 27l-3 3a4.5 4.5 0 0 1-6.4-6.4l6-6a4.5 4.5 0 0 1 6.4 0M26 13l3-3a4.5 4.5 0 0 1 6.4 6.4l-6 6a4.5 4.5 0 0 1-6.4 0" />,
  brain: <path d="M20 8c-5 0-7 3-7 6-4 0-6 3-5 6-2 2-1 6 2 7 0 4 4 6 7 4 2 3 8 3 10 0 3 2 7 0 7-4 3-1 4-5 2-7 1-3-1-6-5-6 0-3-2-6-7-6zM20 8v26M13 14c2 1 3 3 2 5M27 14c-2 1-3 3-2 5M10 20c3 0 4 2 4 4M30 20c-3 0-4 2-4 4" />,
  seal: <path d="M20 5l3 2.5 3.8-.5 1.5 3.5 3.5 1.5-.5 3.8L34 20l-2.5 3 .5 3.8-3.5 1.5-1.5 3.5-3.8-.5L20 34l-3-2.5-3.8.5-1.5-3.5-3.5-1.5.5-3.8L6 20l2.5-3-.5-3.8 3.5-1.5 1.5-3.5 3.8.5zM14 20l4 4 8-8" />,
};
const steps: { g: keyof typeof glyph; title: string; text: string }[] = [
  { g: "ask", title: "Ask", text: "One question to the people you trust." },
  { g: "link", title: "Share a link", text: "By email, or drop one link in any chat. Each person takes a seat. No account." },
  { g: "brain", title: "Their AI thinks", text: "On their side, from their own record, under fixed rules." },
  { g: "seal", title: "They sign", text: "Each reads, edits and signs. You get the Opinions and one Brief." },
];
export function Flow() {
  return (
    <ol className="flow" aria-label="How it works">
      {steps.map((s) => (
        <li key={s.g}>
          <svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{glyph[s.g]}</svg>
          <strong>{s.title}</strong>
          <span>{s.text}</span>
        </li>
      ))}
    </ol>
  );
}
