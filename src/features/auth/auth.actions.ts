"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authenticateUser, registerCustomer } from "@/application/auth/auth-service";
import type { SessionUser } from "@/domain/auth/user";
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
      message: "Enter your email address and password to continue.",
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
      message: "The email address or password is incorrect.",
      status: "error",
    };
  }

  await writeSessionCookie(authenticatedUser);
  const redirectTo = formData.get("redirectTo");
  const destination =
    typeof redirectTo === "string" && redirectTo.startsWith("/")
      ? redirectTo
      : authenticatedUser.role === "admin" || authenticatedUser.role === "staff"
        ? "/admin"
        : "/";
  redirect(destination);
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
    countryCode: formData.get("countryCode"),
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Please correct the highlighted fields. Your details have been kept below.",
      status: "error",
      values: registrationValues(formData),
    };
  }
  const { countryCode, ...customerInput } = parsed.data;
  const phone = `${countryCode}${customerInput.phone}`;
  const repository = createDemoStoreRepository();
  const existingPhone = await repository.findCustomerByPhone(phone);
  if (existingPhone) {
    return {
      fieldErrors: { phone: ["An account already uses this country code and mobile number."] },
      message: "Use a different mobile number or sign in to the existing account.",
      status: "error",
      values: registrationValues(formData),
    };
  }
  let user: SessionUser | null;
  try {
    user = await registerCustomer(repository, { ...customerInput, phone });
  } catch (error) {
    console.error("Customer registration failed", error);
    return {
      message: "We could not create your account. Please try again.",
      status: "error",
      values: registrationValues(formData),
    };
  }
  if (!user)
    return {
      fieldErrors: {
        email: ["An account already uses this email address. Please sign in instead."],
      },
      message: "We could not create this account. Your details have been kept below.",
      status: "error",
      values: registrationValues(formData),
    };
  revalidatePath("/admin/customers");
  revalidatePath("/admin");
  await writeSessionCookie(user);
  const redirectTo = formData.get("redirectTo");
  redirect(typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/");
}

function registrationValues(formData: FormData): NonNullable<LoginActionState["values"]> {
  const getValue = (name: string): string => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  return {
    countryCode: getValue("countryCode"),
    email: getValue("email"),
    name: getValue("name"),
    phone: getValue("phone"),
  };
}
