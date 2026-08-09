import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { listCatalogBrands } from "@/application/catalog/catalog-service";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { BrandManager } from "@/features/catalog/components/brand-manager";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function AdminBrandsPage(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const sessionUser = await restoreSessionUser(repository, await readSessionUser());
  if (!sessionUser || sessionUser.role !== "admin") redirect("/admin/login");
  return <AdminShell description="Create, edit, and protect the supplier brands used in your product catalog." eyebrow="Catalog" title="Brands"><BrandManager brands={await listCatalogBrands(repository)} /></AdminShell>;
}
