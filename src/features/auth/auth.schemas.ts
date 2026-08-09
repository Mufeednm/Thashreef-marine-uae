import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(3, { error: "Enter your username or email address." }).max(254),
  password: z.string().trim().min(8, { error: "Password must be at least 8 characters long." }),
});

export const registrationSchema = z.object({
  email: z.string().trim().email({ error: "Enter a valid email address." }).max(254),
  name: z.string().trim().min(2, { error: "Enter your full name." }).max(120),
  password: z.string().min(8, { error: "Use at least 8 characters for your password." }).max(128),
  phone: z.string().trim().min(7, { error: "Enter a valid mobile number." }).max(32),
});
