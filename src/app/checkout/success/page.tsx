import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { StripeCheckoutSuccess } from "@/features/checkout/components/stripe-checkout-success";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { getStripeClient } from "@/infrastructure/payments/stripe-client";
import { completeStripeCheckoutSession } from "@/infrastructure/payments/stripe-payment-completion";

export default async function StripeCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}): Promise<ReactElement> {
  const sessionId = (await searchParams).session_id;
  if (!sessionId) notFound();

  const repository = createDemoStoreRepository();
  const user = await restoreSessionUser(repository, await readSessionUser());
  if (!user || user.role !== "customer") redirect("/checkout");

  const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
  const orderId = Number(session.metadata?.orderId);
  if (
    session.payment_status !== "paid" ||
    session.client_reference_id !== user.id ||
    !Number.isSafeInteger(orderId) ||
    orderId < 1
  ) {
    notFound();
  }

  await completeStripeCheckoutSession(session);

  const order = await repository.getOrderDetail(orderId);
  if (!order || order.customerEmail.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
    notFound();
  }
  return (
    <StripeCheckoutSuccess
      customerName={user.name}
      orderId={order.id}
      totalAedCents={order.totalAedCents}
    />
  );
}
