import { createHash, randomBytes } from "node:crypto";

// Dispatch token: 32 random bytes, stored only as a SHA-256 hash (Article VI.4).
export function newToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
