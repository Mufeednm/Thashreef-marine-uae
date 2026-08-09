import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { listCatalogProducts } from "@/application/catalog/catalog-service";
import { ProductDetailPage } from "@/features/storefront/components/product-detail-page";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = (await listCatalogProducts(createDemoStoreRepository())).find(
    (candidate) => candidate.slug === slug,
  );
  return product
    ? { title: product.name, description: product.description }
    : { title: "Product not found" };
}

export default async function ProductPage({ params }: ProductPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const products = await listCatalogProducts(createDemoStoreRepository());
  const product = products.find((candidate) => candidate.slug === slug);
  if (!product) notFound();

  const relatedProducts = products
    .filter((candidate) => candidate.categoryId === product.categoryId && candidate.id !== product.id)
    .slice(0, 4);

  return <ProductDetailPage product={product} relatedProducts={relatedProducts} />;
}
