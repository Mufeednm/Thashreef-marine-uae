import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, { error: "Enter your username." }).max(254),
  password: z.string().trim().min(8, { error: "Password must be at least 8 characters long." }),
});

export const customerOtpRequestSchema = z
  .object({
    email: z.string().trim().email({ error: "Enter a valid email address." }).max(254),
    name: z.string().trim().max(120),
    purpose: z.enum(["login", "registration"]),
  })
  .superRefine((values, context) => {
    if (values.purpose === "registration" && values.name.length < 2) {
      context.addIssue({ code: "custom", message: "Enter your full name.", path: ["name"] });
    }
  });

export const customerOtpVerificationSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: "Enter the 6-digit code." }),
  email: z.string().trim().email({ error: "Enter a valid email address." }).max(254),
  name: z.string().trim().max(120),
  purpose: z.enum(["login", "registration"]),
});

export const changeAdminPasswordSchema = z
  .object({
    confirmPassword: z
      .string()
      .min(8, { error: "Confirm the new password (at least 8 characters)." })
      .max(128),
    currentPassword: z.string().min(8, { error: "Enter your current password." }).max(128),
    newPassword: z
      .string()
      .min(8, { error: "Use at least 8 characters for the new password." })
      .max(128),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    error: "The new password and confirmation do not match.",
    path: ["confirmPassword"],
  });
