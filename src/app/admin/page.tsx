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

  const [products, categories, variants, metrics, recentOrders] = await Promise.all([
    listCatalogProducts(repository),
    listCatalogCategories(repository),
    listCatalogVariants(repository),
    repository.getAdminOverviewMetrics(),
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
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#f05a28] px-5 text-sm font-bold text-white transition hover:bg-[#d94d20]"
            href="/admin/products/new"
          >
            Add product
          </Link>
        </>
      }
      description="Start here for the catalog and workbook-backed commerce overview. The admin tools are now split into dedicated pages for easier catalog management."
      eyebrow="Overview"
      title="Store overview"
    >
      <AdminOverviewPage
        categories={categories}
        metrics={metrics}
        products={products}
        recentOrders={recentOrders}
        variants={variants}
      />
    </AdminShell>
  );
}
