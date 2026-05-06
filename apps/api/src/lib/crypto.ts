import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const SALT = "tufact-v1";

function getKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_KEY ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "0123456789012345678901234567890-dev-only");
  if (!secret || secret.length < 32) {
    throw new Error(
      "ENCRYPTION_KEY must be set (min 32 chars recommended; use a random hex or base64 string).",
    );
  }
  return scryptSync(secret, SALT, 32);
}

export function encryptString(plain: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptString(payload: string): string {
  const key = getKey();
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, IV_LEN);
  const tag = raw.subarray(IV_LEN, IV_LEN + 16);
  const data = raw.subarray(IV_LEN + 16);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
