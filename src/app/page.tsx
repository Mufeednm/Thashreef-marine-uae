import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import {
  listCatalogBrands,
  listCatalogCategoryTree,
  listCatalogProducts,
  listHomepageBanners,
} from "@/application/catalog/catalog-service";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { StorefrontExperience } from "@/features/storefront/components/storefront-experience";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function Home(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const sessionUser = await restoreSessionUser(repository, await readSessionUser());
  const [brands, categoryTree, products, banners] = await Promise.all([
    listCatalogBrands(repository),
    listCatalogCategoryTree(repository),
    listCatalogProducts(repository),
    listHomepageBanners(repository),
  ]);

  if (sessionUser?.role === "admin" || sessionUser?.role === "staff") {
    redirect("/admin");
  }

  return (
    <StorefrontExperience
      accountName={sessionUser?.role === "customer" ? sessionUser.name : undefined}
      brands={brands}
      categoryTree={categoryTree}
      products={products}
      banners={banners}
    />
  );
}
