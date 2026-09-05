import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { NgeniusCheckoutSuccess } from "@/features/checkout/components/ngenius-checkout-success";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { completeNgeniusOrder } from "@/infrastructure/payments/ngenius-payment-completion";
import { retrieveNgeniusOrder } from "@/infrastructure/payments/ngenius-client";

export default async function NgeniusCheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; ref?: string }>;
}): Promise<ReactElement> {
  const orderId = Number((await searchParams).order_id);
  if (!Number.isSafeInteger(orderId) || orderId < 1) notFound();

  const repository = createDemoStoreRepository();
  const user = await restoreSessionUser(repository, await readSessionUser());
  if (!user || user.role !== "customer") redirect("/checkout");

  const order = await repository.getOrderDetail(orderId);
  if (!order || order.customerEmail.trim().toLowerCase() !== user.email.trim().toLowerCase() || !order.paymentReference) {
    notFound();
  }
  try {
    await completeNgeniusOrder(orderId, await retrieveNgeniusOrder(order.paymentReference));
  } catch {
    redirect("/checkout?ngenius=verification");
  }
  const completedOrder = await repository.getOrderDetail(orderId);
  if (!completedOrder || completedOrder.paymentStatus !== "paid") {
    redirect("/checkout?ngenius=cancelled");
  }
  return (
    <NgeniusCheckoutSuccess
      customerName={user.name}
      orderId={completedOrder.id}
      totalAedCents={completedOrder.totalAedCents}
    />
  );
}
