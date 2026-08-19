import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, { error: "Enter your username or email address." }).max(254),
  password: z.string().trim().min(8, { error: "Password must be at least 8 characters long." }),
});

export const registrationSchema = z.object({
  countryCode: z.enum(["+971", "+966", "+968", "+974", "+965", "+973", "+91", "+92"], {
    error: "Choose a country code.",
  }),
  email: z.string().trim().email({ error: "Enter a valid email address." }).max(254),
  name: z.string().trim().min(2, { error: "Enter your full name." }).max(120),
  password: z.string().min(8, { error: "Use at least 8 characters for your password." }).max(128),
  phone: z
    .string()
    .trim()
    .regex(/^\d{6,14}$/, { error: "Enter 6–14 digits without the country code." }),
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
