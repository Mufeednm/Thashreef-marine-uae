import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { listCatalogBrands, listCatalogProducts } from "@/application/catalog/catalog-service";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { formatAedFromCents } from "@/shared/utils/currency";

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }): Promise<ReactElement> {
  const { slug } = await params;
  const repository = createDemoStoreRepository();
  const [brands, products] = await Promise.all([listCatalogBrands(repository), listCatalogProducts(repository)]);
  const brand = brands.find((item) => item.slug === slug);
  if (!brand) notFound();
  const brandProducts = products.filter((product) => product.brand === brand.name && product.isActive);
  return <main className="min-h-dvh bg-[#f4f8fa] px-4 py-8 text-[#0a2540] sm:px-6 lg:py-12"><div className="mx-auto max-w-[1480px]"><Link className="text-sm font-bold text-[#0e7490] hover:underline" href="/">← Back to storefront</Link><header className="mt-6 rounded-[2rem] bg-[#071827] p-8 text-white sm:p-10"><p className="text-xs font-black tracking-[.22em] text-cyan-200 uppercase">Supplier catalogue</p><div className="mt-4 flex items-center gap-4"><span className="grid size-16 place-items-center rounded-2xl bg-[#f97316] text-lg font-black">{brand.logoText}</span><div><h1 className="text-3xl font-black sm:text-4xl">{brand.name}</h1><p className="mt-2 text-slate-300">Browse every available {brand.name} product in our marine catalogue.</p></div></div></header><section className="mt-8"><div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-black">{brand.name} products</h2><p className="mt-1 text-sm text-slate-600">{brandProducts.length} products available</p></div></div>{brandProducts.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{brandProducts.map((product) => <Link className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0e568f]" href={`/products/${product.slug}`} key={product.id}><div className="relative aspect-square bg-slate-50"><Image alt={product.name} className="object-contain p-7" fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" src={product.imageUrl} unoptimized={product.imageUrl.startsWith("/")} /></div><div className="p-5"><p className="text-xs font-bold text-[#0e568f]">{product.category}</p><h3 className="mt-2 font-black text-[#0a2540]">{product.name}</h3><p className="mt-3 text-lg font-black">{formatAedFromCents(product.priceAedCents)}</p></div></Link>)}</div> : <p className="mt-6 rounded-2xl bg-white p-6 text-slate-600">No products have been added for this brand yet.</p>}</section></div></main>;
}
