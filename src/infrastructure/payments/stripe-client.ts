import "server-only";

import Stripe from "stripe";
import { getServerEnvironment } from "@/config/env";

export function getStripeClient(): Stripe {
  const secretKey = getServerEnvironment().STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Stripe is not configured.");
  return new Stripe(secretKey);
}

export function getStripeWebhookSecret(): string | null {
  return getServerEnvironment().STRIPE_WEBHOOK_SECRET ?? null;
}
