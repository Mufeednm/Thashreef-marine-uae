"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactElement } from "react";
import type { Product } from "@/domain/catalog/product";
import { formatAedFromCents } from "@/shared/utils/currency";

type CartLine = Product & { quantity: number };

export function ProductDetailPage({ product, relatedProducts }: { product: Product; relatedProducts: Product[] }): ReactElement {
  const [added, setAdded] = useState(false);
  const hasSale = product.salePriceAedCents !== null && product.salePriceAedCents !== undefined;

  function addToCart(): void {
    const storedCart = window.sessionStorage.getItem("thashreef-cart");
    let cart: CartLine[] = [];
    try { cart = storedCart ? (JSON.parse(storedCart) as CartLine[]) : []; } catch { cart = []; }
    const existing = cart.find((line) => line.id === product.id);
    const nextCart = existing
      ? cart.map((line) => line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line)
      : [...cart, { ...product, quantity: 1 }];
    window.sessionStorage.setItem("thashreef-cart", JSON.stringify(nextCart));
    setAdded(true);
  }

  return (
    <main className="min-h-screen bg-[#eef5fa] text-[#0a2540]">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1280px] items-center px-4 sm:px-6">
          <Link className="text-sm font-black text-[#0a2540] transition hover:text-[#0e7490]" href="/">THASHREEF MARINE UAE</Link>
          <Link className="ml-auto min-h-11 content-center text-sm font-bold text-slate-600 underline-offset-4 hover:text-[#0e7490] hover:underline" href="/shop">Continue shopping</Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500"><Link className="hover:text-[#0e7490] hover:underline" href="/">Home</Link><span className="px-2">/</span><Link className="hover:text-[#0e7490] hover:underline" href="/shop">Shop</Link><span className="px-2">/</span><span>{product.category}</span></nav>
        <article className="mt-6 grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[360px] bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100 p-7 sm:p-12">
            <span className="absolute left-6 top-6 rounded-full bg-[#0a2540] px-3 py-1.5 text-xs font-black text-white">{product.category}</span>
            {product.isFeatured ? <span className="absolute right-6 top-6 rounded-full bg-[#f97316] px-3 py-1.5 text-xs font-black text-white">Featured</span> : null}
            <Image alt={product.name} className="mx-auto h-full min-h-[310px] w-full object-contain" height={900} priority src={product.imageUrl} unoptimized={product.imageUrl.startsWith("/")} width={900} />
          </div>
          <div className="p-6 sm:p-10">
            <p className="text-xs font-black tracking-[0.18em] text-[#0e7490] uppercase">{product.brand}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#0a2540] sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-sm font-semibold text-slate-500">SKU: {product.sku}</p>
            <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1"><p className="text-3xl font-black text-[#0e7490]">{formatAedFromCents(product.priceAedCents)}</p>{hasSale ? <p className="pb-1 text-base text-slate-400 line-through">{formatAedFromCents(product.regularPriceAedCents)}</p> : null}</div>
            <p className="mt-6 text-base leading-7 text-slate-600">{product.description}</p>
            <button className="mt-5 min-h-12 w-full rounded-full bg-[#f97316] px-6 text-sm font-black text-white transition hover:bg-[#c2410c]" onClick={addToCart} type="button">{added ? "Added to cart" : "Add to cart"}</button>
            {added ? <div aria-live="polite" className="mt-3 flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-[#0e568f]"><span>Added to your cart.</span><Link className="underline underline-offset-4" href="/checkout">Go to checkout</Link></div> : null}
            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-slate-100 pt-6 text-center text-xs font-bold text-slate-600"><span>UAE delivery</span><span>Secure checkout</span><span>Technical support</span></div>
          </div>
        </article>
        <section className="mt-12" aria-labelledby="related-products-heading">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black tracking-[0.2em] text-[#0e7490] uppercase">More in this category</p><h2 className="mt-2 text-2xl font-black tracking-tight text-[#0a2540]" id="related-products-heading">Related {product.category} products</h2></div><Link className="text-sm font-bold text-[#0e568f] hover:underline" href="/shop">Browse all products</Link></div>
          {relatedProducts.length > 0 ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{relatedProducts.map((related) => <RelatedProductCard key={related.id} product={related} />)}</div> : <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">More products in this category will appear here as the catalog grows.</p>}
        </section>
      </div>
    </main>
  );
}

function RelatedProductCard({ product }: { product: Product }): ReactElement {
  return <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><Link aria-label={`View ${product.name}`} className="block" href={`/products/${product.slug}`}><div className="aspect-square bg-gradient-to-br from-sky-50 to-slate-100 p-5"><Image alt={product.name} className="h-full w-full object-contain" height={420} src={product.imageUrl} unoptimized={product.imageUrl.startsWith("/")} width={420} /></div><div className="p-4"><p className="text-xs font-black tracking-[0.14em] text-slate-400 uppercase">{product.brand}</p><h3 className="mt-2 text-sm font-black leading-5 text-[#0a2540]">{product.name}</h3><p className="mt-3 text-base font-black text-[#0e7490]">{formatAedFromCents(product.priceAedCents)}</p></div></Link></article>;
}
