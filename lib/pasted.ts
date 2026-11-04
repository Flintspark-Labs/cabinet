// Accepts the whole block an assistant hands back in the packet FORMAT: reads the Basis line, drops the "Opinion:" label.
export function parsePasted(body: string, basis: "record" | "general" | "") {
  body = body.trim();
  const m = body.match(/^\s*Basis:\s*(From the Record|General Counsel)\s*\n/i);
  if (m) {
    basis = basis || (/record/i.test(m[1]) ? "record" : "general");
    body = body.slice(m[0].length).replace(/^\s*Opinion:\s*\n?/i, "").trim();
  }
  return { body, basis };
}

