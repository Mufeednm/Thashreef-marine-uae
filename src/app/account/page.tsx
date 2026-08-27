import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { CustomerOrdersPage } from "@/features/orders/components/customer-orders-page";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export const metadata = { title: "My account | Marsa Edge Marine LLC" };

export default async function AccountPage(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const user = await restoreSessionUser(repository, await readSessionUser());
  if (!user || user.role !== "customer") redirect("/?login=required");
  const [customer, orders] = await Promise.all([
    repository.findCustomerByEmail(user.email),
    repository.listCustomerOrderDetails(user.email, 30),
  ]);
  return (
    <CustomerOrdersPage
      customer={{ email: user.email, name: user.name, phone: customer?.phone ?? null }}
      orders={orders}
    />
  );
}
