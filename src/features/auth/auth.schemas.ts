import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(3, { error: "Enter your username or email address." }).max(254),
  password: z.string().trim().min(8, { error: "Password must be at least 8 characters long." }),
});
