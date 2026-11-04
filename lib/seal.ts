import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Application-level encryption for the question, context, Opinions and Brief. AES-256-GCM, key from APP_SECRET (64 hex chars).
// Rows written before the key was set, or in dev without one, stay plaintext and still read.
const PREFIX = "enc1:";
const key = () => {
  const hex = process.env.APP_SECRET;
  if (!hex || hex.length !== 64) throw new Error("APP_SECRET must be 32 bytes as hex");
  return Buffer.from(hex, "hex");
};

export function seal(text: string) {
  if (!process.env.APP_SECRET) return text;
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return PREFIX + Buffer.concat([iv, c.getAuthTag(), body]).toString("base64");
}

export function open(text: string | null | undefined) {
  if (!text || !text.startsWith(PREFIX)) return text ?? "";
  const buf = Buffer.from(text.slice(PREFIX.length), "base64");
  const d = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}
