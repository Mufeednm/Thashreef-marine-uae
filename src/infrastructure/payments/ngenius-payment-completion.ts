import "server-only";

import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { sendOrderConfirmationEmail } from "@/infrastructure/email/smtp-order-email-sender";
import type { NgeniusOrder } from "@/infrastructure/payments/ngenius-client";

export async function completeNgeniusOrder(orderId: number, payment: NgeniusOrder): Promise<boolean> {
  const repository = createDemoStoreRepository();
  const order = await repository.getOrderDetail(orderId);
  const paymentState = payment._embedded?.payment[0];
  if (
    !order ||
    order.paymentMethod !== "ngenius" ||
    order.paymentReference !== payment.reference ||
    payment.action !== "PURCHASE" ||
    payment.amount.currencyCode !== "AED" ||
    payment.amount.value !== order.totalAedCents ||
    paymentState?.state !== "PURCHASED"
  ) {
    return false;
  }
  const paidNow = await repository.markNgeniusOrderPaid(orderId, payment.reference);
  if (paidNow) {
    const paidOrder = await repository.getOrderDetail(orderId);
    if (paidOrder) await sendOrderConfirmationEmail(paidOrder);
  }
  return paidNow;
}
