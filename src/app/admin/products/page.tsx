import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import {
  listCatalogCategories,
  listCatalogProducts,
  listCatalogVariants,
} from "@/application/catalog/catalog-service";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { AdminProductsPage } from "@/features/admin/components/admin-products-page";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function AdminProductsRoute(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const sessionUser = await restoreSessionUser(repository, await readSessionUser());

  if (!sessionUser || (sessionUser.role !== "admin" && sessionUser.role !== "staff")) {
    redirect("/admin/login");
  }

  const [products, categories, variants] = await Promise.all([
    listCatalogProducts(repository),
    listCatalogCategories(repository),
    listCatalogVariants(repository),
  ]);

  return (
    <AdminShell
      actions={
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#f05a28] px-5 text-sm font-bold text-white transition hover:bg-[#d94d20]"
          href="/admin/products/new"
        >
          Add product
        </Link>
      }
      description="Browse the imported marine catalog, inspect pricing, and navigate product work from a dedicated list page."
      eyebrow="Catalog"
      title="Products"
    >
      <AdminProductsPage categories={categories} products={products} variants={variants} />
    </AdminShell>
  );
}
