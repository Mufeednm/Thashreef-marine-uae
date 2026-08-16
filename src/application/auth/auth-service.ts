import type { DemoStoreRepository } from "@/domain/demo-store/demo-store-repository";
import type { SessionUser } from "@/domain/auth/user";
import { toSessionUser } from "@/domain/auth/user";
import { hashPassword, verifyPasswordHash } from "@/shared/security/password-hash";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export async function authenticateUser(
  repository: DemoStoreRepository,
  credentials: LoginCredentials,
): Promise<SessionUser | null> {
  const user = await repository.findUserByEmail(credentials.identifier);

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
  const password = hashPassword(input.password);
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

function verifyPassword(storedPassword: string, submittedPassword: string): boolean {
  return verifyPasswordHash(storedPassword, submittedPassword);
}
