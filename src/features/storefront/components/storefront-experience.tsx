"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import type { CategoryTreeNode } from "@/domain/catalog/category";
import type { Product } from "@/domain/catalog/product";
import type { Brand, HomepageBanner } from "@/domain/demo-store/demo-store-repository";
import { logoutAction } from "@/features/auth/auth.actions";
import { LoginForm } from "@/features/auth/components/login-form";
import { LanguageToggle } from "@/features/i18n/language-toggle";
import { useLocale } from "@/features/i18n/locale-provider";
import { CategoryNavigation } from "@/features/storefront/components/category-navigation";
import { ProductImage } from "@/features/storefront/components/product-image";
import { formatAedFromCents } from "@/shared/utils/currency";

interface StorefrontExperienceProps {
  accountName?: string;
  banners: HomepageBanner[];
  brands: Brand[];
  categoryTree: CategoryTreeNode[];
  products: Product[];
}

type CartLine = Product & { quantity: number };
type ProductSort = "featured" | "newest" | "price-high" | "price-low";

interface HeroSlide {
  accent: string;
  cta: string;
  description: string;
  eyebrow: string;
  imageAlt: string;
  imageUrl: string;
  matcher: string;
  title: string;
}

interface BrandTile {
  label: string;
  tone: string;
}

const heroBannerImages = [
  "/hero-items/dubai-marina-hero-v2.png",
  "/hero-items/dubai-safety-hero-v2.png",
  "/hero-items/dubai-maintenance-hero-v2.png",
] as const;

const heroSlides: HeroSlide[] = [
  {
    accent: "Safety kits, PFDs and rescue-ready essentials",
    cta: "Shop Safety Gear",
    description:
      "Life jackets, lifebuoys, visibility gear and emergency accessories for crews, workshops and family boating.",
    eyebrow: "Marine safety equipment",
    imageAlt: "White leisure boat with marine rope and safety equipment at Dubai marina",
    imageUrl: "/hero-items/dubai-marina-hero-v2.png",
    matcher: "life",
    title: "Accessory-first marine supply for safer days on water.",
  },
  {
    accent: "Anchors, chain, shackles and dock lines",
    cta: "Explore Anchoring",
    description:
      "Mooring gear, fenders, ropes and deck protection products selected for practical UAE marine use.",
    eyebrow: "Anchoring and mooring",
    imageAlt: "Marine rope and mooring hardware on a dock",
    imageUrl:
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=2200&q=86",
    matcher: "anchor",
    title: "Hold firm with dependable deck and mooring hardware.",
  },
  {
    accent: "Navigation lights, batteries and electrical fittings",
    cta: "Browse Electrical",
    description:
      "Power accessories, lights, connectors and batteries for service teams that need parts quickly.",
    eyebrow: "Navigation and electrical",
    imageAlt: "Marine navigation console and electrical equipment",
    imageUrl:
      "https://images.unsplash.com/photo-1520942702018-0862200e6873?auto=format&fit=crop&w=2200&q=86",
    matcher: "navigation",
    title: "Keep every system visible, powered and ready.",
  },
  {
    accent: "Pumps, plumbing accessories and maintenance tools",
    cta: "Shop Pumps",
    description:
      "Bilge pumps, hoses, connectors, service tools and plumbing items for everyday marine maintenance.",
    eyebrow: "Pumps and plumbing",
    imageAlt: "Marine maintenance tools and hardware on a workbench",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2200&q=86",
    matcher: "pump",
    title: "Practical parts for repairs, refits and routine service.",
  },
  {
    accent: "Cleaners, brushes and deck-care supplies",
    cta: "View Cleaning",
    description:
      "Cleaning liquids, brushes and detailing essentials for polished decks, hulls and accessories.",
    eyebrow: "Cleaning and maintenance",
    imageAlt: "Cleaning brush and maintenance products near water",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=86",
    matcher: "clean",
    title: "Keep equipment, decks and fittings sea-ready.",
  },
];

const brandTiles: BrandTile[] = [
  { label: "Lalizas", tone: "from-orange-500 to-amber-500" },
  { label: "Polyform", tone: "from-sky-600 to-cyan-500" },
  { label: "AAA Marine", tone: "from-emerald-600 to-teal-500" },
  { label: "Optima", tone: "from-blue-700 to-indigo-500" },
  { label: "Rule", tone: "from-slate-800 to-slate-600" },
  { label: "Jabsco", tone: "from-cyan-700 to-blue-500" },
];

export function StorefrontExperience({
  accountName,
  banners,
  brands,
  categoryTree,
  products,
}: StorefrontExperienceProps): ReactElement {
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [productSort, setProductSort] = useState<ProductSort>("featured");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [activeSlide, setActiveSlide] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addedProductName, setAddedProductName] = useState<string | null>(null);
  const slides = useMemo<HeroSlide[]>(
    () =>
      banners.length > 0
        ? banners.slice(0, heroBannerImages.length).map((banner, index) => ({
            accent: "UAE marine supply, delivered with confidence",
            cta: banner.buttonText,
            description: banner.subtitle,
            eyebrow: "Marsa Edge Marine LLC",
            imageAlt: banner.title,
            imageUrl: heroBannerImages[index],
            matcher: "all",
            title: banner.title,
          }))
        : heroSlides,
    [banners],
  );

  const flatCategories = useMemo(() => flattenCategoryTree(categoryTree), [categoryTree]);
  const assignedCategoryIds = useMemo(
    () => new Set(products.map((product) => product.categoryId)),
    [products],
  );
  const categoryLookup = useMemo(
    () => new Map(flatCategories.map((category) => [category.id, category])),
    [flatCategories],
  );
  const selectedCategoryName =
    selectedCategoryId === "all"
      ? "All products"
      : (categoryLookup.get(selectedCategoryId)?.name ?? "Selected category");
  const selectedCategoryIds = useMemo(() => {
    if (selectedCategoryId === "all") {
      return null;
    }

    return new Set(getDescendantCategoryIds(categoryLookup.get(selectedCategoryId)));
  }, [categoryLookup, selectedCategoryId]);
  const hasProductsInCategory = (categoryId: number): boolean =>
    getDescendantCategoryIds(categoryLookup.get(categoryId)).some((id) =>
      assignedCategoryIds.has(id),
    );
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchingProducts = products.filter(
      (product) =>
        (!selectedCategoryIds || selectedCategoryIds.has(product.categoryId)) &&
        (!normalizedQuery ||
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.brand.toLowerCase().includes(normalizedQuery) ||
          product.category.toLowerCase().includes(normalizedQuery) ||
          product.mainCategory?.toLowerCase().includes(normalizedQuery)),
    );

    return [...matchingProducts].sort((left, right) => {
      if (productSort === "newest") return right.createdAt.localeCompare(left.createdAt);
      if (productSort === "price-low") return left.priceAedCents - right.priceAedCents;
      if (productSort === "price-high") return right.priceAedCents - left.priceAedCents;
      return left.homepageOrder - right.homepageOrder;
    });
  }, [productSort, products, query, selectedCategoryIds]);
  const bestSellers = useMemo(
    () =>
      products.some((product) => product.isTopSelling)
        ? products
            .filter((product) => product.isTopSelling)
            .sort((a, b) => a.homepageOrder - b.homepageOrder)
            .slice(0, 10)
        : [...products]
            .sort((left, right) => left.homepageOrder - right.homepageOrder)
            .slice(0, 10),
    [products],
  );
  const newArrivals = useMemo(
    () =>
      (products.some((product) => product.isNewArrival)
        ? products.filter((product) => product.isNewArrival)
        : [...products]
      )
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 10),
    [products],
  );
  const recentlyAdded = newArrivals.slice(0, 8);
  const cartQuantity = cart.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cart.reduce((total, line) => total + line.priceAedCents * line.quantity, 0);
  const cartQuantityByProductId = useMemo(
    () => new Map(cart.map((line) => [line.id, line.quantity])),
    [cart],
  );
  const slide = slides[activeSlide % slides.length] ?? heroSlides[0];

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6200);

    return () => window.clearInterval(interval);
  }, [shouldReduceMotion, slides.length]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedCart = JSON.parse(
          window.sessionStorage.getItem("thashreef-cart") ?? "[]",
        ) as CartLine[];
        setCart(Array.isArray(savedCart) ? savedCart : []);
      } catch {
        setCart([]);
      } finally {
        setCartHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    window.sessionStorage.setItem("thashreef-cart", JSON.stringify(cart));
  }, [cart, cartHydrated]);

  useEffect(() => {
    if (!addedProductName) return;
    const timer = window.setTimeout(() => setAddedProductName(null), 3500);
    return () => window.clearTimeout(timer);
  }, [addedProductName]);

  function addToCart(product: Product): void {
    setCart((lines) => {
      const existing = lines.find((line) => line.id === product.id);
      if (existing) {
        return lines.map((line) =>
          line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...lines, { ...product, quantity: 1 }];
    });
    setAddedProductName(product.name);
  }

  function selectDepartment(matcher: string): void {
    const matching =
      matcher === "all"
        ? "all"
        : (flatCategories.find((category) => category.slug.includes(matcher))?.id ?? "all");
    selectCategoryAndScroll(matching);
  }

  function selectCategoryAndScroll(categoryId: number | "all"): void {
    setQuery("");
    setSelectedCategoryId(categoryId);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function searchProducts(value: string): void {
    setQuery(value);
    if (value.trim()) {
      setSelectedCategoryId("all");
      window.requestAnimationFrame(() =>
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  }

  function updateQuantity(productId: string, change: number): void {
    setCart((lines) =>
      lines
        .map((line) =>
          line.id === productId ? { ...line, quantity: Math.max(0, line.quantity + change) } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  return (
    <div className="min-h-screen bg-[#eef5fa] text-[#0a2540]">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-black focus:shadow"
        href="#catalog"
      >
        Skip to products
      </a>
      <Header
        accountName={accountName}
        cartQuantity={cartQuantity}
        categoryTree={categoryTree}
        openCart={() => setCartOpen(true)}
        openLogin={() => setLoginOpen(true)}
        openMobileMenu={() => setMobileMenuOpen(true)}
        query={query}
        selectedCategoryId={selectedCategoryId}
        selectCategory={selectCategoryAndScroll}
        setQuery={searchProducts}
      />

      <main>
        <section className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6">
          <HeroShowcase
            addToCart={addToCart}
            activeSlide={activeSlide}
            products={recentlyAdded.length > 0 ? recentlyAdded : products}
            selectDepartment={selectDepartment}
            setActiveSlide={setActiveSlide}
            slide={slide}
            slideCount={slides.length}
          />
        </section>

        <BrandLogoCarousel brands={brands} />

        <CategoryCarousel
          categories={categoryTree.filter((category) => category.showOnHomepage)}
          selectCategory={selectCategoryAndScroll}
        />

        <ProductCarousel
          addToCart={addToCart}
          cartQuantityByProductId={cartQuantityByProductId}
          eyebrow="Fast movers"
          products={bestSellers}
          subtitle="Commonly needed items for retail counters, crews and service workshops."
          title="Best Sellers"
        />
        <ProductCarousel
          addToCart={addToCart}
          cartQuantityByProductId={cartQuantityByProductId}
          eyebrow="Fresh arrivals"
          products={newArrivals}
          subtitle="Recently added products from the Marsa Edge Marine LLC catalogue."
          title="New Arrivals"
        />

        <section className="border-y border-slate-200 bg-white py-12" id="catalog">
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-black tracking-[0.24em] text-[#f97316] uppercase">
                  Store Catalog
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0a2540] sm:text-4xl">
                  Browse all marine accessories
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {filteredProducts.length} products available for{" "}
                  {selectedCategoryName.toLowerCase()}. Search by brand, category or product name.
                </p>
              </div>
              <div className="flex max-w-4xl flex-wrap items-center gap-2">
                <button
                  className={`min-h-11 rounded-full px-4 text-xs font-black transition ${
                    selectedCategoryId === "all"
                      ? "bg-[#0a2540] text-white shadow-lg shadow-slate-900/10"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-[#0e7490] hover:text-[#0e7490]"
                  }`}
                  onClick={() => selectCategoryAndScroll("all")}
                  type="button"
                >
                  All products
                </button>
                {flatCategories
                  .filter((category) => category.depth > 0 && hasProductsInCategory(category.id))
                  .slice(0, 12)
                  .map((category) => (
                    <button
                      className={`min-h-11 rounded-full px-4 text-xs font-black transition ${
                        selectedCategoryId === category.id
                          ? "bg-[#0a2540] text-white shadow-lg shadow-slate-900/10"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-[#0e7490] hover:text-[#0e7490]"
                      }`}
                      key={category.id}
                      onClick={() => selectCategoryAndScroll(category.id)}
                      type="button"
                    >
                      {category.name}
                    </button>
                  ))}
                <label className="ml-auto flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600">
                  <span className="sr-only">Sort products</span>
                  Sort
                  <select
                    aria-label="Sort products"
                    className="bg-transparent font-black text-[#0a2540] outline-none"
                    onChange={(event) => setProductSort(event.target.value as ProductSort)}
                    value={productSort}
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: low to high</option>
                    <option value="price-high">Price: high to low</option>
                  </select>
                </label>
              </div>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {filteredProducts.slice(0, 15).map((product, index) => (
                  <ProductCard
                    addToCart={addToCart}
                    cartQuantity={cartQuantityByProductId.get(product.id) ?? 0}
                    index={index}
                    isJustAdded={addedProductName === product.name}
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-bold text-[#0a2540]">No products match this selection yet.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Choose All products or select another category to continue browsing.
                </p>
                <button
                  className="mt-5 min-h-11 rounded-full bg-[#0a2540] px-5 text-sm font-bold text-white"
                  onClick={() => selectCategoryAndScroll("all")}
                  type="button"
                >
                  Show all products
                </button>
              </div>
            )}
          </div>
        </section>

        <WhyChooseUs />
      </main>

      <Footer />

      <p aria-live="polite" className="sr-only">
        {addedProductName ? `${addedProductName} added to your cart.` : ""}
      </p>

      <a
        aria-label="Contact Marsa Edge Marine LLC on WhatsApp"
        className="fixed bottom-5 left-5 z-20 grid size-14 place-items-center rounded-full border-2 border-white bg-[#25d366] text-white shadow-xl shadow-emerald-950/25 transition hover:-translate-y-0.5 hover:bg-[#1ebe57] focus:outline-none focus:ring-4 focus:ring-[#25d366]/35 sm:bottom-6 sm:left-6"
        href="https://wa.me/971527035250"
        rel="noreferrer"
        target="_blank"
      >
        <WhatsAppIcon />
      </a>
      <AnimatePresence>
        {mobileMenuOpen ? (
          <MobileMenu
            accountName={accountName}
            categoryTree={categoryTree}
            close={() => setMobileMenuOpen(false)}
            openLogin={() => setLoginOpen(true)}
            selectedCategoryId={selectedCategoryId}
            selectCategory={selectCategoryAndScroll}
          />
        ) : null}
        {cartOpen ? (
          <CartDrawer
            cart={cart}
            close={() => setCartOpen(false)}
            total={cartTotal}
            updateQuantity={updateQuantity}
          />
        ) : null}
        {loginOpen ? <LoginModal close={() => setLoginOpen(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}

function flattenCategoryTree(categoryTree: CategoryTreeNode[]): CategoryTreeNode[] {
  return categoryTree.flatMap((category) => [category, ...flattenCategoryTree(category.children)]);
}

function getDescendantCategoryIds(category?: CategoryTreeNode): number[] {
  if (!category) {
    return [];
  }

  return [
    category.id,
    ...category.children.flatMap((childCategory) => getDescendantCategoryIds(childCategory)),
  ];
}

function Header({
  accountName,
  cartQuantity,
  categoryTree,
  openCart,
  openLogin,
  openMobileMenu,
  query,
  selectedCategoryId,
  selectCategory,
  setQuery,
}: {
  accountName?: string;
  cartQuantity: number;
  categoryTree: CategoryTreeNode[];
  openCart: () => void;
  openLogin: () => void;
  openMobileMenu: () => void;
  query: string;
  selectedCategoryId: number | "all";
  selectCategory: (categoryId: number | "all") => void;
  setQuery: (value: string) => void;
}): ReactElement {
  const { t } = useLocale();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1480px] items-center gap-3 px-4 py-3 sm:px-6">
        <button
          aria-label="Open product categories"
          className="grid size-11 place-items-center rounded-full border border-slate-200 text-[#0a2540] transition hover:bg-slate-50 xl:hidden"
          onClick={openMobileMenu}
          type="button"
        >
          <MenuIcon />
        </button>
        <Link
          aria-label="Marsa Edge Marine LLC home"
          className="relative flex h-11 w-20 shrink-0 items-center overflow-hidden rounded-xl bg-white sm:h-12 sm:w-28"
          href="/"
        >
          <Image
            alt="Marsa Edge Marine LLC"
            className="absolute -top-8 left-1/2 h-auto w-[184px] max-w-none -translate-x-1/2"
            height={1728}
            priority
            src="/brand/marsa-edge-logo-source.png"
            unoptimized
            width={1728}
          />
        </Link>
        <label className="relative hidden min-h-12 min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 transition focus-within:border-[#0e7490] focus-within:bg-white focus-within:shadow-sm sm:flex">
          <SearchIcon />
          <span className="sr-only">{t("header.search")}</span>
          <input
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("header.search")}
            value={query}
          />
        </label>
        {accountName ? (
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              href="/account"
            >
              My account
            </Link>
            <form action={logoutAction}>
              <button
                className="min-h-11 rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                type="submit"
              >
                {t("header.logout")}
              </button>
            </form>
          </div>
        ) : (
          <button
            className="hidden min-h-11 rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:block"
            onClick={openLogin}
            type="button"
          >
            {t("header.signIn")}
          </button>
        )}
        <LanguageToggle />
        <button
          aria-label={t("header.openCart", { count: cartQuantity })}
          className="relative grid size-12 place-items-center rounded-full bg-[#0a2540] text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#0e7490]"
          onClick={openCart}
          type="button"
        >
          <CartIcon />
          {cartQuantity > 0 ? (
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#f97316] text-[10px] font-black">
              {cartQuantity}
            </span>
          ) : null}
        </button>
      </div>
      <label className="relative mx-4 mb-3 flex min-h-11 items-center rounded-full border border-slate-200 bg-slate-50 px-4 transition focus-within:border-[#0e7490] focus-within:bg-white focus-within:shadow-sm sm:hidden">
        <SearchIcon />
        <span className="sr-only">{t("header.search")}</span>
        <input
          className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("header.search")}
          value={query}
        />
      </label>
      <div className="hidden xl:block">
        <CategoryNavigation
          categories={categoryTree}
          selectedCategoryId={selectedCategoryId}
          selectCategory={selectCategory}
        />
      </div>
    </header>
  );
}

function HeroShowcase({
  addToCart,
  activeSlide,
  products,
  selectDepartment,
  setActiveSlide,
  slide,
  slideCount,
}: {
  addToCart: (product: Product) => void;
  activeSlide: number;
  products: Product[];
  selectDepartment: (matcher: string) => void;
  setActiveSlide: (index: number) => void;
  slide: HeroSlide;
  slideCount: number;
}): ReactElement {
  return (
    <section className="relative min-h-[540px] overflow-hidden rounded-[2rem] bg-[#071827] text-white shadow-2xl shadow-slate-950/18">
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0"
          exit={{ opacity: 0, scale: 1.02 }}
          initial={{ opacity: 0, scale: 1.02 }}
          key={slide.title}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Image
            alt={slide.imageAlt}
            className="object-cover object-[68%_center]"
            fill
            priority
            sizes="(min-width: 1280px) 1120px, 100vw"
            src={slide.imageUrl}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,18,31,.96)_0%,rgba(3,18,31,.84)_40%,rgba(3,18,31,.38)_64%,rgba(3,18,31,.04)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_100%,rgba(235,105,42,.14),transparent_27%),linear-gradient(180deg,rgba(1,12,23,.05),rgba(1,12,23,.35))]" />

      <div className="relative flex min-h-[540px] flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex max-w-2xl flex-1 flex-col justify-center py-7 sm:py-10 lg:py-12">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black tracking-[0.3em] text-cyan-100 uppercase"
            initial={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.35 }}
          >
            {slide.eyebrow}
          </motion.p>
          <motion.h1
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.65rem]"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.42, delay: 0.08 }}
          >
            {slide.title}
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 max-w-lg text-base leading-7 text-slate-100 sm:text-lg"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.42, delay: 0.14 }}
          >
            {slide.description}
          </motion.p>
          <div className="mt-5 inline-flex w-fit items-center gap-2 text-xs font-bold text-cyan-50">
            <span className="size-2 rounded-full bg-[#f97316]" aria-hidden="true" />
            {slide.accent}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              className="min-h-12 rounded-full bg-[#f97316] px-6 text-sm font-black text-white shadow-xl shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-[#c2410c]"
              onClick={() => selectDepartment(slide.matcher)}
              type="button"
            >
              {slide.cta}
            </button>
          </div>
        </div>

        <div className="mt-auto w-full max-w-md self-end lg:absolute lg:bottom-10 lg:right-10">
          <div className="rounded-2xl border border-white/15 bg-[#071827]/90 p-4 shadow-2xl shadow-slate-950/35 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">New in store</p>
                <p className="mt-1 text-xs text-slate-300">
                  Latest additions to the marine catalogue.
                </p>
              </div>
              <span className="rounded-full bg-[#f97316] px-3 py-1 text-[10px] font-black">
                JUST ADDED
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {products.slice(0, 2).map((product) => (
                <article
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.07]"
                  key={product.id}
                >
                  <Link
                    aria-label={`View ${product.name}`}
                    className="block"
                    href={`/products/${product.slug}`}
                  >
                    <div className="relative aspect-[16/10] bg-white">
                      <ProductImage
                        alt={product.name}
                        className="object-contain p-2"
                        height={180}
                        imageUrl={product.imageUrl}
                        sizes="180px"
                        width={180}
                      />
                    </div>
                    <div className="px-3 pt-2">
                      <p className="truncate text-xs font-bold text-white">{product.name}</p>
                      <p className="mt-1 text-xs font-black text-cyan-100">
                        {formatAedFromCents(product.priceAedCents)}
                      </p>
                    </div>
                  </Link>
                  <button
                    className="m-3 mt-2 min-h-11 w-[calc(100%-1.5rem)] rounded-lg border border-white/15 bg-white/10 px-2 text-xs font-bold text-white transition hover:bg-[#f97316]"
                    onClick={() => addToCart(product)}
                    type="button"
                  >
                    Add to cart
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/35 p-2 backdrop-blur lg:flex">
          {Array.from({ length: slideCount }, (_, index) => index).map((index) => (
            <button
              aria-label={`Show slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                activeSlide === index ? "w-9 bg-[#f97316]" : "w-2.5 bg-white/45 hover:bg-white/75"
              }`}
              key={index}
              onClick={() => setActiveSlide(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCarousel({
  categories,
  selectCategory,
}: {
  categories: CategoryTreeNode[];
  selectCategory: (categoryId: number) => void;
}): ReactElement {
  return (
    <section className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Shop by category"
        subtitle="Browse the categories you manage in the catalogue. Each category leads to products in its subcategories."
        title="Find the right products faster"
      />
      <div className="mt-7 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none]">
        {categories.map((category) => (
          <motion.button
            className="group relative h-64 w-[290px] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-slate-900 text-left shadow-lg shadow-slate-900/10"
            key={category.id}
            onClick={() => selectCategory(category.id)}
            type="button"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            {category.bannerImageUrl ? (
              <Image
                alt={category.name}
                className="object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="290px"
                src={category.bannerImageUrl}
                unoptimized={category.bannerImageUrl.startsWith("/")}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0e568f] to-[#071827]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-xl font-black">{category.name}</p>
              {category.nameAr ? (
                <p className="mt-1 text-sm text-slate-200" dir="rtl">
                  {category.nameAr}
                </p>
              ) : null}
              <span className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">
                View products
              </span>
            </div>
          </motion.button>
        ))}
      </div>
      {categories.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          Categories appear here only when Show in Shop by category is selected in the admin
          catalogue.
        </p>
      ) : null}
    </section>
  );
}

function ProductCarousel({
  addToCart,
  cartQuantityByProductId,
  eyebrow,
  products,
  subtitle,
  title,
}: {
  addToCart: (product: Product) => void;
  cartQuantityByProductId: Map<string, number>;
  eyebrow: string;
  products: Product[];
  subtitle: string;
  title: string;
}): ReactElement {
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-12 sm:px-6">
      <SectionHeader eyebrow={eyebrow} subtitle={subtitle} title={title} />
      {products.length > 0 ? (
        <div className="mt-7 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none]">
          {products.map((product, index) => (
            <motion.div
              className="w-[280px] shrink-0 snap-start"
              key={product.id}
              whileHover={{ y: -5 }}
            >
              <ProductCard
                addToCart={addToCart}
                cartQuantity={cartQuantityByProductId.get(product.id) ?? 0}
                index={index}
                product={product}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <SkeletonRail />
      )}
    </section>
  );
}

function SectionHeader({
  eyebrow,
  subtitle,
  tone = "light",
  title,
}: {
  eyebrow: string;
  subtitle: string;
  tone?: "dark" | "light";
  title: string;
}): ReactElement {
  const headingColor = tone === "dark" ? "text-white" : "text-[#0a2540]";
  const subtitleColor = tone === "dark" ? "text-slate-300" : "text-slate-600";
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-black tracking-[0.24em] text-[#f97316] uppercase">{eyebrow}</p>
        <h2 className={`mt-2 text-3xl font-black tracking-tight ${headingColor}`}>{title}</h2>
        <p className={`mt-2 max-w-2xl text-sm leading-6 ${subtitleColor}`}>{subtitle}</p>
      </div>
    </div>
  );
}

function SkeletonRail(): ReactElement {
  return (
    <div className="mt-7 flex gap-5 overflow-hidden">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          className="h-[388px] w-[280px] shrink-0 animate-pulse rounded-[1.75rem] bg-slate-200"
          key={index}
        />
      ))}
    </div>
  );
}

function ProductCard({
  addToCart,
  cartQuantity = 0,
  index,
  isJustAdded = false,
  product,
}: {
  addToCart: (product: Product) => void;
  cartQuantity?: number;
  index: number;
  isJustAdded?: boolean;
  product: Product;
}): ReactElement {
  const { locale } = useLocale();
  const name = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const description =
    locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
  const galleryCount = [
    product.imageUrl,
    product.secondaryImageUrl,
    product.tertiaryImageUrl,
  ].filter(Boolean).length;
  const tones = [
    "from-sky-100 to-blue-50",
    "from-orange-100 to-amber-50",
    "from-teal-100 to-emerald-50",
    "from-slate-100 to-slate-50",
  ];

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:shadow-slate-900/10">
      <Link
        aria-label={`View ${name}`}
        className={`relative block aspect-square w-full overflow-hidden bg-gradient-to-br ${tones[index % tones.length]} text-left`}
        href={`/products/${product.slug}`}
      >
        <ProductImage
          alt={name}
          className="h-full w-full object-contain p-7 transition duration-300 group-hover:scale-105"
          height={640}
          imageUrl={product.imageUrl}
          loading={index > 3 ? "lazy" : "eager"}
          width={640}
        />
        <div className="absolute left-4 top-4 rounded-full bg-[#0a2540] px-3 py-1 text-[10px] font-black text-white shadow-sm">
          {product.category}
        </div>
        {galleryCount > 1 ? (
          <div className="absolute bottom-4 right-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black text-[#0a2540] shadow-sm">
            {galleryCount} photos
          </div>
        ) : null}
      </Link>
      <div className="p-4">
        <p className="text-xs font-black tracking-[0.16em] text-slate-400 uppercase">
          {product.brand}
        </p>
        <p className="mt-2 min-h-10 text-sm font-black leading-5 text-[#0a2540]">{name}</p>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{description}</p>
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <span className="text-lg font-black text-[#0a2540]">
              {formatAedFromCents(product.priceAedCents)}
            </span>
            {product.salePriceAedCents ? (
              <p className="text-xs text-slate-400 line-through">
                {formatAedFromCents(product.regularPriceAedCents)}
              </p>
            ) : null}
          </div>
          {product.salePriceAedCents ? (
            <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-black text-orange-700">
              Sale
            </span>
          ) : null}
        </div>
        <button
          aria-live="polite"
          className={`mt-4 min-h-11 w-full rounded-full px-3 text-sm font-black text-white transition ${
            cartQuantity > 0 || isJustAdded ? "bg-emerald-700" : "bg-[#0a2540] hover:bg-[#0e7490]"
          }`}
          onClick={() => addToCart(product)}
          type="button"
        >
          {cartQuantity > 0
            ? `In cart (${cartQuantity}) · Add another`
            : isJustAdded
              ? "Added to cart"
              : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

function BrandLogoCarousel({ brands }: { brands: Brand[] }): ReactElement {
  const { locale } = useLocale();
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-12 sm:px-6">
      <SectionHeader
        eyebrow="Shop by brand"
        subtitle="Shop trusted marine brands and find the right equipment faster."
        title="Supplier and brand partners"
      />
      <div className="mt-7 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none]">
        {brands.slice(0, 12).map((brand, index) => (
          <Link
            aria-label={`Shop ${locale === "ar" && brand.nameAr ? brand.nameAr : brand.name} products`}
            className="flex h-36 w-56 shrink-0 snap-start flex-col items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0e568f]"
            href={`/brands/${brand.slug}`}
            key={brand.id}
          >
            {brand.imageUrl ? (
              <span className="relative grid h-20 w-40 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
                <Image
                  alt={`${brand.name} logo`}
                  className="object-contain p-2"
                  fill
                  sizes="160px"
                  src={brand.imageUrl}
                  unoptimized={brand.imageUrl.startsWith("/")}
                />
              </span>
            ) : (
              <span
                className={`grid h-20 w-40 place-items-center rounded-xl bg-gradient-to-br ${brandTiles[index % brandTiles.length].tone} text-base font-black text-white`}
              >
                {brand.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="mt-2 text-sm font-black text-[#0a2540]">
              {locale === "ar" && brand.nameAr ? brand.nameAr : brand.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function WhyChooseUs(): ReactElement {
  const items = [
    {
      icon: <TruckIcon />,
      text: "Local-first shopping experience for practical marine accessories and parts.",
      title: "UAE delivery support",
    },
    {
      icon: <ShieldIcon />,
      text: "Products are grouped by real use cases: safety, electrical, anchoring, deck and cleaning.",
      title: "Marine-grade categories",
    },
    {
      icon: <BriefcaseIcon />,
      text: "Quick quote and trade-friendly flows for workshops, yacht crews and retail buyers.",
      title: "Built for trade supply",
    },
    {
      icon: <LockIcon />,
      text: "Clear product cards and focused add-to-cart interactions.",
      title: "Confident checkout path",
    },
  ];

  return (
    <section className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Why choose us"
        subtitle="Premium polish is not just visuals — it should make shopping faster, clearer and more trustworthy."
        title="A better way to buy marine accessories"
      />
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article
            className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8"
            key={item.title}
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-[#eef8fb] text-[#0e7490]">
              {item.icon}
            </span>
            <h3 className="mt-5 text-lg font-black text-[#0a2540]">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CartDrawer({
  cart,
  close,
  total,
  updateQuantity,
}: {
  cart: CartLine[];
  close: () => void;
  total: number;
  updateQuantity: (id: string, change: number) => void;
}): ReactElement {
  return (
    <motion.div
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 p-0 backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
    >
      <motion.div
        animate={{ x: 0 }}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        exit={{ x: "100%" }}
        initial={{ x: "100%" }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-lg font-black text-[#0a2540]">Your cart</p>
            <p className="text-sm text-slate-500">Review your marine accessories</p>
          </div>
          <button
            aria-label="Close cart"
            className="grid size-11 place-items-center rounded-full hover:bg-slate-100"
            onClick={close}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
              <p>Your cart is empty. Add safety gear, hardware or marine accessories to begin.</p>
              <button
                className="mt-4 min-h-11 rounded-full bg-[#0a2540] px-4 text-sm font-black text-white transition hover:bg-[#0e7490]"
                onClick={close}
                type="button"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            cart.map((line) => (
              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4" key={line.id}>
                <ProductImage
                  alt={line.name}
                  className="size-16 shrink-0 rounded-xl bg-slate-50 object-contain p-1"
                  height={64}
                  imageUrl={line.imageUrl}
                  width={64}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#0a2540]">{line.name}</p>
                  <p className="mt-1 text-sm font-bold text-[#0e7490]">
                    {formatAedFromCents(line.priceAedCents)}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-slate-200">
                      <button
                        aria-label={`Decrease ${line.name} quantity`}
                        className="size-10 font-bold"
                        onClick={() => updateQuantity(line.id, -1)}
                        type="button"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{line.quantity}</span>
                      <button
                        aria-label={`Increase ${line.name} quantity`}
                        className="size-10 font-bold"
                        onClick={() => updateQuantity(line.id, 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-xs font-bold text-rose-700"
                      onClick={() => updateQuantity(line.id, -line.quantity)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-slate-200 p-5">
          <div className="flex justify-between text-sm font-bold">
            <span>Subtotal</span>
            <span>{formatAedFromCents(total)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Delivery fee and any free-delivery eligibility are confirmed at checkout.
          </p>
          {cart.length === 0 ? (
            <button
              className="mt-5 min-h-12 w-full rounded-full bg-slate-300 text-sm font-black text-white"
              disabled
              type="button"
            >
              Proceed to checkout
            </button>
          ) : (
            <Link
              className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-[#f97316] text-sm font-black text-white transition hover:bg-[#c2410c]"
              href="/checkout"
            >
              Proceed to checkout
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProductDetail({
  addToCart,
  close,
  product,
}: {
  addToCart: (product: Product) => void;
  close: () => void;
  product: Product;
}): ReactElement {
  return (
    <motion.div
      aria-modal="true"
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      role="dialog"
    >
      <motion.article
        animate={{ scale: 1, y: 0 }}
        className="max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
        exit={{ scale: 0.98, y: 12 }}
        initial={{ scale: 0.98, y: 12 }}
      >
        <div className="grid sm:grid-cols-2">
          <div className="min-h-72 bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100 p-7">
            <p className="text-xs font-black tracking-widest text-[#0e7490] uppercase">
              {product.category}
            </p>
            <ProductImage
              alt={product.name}
              className="mx-auto mt-8 h-64 w-full object-contain"
              height={640}
              imageUrl={product.imageUrl}
              width={640}
            />
          </div>
          <div className="p-7">
            <button
              aria-label="Close product detail"
              className="float-right grid size-10 place-items-center rounded-full hover:bg-slate-100"
              onClick={close}
              type="button"
            >
              <CloseIcon />
            </button>
            <h2 className="mt-3 pr-10 text-2xl font-black leading-8 text-[#0a2540]">
              {product.name}
            </h2>
            <p className="mt-4 text-xs font-black tracking-[0.18em] text-slate-500 uppercase">
              {product.brand}
            </p>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-2xl font-black text-[#0e7490]">
                {formatAedFromCents(product.priceAedCents)}
              </p>
              {product.salePriceAedCents ? (
                <p className="pb-1 text-sm text-slate-400 line-through">
                  {formatAedFromCents(product.regularPriceAedCents)}
                </p>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">{product.description}</p>
            <button
              className="mt-5 min-h-12 w-full rounded-full bg-[#f97316] text-sm font-black text-white transition hover:bg-[#c2410c]"
              onClick={() => {
                addToCart(product);
                close();
              }}
              type="button"
            >
              Add to cart
            </button>
            <div className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
              Secure checkout | UAE delivery options | Technical support before purchase
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function LoginModal({ close }: { close: () => void }): ReactElement {
  return (
    <motion.div
      aria-modal="true"
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      role="dialog"
    >
      <motion.div
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
        exit={{ y: 12, opacity: 0 }}
        initial={{ y: 12, opacity: 0 }}
      >
        <button
          aria-label="Close login"
          className="mb-3 ml-auto grid size-11 place-items-center rounded-full bg-white text-sm font-black text-slate-800"
          onClick={close}
          type="button"
        >
          <CloseIcon />
        </button>
        <LoginForm />
      </motion.div>
    </motion.div>
  );
}

function MobileMenu({
  accountName,
  categoryTree,
  close,
  openLogin,
  selectedCategoryId,
  selectCategory,
}: {
  accountName?: string;
  categoryTree: CategoryTreeNode[];
  close: () => void;
  openLogin: () => void;
  selectedCategoryId: number | "all";
  selectCategory: (categoryId: number | "all") => void;
}): ReactElement {
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  return (
    <motion.div
      aria-modal="true"
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm xl:hidden"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      role="dialog"
    >
      <motion.aside
        animate={{ x: 0 }}
        className="h-full w-full max-w-sm overflow-y-auto bg-white p-5 shadow-2xl"
        exit={{ x: "-100%" }}
        initial={{ x: "-100%" }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-lg font-black text-[#0a2540]">Categories</p>
          <button
            aria-label="Close menu"
            className="grid size-11 place-items-center rounded-full bg-slate-50"
            onClick={close}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          <button
            className={`min-h-12 rounded-2xl px-4 text-left text-sm font-black ${
              selectedCategoryId === "all"
                ? "bg-[#0a2540] text-white"
                : "bg-slate-50 text-slate-700"
            }`}
            onClick={() => {
              selectCategory("all");
              close();
            }}
            type="button"
          >
            All products
          </button>
          {categoryTree.map((category) => (
            <div className="rounded-2xl bg-slate-50 p-3" key={category.id}>
              <button
                className={`min-h-11 w-full rounded-xl px-3 text-left text-sm font-black ${
                  selectedCategoryId === category.id ? "bg-[#0a2540] text-white" : "text-[#0a2540]"
                }`}
                aria-expanded={expandedCategoryId === category.id}
                onClick={() =>
                  setExpandedCategoryId((current) => (current === category.id ? null : category.id))
                }
                type="button"
              >
                {category.name}
              </button>
              {expandedCategoryId === category.id ? (
                <div className="mt-2 grid gap-1">
                  <button
                    className="min-h-10 rounded-xl px-3 text-left text-xs font-black text-[#0e7490]"
                    onClick={() => {
                      selectCategory(category.id);
                      close();
                    }}
                    type="button"
                  >
                    View all {category.name}
                  </button>
                  {category.children.map((subcategory) => (
                    <button
                      className={`min-h-10 rounded-xl px-3 text-left text-xs font-bold ${
                        selectedCategoryId === subcategory.id
                          ? "bg-white text-[#0e7490] shadow-sm"
                          : "text-slate-600"
                      }`}
                      key={subcategory.id}
                      onClick={() => {
                        selectCategory(subcategory.id);
                        close();
                      }}
                      type="button"
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5">
          {accountName ? (
            <div className="grid gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 text-sm font-black text-[#0a2540]"
                href="/account"
                onClick={close}
              >
                My account
              </Link>
              <form action={logoutAction}>
                <button
                  className="min-h-12 w-full rounded-full bg-[#0a2540] text-sm font-black text-white"
                  type="submit"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={() => {
                close();
                openLogin();
              }}
              className="min-h-12 w-full rounded-full bg-[#f97316] text-sm font-black text-white"
              type="button"
            >
              Sign in
            </button>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

export function Footer(): ReactElement {
  return (
    <footer className="bg-[#071827] px-4 py-12 text-slate-300 sm:px-6 lg:py-14">
      <div className="mx-auto grid max-w-[1480px] gap-9 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.9fr_1.1fr]">
        <div>
          <p className="text-lg font-black tracking-tight text-white">MARSA EDGE MARINE LLC</p>
          <p className="mt-3 max-w-sm text-sm leading-6">
            Premium marine accessories, spare parts and equipment for UAE customers, workshops,
            retail buyers and vessel service teams.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              aria-label="Chat with Marsa Edge Marine on WhatsApp"
              className="inline-flex size-11 items-center justify-center rounded-full bg-[#25d366] text-white transition hover:bg-[#1ebe57] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href="https://wa.me/971527035250"
              rel="noreferrer"
              target="_blank"
            >
              <FooterWhatsAppIcon />
            </a>
            <a
              aria-label="Follow Marsa Edge Marine on Instagram"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-cyan-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href="https://www.instagram.com/marsaedgemarine?igsi=MXJ5YjlxaXY0YW91ag=="
              rel="noreferrer"
              target="_blank"
            >
              <InstagramIcon />
            </a>
          </div>
        </div>
        <FooterLinks
          heading="Shop"
          links={["Safety Gear", "Anchoring", "Electrical", "Cleaning"]}
        />
        <div>
          <p className="text-sm font-extrabold text-white">Support</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:text-white" href="/contact">
                Contact us
              </Link>
            </li>
            <li>
              <a
                className="hover:text-white"
                href="https://wa.me/971527035250"
                rel="noreferrer"
                target="_blank"
              >
                Quick quote on WhatsApp
              </a>
            </li>
            <li>
              <Link className="hover:text-white" href="/contact">
                Shipping &amp; order help
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/return-refund">
                Return &amp; Refund
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-extrabold text-white">Get in touch</p>
          <a
            className="mt-3 block text-sm font-semibold text-white hover:text-cyan-200"
            href="tel:+971527035250"
          >
            +971 52 703 5250
          </a>
          <a className="mt-2 block text-sm hover:text-white" href="mailto:sales@marsaedgemarine.ae">
            sales@marsaedgemarine.ae
          </a>
          <p className="mt-3 text-sm leading-6">
            Al Jaddaf Drydocks
            <br />
            Dubai, United Arab Emirates
          </p>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-[1480px] flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Marsa Edge Marine LLC. All rights reserved.</span>
        <Link className="hover:text-white" href="/return-refund">
          Return &amp; Refund Policy
        </Link>
      </div>
    </footer>
  );
}

function FooterLinks({ heading, links }: { heading: string; links: string[] }): ReactElement {
  return (
    <div>
      <p className="text-sm font-extrabold text-white">{heading}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link}>
            <a href="#catalog" className="hover:text-white">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterWhatsAppIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M19.05 4.95A9.88 9.88 0 0 0 12.04 2C6.58 2 2.15 6.42 2.15 11.88c0 1.75.46 3.46 1.33 4.96L2.05 22l5.3-1.39a9.91 9.91 0 0 0 4.69 1.18h.01c5.46 0 9.89-4.42 9.89-9.88a9.82 9.82 0 0 0-2.89-6.96Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M8.35 7.27c.2-.45.41-.46.6-.47h.51c.16 0 .38.06.49.33l.85 2.03c.1.25.06.42-.04.58l-.36.48c-.12.13-.24.28-.1.53.14.24.62 1.02 1.33 1.65.92.81 1.7 1.06 1.94 1.18.24.12.38.1.52-.06l.67-.77c.16-.18.32-.15.54-.08l2.08.98c.26.13.43.19.5.3.07.11.07.65-.15 1.27-.22.62-1.27 1.18-1.74 1.25-.45.07-1.03.1-1.66-.1-.38-.12-.86-.28-1.49-.55-2.62-1.14-4.33-3.81-4.46-3.99-.13-.18-1.07-1.42-1.07-2.71 0-1.28.67-1.91.91-2.17Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <rect height="15" rx="4" stroke="currentColor" strokeWidth="1.8" width="15" x="4.5" y="4.5" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.9" cy="7.3" fill="currentColor" r="1" />
    </svg>
  );
}

function SearchIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function CartIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 4h2l2 11h10l2-8H7" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
    </svg>
  );
}

function MenuIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ShieldIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function TruckIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  );
}

function BriefcaseIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M4 7h16v12H4zM4 12h16" />
    </svg>
  );
}

function LockIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function WhatsAppIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a9.86 9.86 0 0 0-8.48 14.9L2.2 21.8l5.05-1.3A10 10 0 1 0 12 2Zm0 17.95a7.95 7.95 0 0 1-4.05-1.1l-.3-.18-3 .77.8-2.91-.2-.3A7.99 7.99 0 1 1 12 19.95Zm4.36-5.97c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06a6.5 6.5 0 0 1-1.91-1.18 7.19 7.19 0 0 1-1.33-1.65c-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.5.58.18 1.1.15 1.51.09.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}
