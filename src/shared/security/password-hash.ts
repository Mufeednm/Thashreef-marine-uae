import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const derivedKeyLength = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, derivedKeyLength).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPasswordHash(storedPassword: string, submittedPassword: string): boolean {
  const [algorithm, salt, expectedHash, extraPart] = storedPassword.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHash || extraPart) return false;
  const actualHash = scryptSync(submittedPassword, salt, derivedKeyLength).toString("hex");
  return safeCompare(expectedHash, actualHash);
}

function safeCompare(leftValue: string, rightValue: string): boolean {
  const left = Buffer.from(leftValue, "hex");
  const right = Buffer.from(rightValue, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}
