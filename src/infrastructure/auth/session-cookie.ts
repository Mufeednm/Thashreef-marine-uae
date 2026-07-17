import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import type { SessionUser } from "@/domain/auth/user";

const sessionCookieName = "thashreef_demo_session";
const sessionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "staff", "customer"]),
});

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function readSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(sessionCookieName)?.value;

  if (!sessionCookie) {
    return null;
  }

  const [payload, signature] = sessionCookie.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);

  if (!safeCompare(expectedSignature, signature)) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as unknown;
    const parsedSession = sessionSchema.safeParse(decodedPayload);

    if (!parsedSession.success) {
      return null;
    }

    return parsedSession.data;
  } catch {
    return null;
  }
}

export async function writeSessionCookie(user: SessionUser): Promise<void> {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = signPayload(payload);

  cookieStore.set(sessionCookieName, `${payload}.${signature}`, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function getSessionSecret(): string {
  return process.env.AUTH_SECRET ?? "thashreef-local-demo-secret";
}

function safeCompare(leftValue: string, rightValue: string): boolean {
  const left = Buffer.from(leftValue);
  const right = Buffer.from(rightValue);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}
