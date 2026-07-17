"use server";

import { redirect } from "next/navigation";
import { authenticateUser } from "@/application/auth/auth-service";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { clearSessionCookie, writeSessionCookie } from "@/infrastructure/auth/session-cookie";
import { loginSchema } from "@/features/auth/auth.schemas";
import type { LoginActionState } from "@/features/auth/auth.types";

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsedCredentials = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedCredentials.success) {
    return {
      fieldErrors: parsedCredentials.error.flatten().fieldErrors,
      message: "Enter your username or email and password to continue.",
      status: "error",
    };
  }

  const repository = createDemoStoreRepository();
  const authenticatedUser = await authenticateUser(repository, {
    email: parsedCredentials.data.email.toLowerCase(),
    password: parsedCredentials.data.password,
  });

  if (!authenticatedUser) {
    return {
      message: "Those credentials did not match a local user account.",
      status: "error",
    };
  }

  await writeSessionCookie(authenticatedUser);
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
