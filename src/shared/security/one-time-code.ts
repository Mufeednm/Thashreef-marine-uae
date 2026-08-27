import "server-only";
import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

const derivedKeyLength = 32;

export function createOneTimeCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export function hashOneTimeCode(code: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(code, salt, derivedKeyLength).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyOneTimeCode(storedCode: string, submittedCode: string): boolean {
  const [algorithm, salt, expectedHash, extraPart] = storedCode.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHash || extraPart) return false;

  const actualHash = scryptSync(submittedCode, salt, derivedKeyLength).toString("hex");
  const expected = Buffer.from(expectedHash, "hex");
  const actual = Buffer.from(actualHash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
