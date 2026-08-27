"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  authenticateUser,
  changeAdminPassword,
  registerCustomer,
  requestCustomerEmailOtp,
  verifyCustomerEmailOtp,
} from "@/application/auth/auth-service";
import type { SessionUser } from "@/domain/auth/user";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import {
  clearSessionCookie,
  readSessionUser,
  writeSessionCookie,
} from "@/infrastructure/auth/session-cookie";
import {
  changeAdminPasswordSchema,
  customerOtpRequestSchema,
  customerOtpVerificationSchema,
  loginSchema,
} from "@/features/auth/auth.schemas";
import type { ChangeAdminPasswordActionState, LoginActionState } from "@/features/auth/auth.types";

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsedCredentials = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsedCredentials.success) {
    return {
      fieldErrors: parsedCredentials.error.flatten().fieldErrors,
      message: "Enter your username and password to continue.",
      status: "error",
    };
  }

  const repository = createDemoStoreRepository();
  const authenticatedUser = await authenticateUser(repository, {
    identifier: parsedCredentials.data.identifier.toLowerCase(),
    password: parsedCredentials.data.password,
  });

  if (!authenticatedUser) {
    return {
      message: "The username or password is incorrect.",
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

export async function changeAdminPasswordAction(
  _previousState: ChangeAdminPasswordActionState,
  formData: FormData,
): Promise<ChangeAdminPasswordActionState> {
  const parsed = changeAdminPasswordSchema.safeParse({
    confirmPassword: formData.get("confirmPassword"),
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Please correct the password fields.",
      status: "error",
    };
  }

  const result = await changeAdminPassword(
    createDemoStoreRepository(),
    await readSessionUser(),
    parsed.data,
  );
  if (!result.ok) {
    const messages = {
      "invalid-current-password": "Your current password is incorrect.",
      "same-password": "Choose a different new password.",
      unauthorized: "Only the signed-in administrator can change this password.",
    } satisfies Record<typeof result.reason, string>;
    return { message: messages[result.reason], status: "error" };
  }

  revalidatePath("/admin/settings");
  return {
    message: "Password changed. Your previous password no longer works.",
    status: "success",
  };
}

export async function requestCustomerEmailOtpAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = customerOtpRequestSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    purpose: formData.get("purpose"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Please correct the highlighted fields.",
      status: "error",
      values: customerValues(formData),
    };
  }
  const result = await requestCustomerEmailOtp(createDemoStoreRepository(), parsed.data);
  if (!result.ok) {
    const messages = {
      "account-exists": "An account already uses this email address. Please sign in instead.",
      "account-not-found":
        "No customer account was found for this email address. Please register first.",
      cooldown: "Please wait one minute before requesting another code.",
      "delivery-failed": "We could not send the verification email. Please try again later.",
    } satisfies Record<typeof result.reason, string>;
    return { message: messages[result.reason], status: "error", values: parsed.data };
  }
  return {
    message: "We sent a 6-digit verification code to your email address.",
    otpRequested: true,
    status: "success",
    values: parsed.data,
  };
}

export async function verifyCustomerEmailOtpAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = customerOtpVerificationSchema.safeParse({
    code: formData.get("code"),
    email: formData.get("email"),
    name: formData.get("name"),
    purpose: formData.get("purpose"),
  });
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Enter the verification code we emailed you.",
      status: "error",
      values: customerValues(formData),
    };
  }
  const repository = createDemoStoreRepository();
  const verification = await verifyCustomerEmailOtp(repository, parsed.data);
  if (verification !== "verified") {
    const messages = {
      expired: "This code has expired. Request a new one.",
      invalid: "That verification code is not correct.",
      locked: "Too many incorrect attempts. Request a new code.",
    } satisfies Record<Exclude<typeof verification, "verified">, string>;
    return { message: messages[verification], status: "error", values: parsed.data };
  }

  let user: SessionUser | null;
  if (parsed.data.purpose === "registration") {
    user = await registerCustomer(repository, { email: parsed.data.email, name: parsed.data.name });
    if (!user) {
      return {
        message: "This email address is already registered. Please sign in instead.",
        status: "error",
        values: parsed.data,
      };
    }
    revalidatePath("/admin/customers");
    revalidatePath("/admin");
  } else {
    const existingUser = await repository.findUserByEmail(parsed.data.email);
    user = existingUser?.role === "customer" ? existingUser : null;
    user = user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
  }
  if (!user) {
    return {
      message: "We could not sign you in. Request a new code and try again.",
      status: "error",
    };
  }
  await writeSessionCookie(user);
  const redirectTo = formData.get("redirectTo");
  redirect(typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/");
}

function customerValues(formData: FormData): NonNullable<LoginActionState["values"]> {
  const getValue = (name: string): string => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  return {
    email: getValue("email"),
    name: getValue("name"),
  };
}
