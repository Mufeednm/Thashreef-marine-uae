import { z } from "zod";

const serverEnvironmentSchema = z.object({
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  // Local WAMP/XAMPP installations commonly use the root account without a password.
  // The variable remains required, but its value may be intentionally empty in `.env.local`.
  DB_PASSWORD: z.string(),
  DB_SSL: z.enum(["true", "false"]).default("false"),
  CATALOG_UPLOADS_DIRECTORY: z.string().trim().min(1).optional(),
  SEED_DEMO_DATA: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  SMTP_HOST: z.string().trim().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().trim().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  SMTP_FROM: z.string().trim().email().optional(),
  STRIPE_SECRET_KEY: z.string().trim().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().trim().min(1).optional().or(z.literal("")),
});
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
export function getServerEnvironment(): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse(process.env);
  if (!result.success)
    throw new Error(
      `Invalid server environment: ${result.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  return result.data;
}
