import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import {
  listCatalogCategories,
  listCatalogProducts,
  listCatalogVariants,
} from "@/application/catalog/catalog-service";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { AdminOverviewPage } from "@/features/admin/components/admin-overview-page";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function AdminPage(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const sessionUser = await restoreSessionUser(repository, await readSessionUser());

  if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "staff")) {
    redirect("/admin/login");
  }

  const [products, categories, variants, metrics, activity, recentOrders] = await Promise.all([
    listCatalogProducts(repository),
    listCatalogCategories(repository),
    listCatalogVariants(repository),
    repository.getAdminOverviewMetrics(),
    repository.getAdminActivityMetrics(),
    repository.listRecentOrders(5),
  ]);

  return (
    <AdminShell
      actions={
        <>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            href="/admin/products"
          >
            View products
          </Link>
        </>
      }
      description="A focused view of catalog, customer, and order activity."
      eyebrow="Overview"
      title="Store overview"
    >
      <AdminOverviewPage
        categories={categories}
        activity={activity}
        metrics={metrics}
        products={products}
        recentOrders={recentOrders}
        variants={variants}
      />
    </AdminShell>
  );
}
