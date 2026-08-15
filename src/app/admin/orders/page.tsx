import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { AdminOrdersPage } from "@/features/orders/components/admin-orders-page";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function OrdersRoute(): Promise<ReactElement> { const repository = createDemoStoreRepository(); const user = await restoreSessionUser(repository, await readSessionUser()); if (!user || (user.role !== "admin" && user.role !== "staff")) redirect("/admin/login"); const orders = await repository.listOrders(100); const orderDetails = (await Promise.all(orders.map((order) => repository.getOrderDetail(order.id)))).filter((order) => order !== null); return <AdminShell description="Review each customer request, its delivery details and item list, then record the fulfilment decision." eyebrow="Orders" title="Order management"><AdminOrdersPage orderDetails={orderDetails} orders={orders} /></AdminShell>; }
