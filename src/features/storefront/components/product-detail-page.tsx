"use client";

import Link from "next/link";
import { useEffect, useState, type ReactElement } from "react";
import type { Product } from "@/domain/catalog/product";
import { useLocale } from "@/features/i18n/locale-provider";
import { Footer } from "@/features/storefront/components/storefront-experience";
import { ProductImage } from "@/features/storefront/components/product-image";
import { formatAedFromCents } from "@/shared/utils/currency";

type CartLine = Product & { quantity: number };

export function ProductDetailPage({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}): ReactElement {
  const { locale } = useLocale();
  const [cartQuantity, setCartQuantity] = useState(0);
  const galleryImages = [
    product.imageUrl,
    product.secondaryImageUrl,
    product.tertiaryImageUrl,
  ].filter((image): image is string => Boolean(image));
  const [selectedImage, setSelectedImage] = useState(product.imageUrl);
  const hasSale = product.salePriceAedCents !== null && product.salePriceAedCents !== undefined;
  const name = localizedProductName(product, locale);
  const description = localizedProductDescription(product, locale);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedCart = JSON.parse(
          window.sessionStorage.getItem("thashreef-cart") ?? "[]",
        ) as CartLine[];
        setCartQuantity(storedCart.find((line) => line.id === product.id)?.quantity ?? 0);
      } catch {
        setCartQuantity(0);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [product.id]);

  function addToCart(): void {
    const storedCart = window.sessionStorage.getItem("thashreef-cart");
    let cart: CartLine[] = [];
    try {
      cart = storedCart ? (JSON.parse(storedCart) as CartLine[]) : [];
    } catch {
      cart = [];
    }
    const existing = cart.find((line) => line.id === product.id);
    const nextCart = existing
      ? cart.map((line) =>
          line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      : [...cart, { ...product, quantity: 1 }];
    window.sessionStorage.setItem("thashreef-cart", JSON.stringify(nextCart));
    setCartQuantity(existing ? existing.quantity + 1 : 1);
  }

  return (
    <main className="min-h-screen bg-[#eef5fa] text-[#0a2540]">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1280px] items-center px-4 sm:px-6">
          <Link
            className="text-sm font-black text-[#0a2540] transition hover:text-[#0e7490]"
            href="/"
          >
            MARSA EDGE MARINE LLC
          </Link>
          <Link
            className="ml-auto min-h-11 content-center text-sm font-bold text-slate-600 underline-offset-4 hover:text-[#0e7490] hover:underline"
            href="/shop"
          >
            Continue shopping
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <Link className="hover:text-[#0e7490] hover:underline" href="/">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link className="hover:text-[#0e7490] hover:underline" href="/shop">
            Shop
          </Link>
          <span className="px-2">/</span>
          <span>{product.category}</span>
        </nav>
        <article className="mt-6 grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[360px] bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100 p-7 sm:p-12">
            <span className="absolute left-6 top-6 rounded-full bg-[#0a2540] px-3 py-1.5 text-xs font-black text-white">
              {product.category}
            </span>
            <ProductImage
              alt={name}
              className="mx-auto h-full min-h-[310px] w-full object-contain"
              height={900}
              imageUrl={selectedImage}
              key={selectedImage}
              priority
              width={900}
            />
            {galleryImages.length > 1 ? (
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-2xl bg-white/90 p-2 shadow-sm">
                {galleryImages.map((image, index) => (
                  <button
                    aria-label={`Show product image ${index + 1}`}
                    aria-pressed={selectedImage === image}
                    className={`size-12 overflow-hidden rounded-xl border-2 ${selectedImage === image ? "border-[#0e568f]" : "border-transparent"}`}
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    type="button"
                  >
                    <ProductImage
                      alt=""
                      className="h-full w-full object-cover"
                      height={48}
                      imageUrl={image}
                      width={48}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="p-6 sm:p-10">
            <p className="text-xs font-black tracking-[0.18em] text-[#0e7490] uppercase">
              {product.brand}
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#0a2540] sm:text-4xl">
              {name}
            </h1>
            <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
              <p className="text-3xl font-black text-[#0e7490]">
                {formatAedFromCents(product.priceAedCents)}
              </p>
              {hasSale ? (
                <p className="pb-1 text-base text-slate-400 line-through">
                  {formatAedFromCents(product.regularPriceAedCents)}
                </p>
              ) : null}
            </div>
            <p className="mt-6 text-base leading-7 text-slate-600">{description}</p>
            <button
              className="mt-5 min-h-12 w-full rounded-full bg-[#f97316] px-6 text-sm font-black text-white transition hover:bg-[#c2410c]"
              onClick={addToCart}
              type="button"
            >
              {cartQuantity > 0
                ? `In cart (${cartQuantity}) · Add another`
                : "Add to cart"}
            </button>
            {cartQuantity > 0 ? (
              <div
                aria-live="polite"
                className="mt-3 flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-[#0e568f]"
              >
                <span>{cartQuantity} item{cartQuantity === 1 ? "" : "s"} in your cart.</span>
                <Link className="underline underline-offset-4" href="/checkout">
                  Go to checkout
                </Link>
              </div>
            ) : null}
            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-slate-100 pt-6 text-center text-xs font-bold text-slate-600">
              <span>UAE delivery</span>
              <span>Secure checkout</span>
              <span>Technical support</span>
            </div>
          </div>
        </article>
        {relatedProducts.length > 0 ? (
          <section className="mt-12" aria-labelledby="related-products-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-[#0e7490] uppercase">
                More in this category
              </p>
              <h2
                className="mt-2 text-2xl font-black tracking-tight text-[#0a2540]"
                id="related-products-heading"
              >
                Related {product.category} products
              </h2>
            </div>
            <Link className="text-sm font-bold text-[#0e568f] hover:underline" href="/shop">
              Browse all products
            </Link>
          </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <RelatedProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <Footer />
    </main>
  );
}

function RelatedProductCard({ product }: { product: Product }): ReactElement {
  const { locale } = useLocale();
  const name = localizedProductName(product, locale);
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link aria-label={`View ${name}`} className="block" href={`/products/${product.slug}`}>
        <div className="aspect-square bg-gradient-to-br from-sky-50 to-slate-100 p-5">
          <ProductImage
            alt={name}
            className="h-full w-full object-contain"
            height={420}
            imageUrl={product.imageUrl}
            width={420}
          />
        </div>
        <div className="p-4">
          <p className="text-xs font-black tracking-[0.14em] text-slate-400 uppercase">
            {product.brand}
          </p>
          <h3 className="mt-2 text-sm font-black leading-5 text-[#0a2540]">{name}</h3>
          <p className="mt-3 text-base font-black text-[#0e7490]">
            {formatAedFromCents(product.priceAedCents)}
          </p>
        </div>
      </Link>
    </article>
  );
}

function localizedProductName(product: Product, locale: "ar" | "en"): string {
  return locale === "ar" && product.nameAr ? product.nameAr : product.name;
}
function localizedProductDescription(product: Product, locale: "ar" | "en"): string {
  return locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
}
