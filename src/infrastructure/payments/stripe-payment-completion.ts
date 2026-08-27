import "server-only";

import type Stripe from "stripe";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { sendOrderConfirmationEmail } from "@/infrastructure/email/smtp-order-email-sender";

export async function completeStripeCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.payment_status !== "paid") return;
  const orderId = Number(session.metadata?.orderId);
  if (!Number.isSafeInteger(orderId) || orderId < 1) {
    throw new Error("Stripe checkout session has no valid order.");
  }

  const repository = createDemoStoreRepository();
  const paidNow = await repository.markStripeOrderPaid(orderId, session.id);
  if (!paidNow) return;

  const order = await repository.getOrderDetail(orderId);
  if (order) await sendOrderConfirmationEmail(order);
}
