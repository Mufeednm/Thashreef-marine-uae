"use server";

import { redirect } from "next/navigation";
import { authenticateUser, registerCustomer } from "@/application/auth/auth-service";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { clearSessionCookie, writeSessionCookie } from "@/infrastructure/auth/session-cookie";
import { loginSchema, registrationSchema } from "@/features/auth/auth.schemas";
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
  const redirectTo = formData.get("redirectTo");
  redirect(typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}

export async function registerAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = registrationSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, message: "Please correct the highlighted details.", status: "error" };
  }
  const user = await registerCustomer(createDemoStoreRepository(), parsed.data);
  if (!user) return { message: "An account with this email already exists. Please sign in instead.", status: "error" };
  await writeSessionCookie(user);
  const redirectTo = formData.get("redirectTo");
  redirect(typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/");
}
