import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";
import { listCatalogAssignableCategories, listCatalogBrands, listCatalogProducts } from "@/application/catalog/catalog-service";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { AddProductForm } from "@/features/catalog/components/add-product-form";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }): Promise<ReactElement> {
  const repository = createDemoStoreRepository();
  const sessionUser = await restoreSessionUser(repository, await readSessionUser());
  if (!sessionUser || sessionUser.role !== "admin") redirect("/admin");
  const { id } = await params;
  const [products, categories, brands] = await Promise.all([listCatalogProducts(repository), listCatalogAssignableCategories(repository), listCatalogBrands(repository)]);
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  return <AdminShell actions={<Link className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50" href="/admin/products">Back to products</Link>} description="Update catalog details and storefront placement from one focused editor." eyebrow="Catalog" title={`Edit ${product.name}`}><AddProductForm brands={brands} categories={categories} product={product} /></AdminShell>;
}
