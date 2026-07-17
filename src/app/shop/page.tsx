import type { ReactElement } from "react";
import {
  listCatalogBrands,
  listCatalogCategoryTree,
  listCatalogProducts,
} from "@/application/catalog/catalog-service";
import { StorefrontExperience } from "@/features/storefront/components/storefront-experience";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export const metadata = { title: "Shop marine parts" };

export default async function ShopPage(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const [brands, categoryTree, products] = await Promise.all([
    listCatalogBrands(repository),
    listCatalogCategoryTree(repository),
    listCatalogProducts(repository),
  ]);

  return <StorefrontExperience brands={brands} categoryTree={categoryTree} products={products} />;
}
