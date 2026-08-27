import type {
  DemoStoreRepository,
  EmailOtpPurpose,
  EmailOtpVerificationResult,
} from "@/domain/demo-store/demo-store-repository";
import type { SessionUser } from "@/domain/auth/user";
import { toSessionUser } from "@/domain/auth/user";
import { hashPassword, verifyPasswordHash } from "@/shared/security/password-hash";
import { createOneTimeCode, hashOneTimeCode } from "@/shared/security/one-time-code";
import { sendEmailOtp } from "@/infrastructure/email/smtp-otp-email-sender";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export type RequestCustomerEmailOtpResult =
  | { ok: true }
  | { ok: false; reason: "account-exists" | "account-not-found" | "cooldown" | "delivery-failed" };

export type ChangeAdminPasswordResult =
  | { ok: true }
  | { ok: false; reason: "invalid-current-password" | "same-password" | "unauthorized" };

export async function authenticateUser(
  repository: DemoStoreRepository,
  credentials: LoginCredentials,
): Promise<SessionUser | null> {
  const user = await repository.findUserByEmail(credentials.identifier);

  if (
    !user ||
    user.role !== "admin" ||
    user.username.toLowerCase() !== credentials.identifier.trim().toLowerCase()
  ) {
    return null;
  }

  if (!verifyPassword(user.password, credentials.password)) {
    return null;
  }

  return toSessionUser(user);
}

export async function registerCustomer(
  repository: DemoStoreRepository,
  input: { email: string; name: string },
): Promise<SessionUser | null> {
  // Customer passwords are not used in the OTP flow. Keep a random, unusable hash to preserve
  // the existing non-null database column while admin accounts continue using real passwords.
  const password = hashPassword(`${createOneTimeCode()}-${createOneTimeCode()}-${Date.now()}`);
  const user = await repository.createCustomer({ ...input, password, phone: null });
  return user ? toSessionUser(user) : null;
}

export async function requestCustomerEmailOtp(
  repository: DemoStoreRepository,
  input: { email: string; name?: string; purpose: EmailOtpPurpose },
): Promise<RequestCustomerEmailOtpResult> {
  const email = input.email.trim().toLowerCase();
  const user = await repository.findUserByEmail(email);
  if (input.purpose === "registration" && user) return { ok: false, reason: "account-exists" };
  if (input.purpose === "login" && (!user || user.role !== "customer")) {
    return { ok: false, reason: "account-not-found" };
  }

  const code = createOneTimeCode();
  const challenge = await repository.createEmailOtpChallenge({
    codeHash: hashOneTimeCode(code),
    email,
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    purpose: input.purpose,
  });
  if (challenge.status === "cooldown") return { ok: false, reason: "cooldown" };

  try {
    await sendEmailOtp({ code, email, name: input.name });
  } catch (error) {
    await repository.deleteEmailOtpChallenge(challenge.id);
    console.error("Email OTP delivery failed", error);
    return { ok: false, reason: "delivery-failed" };
  }
  return { ok: true };
}

export async function verifyCustomerEmailOtp(
  repository: DemoStoreRepository,
  input: { code: string; email: string; purpose: EmailOtpPurpose },
): Promise<EmailOtpVerificationResult> {
  return repository.verifyEmailOtpChallenge(input);
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

export async function changeAdminPassword(
  repository: DemoStoreRepository,
  sessionUser: SessionUser | null,
  input: { currentPassword: string; newPassword: string },
): Promise<ChangeAdminPasswordResult> {
  const admin = await requireAdminUser(repository, sessionUser);
  if (!admin) return { ok: false, reason: "unauthorized" };

  const storedUser = await repository.findUserById(admin.id);
  if (!storedUser || !verifyPassword(storedUser.password, input.currentPassword)) {
    return { ok: false, reason: "invalid-current-password" };
  }
  if (verifyPassword(storedUser.password, input.newPassword)) {
    return { ok: false, reason: "same-password" };
  }

  return (await repository.updateUserPassword(admin.id, hashPassword(input.newPassword)))
    ? { ok: true }
    : { ok: false, reason: "unauthorized" };
}

function verifyPassword(storedPassword: string, submittedPassword: string): boolean {
  return verifyPasswordHash(storedPassword, submittedPassword);
}
