import { z } from "zod";

export const contactFormSchema = z.object({
  email: z.string().trim().email({ error: "Enter a valid email address." }).max(254),
  message: z
    .string()
    .trim()
    .min(10, { error: "Tell us how we can help (at least 10 characters)." })
    .max(3000),
  name: z.string().trim().min(2, { error: "Enter your full name." }).max(120),
  phone: z.string().trim().min(6, { error: "Enter your phone or WhatsApp number." }).max(32),
  website: z.string().max(0).optional(),
});
