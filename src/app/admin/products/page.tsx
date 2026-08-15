import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import {
  listCatalogCategories,
  listCatalogBrands,
  listCatalogProducts,
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

  const [products, categories, brands] = await Promise.all([
    listCatalogProducts(repository),
    listCatalogCategories(repository),
    listCatalogBrands(repository),
  ]);

  return (
    <AdminShell
      description="Manage every product from one table. Create new products in a focused modal and use the action icons to view, edit, or delete records."
      eyebrow="Catalog"
      title="Products"
    >
      <AdminProductsPage brands={brands} categories={categories} products={products} />
    </AdminShell>
  );
}
