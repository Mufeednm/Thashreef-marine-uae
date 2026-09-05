import type { ReactElement } from "react";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { CheckoutExperience } from "@/features/checkout/components/checkout-experience";
import { CheckoutLogin } from "@/features/checkout/components/checkout-login";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export const metadata = { title: "Checkout | Marsa Edge Marine LLC" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ ngenius?: string }>;
}): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const user = await restoreSessionUser(repository, await readSessionUser());
  if (!user || user.role !== "customer") return <CheckoutLogin />;
  const customer = await repository.findCustomerByEmail(user.email);
  const paymentNotice = (await searchParams).ngenius;
  return (
    <CheckoutExperience
      customer={{ email: user.email, name: user.name, phone: customer?.phone ?? "" }}
      paymentNotice={paymentNotice === "cancelled" || paymentNotice === "verification" ? paymentNotice : undefined}
    />
  );
}
