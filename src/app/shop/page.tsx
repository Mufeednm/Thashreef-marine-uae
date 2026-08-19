import type { ReactElement } from "react";
import {
  listCatalogBrands,
  listCatalogCategoryTree,
  listStorefrontProducts,
  listHomepageBanners,
} from "@/application/catalog/catalog-service";
import { StorefrontExperience } from "@/features/storefront/components/storefront-experience";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export const metadata = { title: "Shop marine parts" };

export default async function ShopPage(): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const [brands, categoryTree, products, banners] = await Promise.all([
    listCatalogBrands(repository),
    listCatalogCategoryTree(repository),
    listStorefrontProducts(repository),
    listHomepageBanners(repository),
  ]);

  return (
    <StorefrontExperience
      banners={banners}
      brands={brands}
      categoryTree={categoryTree}
      products={products}
    />
  );
}
