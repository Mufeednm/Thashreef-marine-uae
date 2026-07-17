import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import {
  listCatalogCategories,
  listCatalogCategoryFields,
} from "@/application/catalog/catalog-service";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { CategoryManager } from "@/features/catalog/components/category-manager";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function AdminCategoriesRoute(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const sessionUser = await restoreSessionUser(repository, await readSessionUser());

  if (!sessionUser || sessionUser.role !== "admin") {
    redirect("/admin");
  }

  const [categories, fields] = await Promise.all([
    listCatalogCategories(repository),
    listCatalogCategoryFields(repository),
  ]);

  return (
    <AdminShell
      description="Create standalone categories and define many custom fields for each category."
      eyebrow="Catalog"
      title="Categories"
    >
      <CategoryManager categories={categories} fields={fields} />
    </AdminShell>
  );
}
