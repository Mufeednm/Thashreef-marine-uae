import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { DemoStoreRepository } from "@/domain/demo-store/demo-store-repository";
import type { SessionUser } from "@/domain/auth/user";
import { toSessionUser } from "@/domain/auth/user";

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function authenticateUser(
  repository: DemoStoreRepository,
  credentials: LoginCredentials,
): Promise<SessionUser | null> {
  const user = await repository.findUserByEmail(credentials.email);

  if (!user) {
    return null;
  }

  if (!verifyPassword(user.password, credentials.password)) {
    return null;
  }

  return toSessionUser(user);
}

export async function registerCustomer(
  repository: DemoStoreRepository,
  input: { email: string; name: string; password: string; phone: string },
): Promise<SessionUser | null> {
  const salt = randomBytes(16).toString("hex");
  const password = `scrypt$${salt}$${scryptSync(input.password, salt, 64).toString("hex")}`;
  const user = await repository.createCustomer({ ...input, password });
  return user ? toSessionUser(user) : null;
}

export async function restoreSessionUser(
  repository: DemoStoreRepository,
  sessionUser: SessionUser | null,
): Promise<SessionUser | null> {
  if (!sessionUser) {
    return null;
  }

  const user = await repository.findUserById(sessionUser.id);

  if (!user) {
    return null;
  }

  return toSessionUser(user);
}

export async function requireAdminUser(
  repository: DemoStoreRepository,
  sessionUser: SessionUser | null,
): Promise<SessionUser | null> {
  const user = await restoreSessionUser(repository, sessionUser);

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}

function safeCompare(leftValue: string, rightValue: string): boolean {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function verifyPassword(storedPassword: string, submittedPassword: string): boolean {
  if (!storedPassword.startsWith("scrypt$")) return safeCompare(storedPassword, submittedPassword);
  const [, salt, expectedHash] = storedPassword.split("$");
  if (!salt || !expectedHash) return false;
  return safeCompare(expectedHash, scryptSync(submittedPassword, salt, 64).toString("hex"));
}
