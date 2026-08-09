import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { AdminOrdersPage } from "@/features/orders/components/admin-orders-page";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function OrdersRoute(): Promise<ReactElement> { const repository = createDemoStoreRepository(); const user = await restoreSessionUser(repository, await readSessionUser()); if (!user || (user.role !== "admin" && user.role !== "staff")) redirect("/admin/login"); const orders = await repository.listOrders(100); return <AdminShell description="Review each customer request and record the fulfilment decision." eyebrow="Orders" title="Order management"><AdminOrdersPage orders={orders} /></AdminShell>; }
