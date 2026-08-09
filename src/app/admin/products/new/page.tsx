import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { listCatalogAssignableCategories, listCatalogBrands } from "@/application/catalog/catalog-service";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { AddProductForm } from "@/features/catalog/components/add-product-form";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function AdminNewProductPage(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const sessionUser = await restoreSessionUser(repository, await readSessionUser());

  if (!sessionUser || sessionUser.role !== "admin") {
    redirect("/admin/login");
  }

  const [categories, brands] = await Promise.all([listCatalogAssignableCategories(repository), listCatalogBrands(repository)]);

  return (
    <AdminShell
      actions={
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          href="/admin/products"
        >
          Back to products
        </Link>
      }
      description="Create products from a dedicated page with clearer steps, better spacing, and real category selection."
      eyebrow="Catalog"
      title="Add product"
    >
      <AddProductForm brands={brands} categories={categories} />
    </AdminShell>
  );
}
