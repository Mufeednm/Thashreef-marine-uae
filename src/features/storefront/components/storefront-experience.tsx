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
import { formatAedFromCents } from "@/shared/utils/currency";

interface StorefrontExperienceProps {
  accountName?: string;
  banners: HomepageBanner[];
  brands: Brand[];
  categoryTree: CategoryTreeNode[];
  products: Product[];
}

type CartLine = Product & { quantity: number };

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

interface CategoryTile {
  description: string;
  icon: ReactElement;
  imageAlt: string;
  imageUrl: string;
  matcher: string;
  title: string;
}

interface BrandTile {
  label: string;
  tone: string;
}

const heroSlides: HeroSlide[] = [
  {
    accent: "Safety kits, PFDs and rescue-ready essentials",
    cta: "Shop Safety Gear",
    description:
      "Life jackets, lifebuoys, visibility gear and emergency accessories for crews, workshops and family boating.",
    eyebrow: "Marine safety equipment",
    imageAlt: "Orange marine safety life jacket and rescue equipment",
    imageUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2200&q=86",
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

const categoryTiles: CategoryTile[] = [
  {
    description: "Life jackets, rings, rescue and visibility gear",
    icon: <ShieldIcon />,
    imageAlt: "Marine safety equipment and diving accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=82",
    matcher: "life",
    title: "Safety Gear",
  },
  {
    description: "Anchors, ropes, shackles and mooring support",
    icon: <AnchorIcon />,
    imageAlt: "Ropes and anchor hardware near marina water",
    imageUrl:
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=900&q=82",
    matcher: "anchor",
    title: "Anchoring",
  },
  {
    description: "Navigation lights, batteries and electrical parts",
    icon: <BoltIcon />,
    imageAlt: "Navigation equipment and electrical controls",
    imageUrl:
      "https://images.unsplash.com/photo-1520942702018-0862200e6873?auto=format&fit=crop&w=900&q=82",
    matcher: "navigation",
    title: "Electrical",
  },
  {
    description: "Fenders, ladders, fittings and deck accessories",
    icon: <DeckIcon />,
    imageAlt: "Deck hardware and dock accessories",
    imageUrl:
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=900&q=82",
    matcher: "fender",
    title: "Deck Hardware",
  },
  {
    description: "Bilge pumps, hoses and plumbing essentials",
    icon: <PumpIcon />,
    imageAlt: "Marine maintenance hardware and tools",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=82",
    matcher: "pump",
    title: "Pumps & Plumbing",
  },
  {
    description: "Brushes, cleaners and maintenance products",
    icon: <SparkIcon />,
    imageAlt: "Clean ocean water and maintenance context",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=82",
    matcher: "clean",
    title: "Cleaning",
  },
];

const demoAccounts = [
  { label: "Admin", password: "admin123", username: "admin" },
  { label: "Staff", password: "Staff@123", username: "staff" },
  { label: "Customer", password: "userpassword", username: "user" },
] as const;

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [activeSlide, setActiveSlide] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const slides = useMemo<HeroSlide[]>(
    () =>
      banners.length > 0
        ? banners.map((banner) => ({
            accent: "UAE marine supply, delivered with confidence",
            cta: banner.buttonText,
            description: banner.subtitle,
            eyebrow: "Thashreef Marine UAE",
            imageAlt: banner.title,
            imageUrl: banner.imageUrl,
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
  const navigationCategoryTree = useMemo(
    () => pruneEmptyCategoryBranches(categoryTree, assignedCategoryIds),
    [assignedCategoryIds, categoryTree],
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
    getDescendantCategoryIds(categoryLookup.get(categoryId)).some((id) => assignedCategoryIds.has(id));
  const brandNames = useMemo(
    () => (brands.length > 0 ? brands.map((brand) => brand.name) : Array.from(new Set(products.map((product) => product.brand)))).slice(0, 12),
    [brands, products],
  );
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter(
      (product) =>
        (!selectedCategoryIds || selectedCategoryIds.has(product.categoryId)) &&
        (!normalizedQuery ||
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.sku.toLowerCase().includes(normalizedQuery) ||
          product.brand.toLowerCase().includes(normalizedQuery) ||
          product.category.toLowerCase().includes(normalizedQuery) ||
          product.mainCategory?.toLowerCase().includes(normalizedQuery)),
    );
  }, [products, query, selectedCategoryIds]);
  const featuredProducts = useMemo(
    () => products.filter((product) => product.isFeatured).slice(0, 10),
    [products],
  );
  const homepageCategories = useMemo(
    () => flatCategories.filter((category) => category.showOnHomepage).sort((a, b) => a.homepageOrder - b.homepageOrder),
    [flatCategories],
  );
  const bestSellers = useMemo(
    () =>
      products.some((product) => product.isTopSelling)
        ? products.filter((product) => product.isTopSelling).sort((a, b) => a.homepageOrder - b.homepageOrder).slice(0, 10)
        : [...products].sort((left, right) => left.homepageOrder - right.homepageOrder).slice(0, 10),
    [products],
  );
  const newArrivals = useMemo(
    () =>
      (products.some((product) => product.isNewArrival) ? products.filter((product) => product.isNewArrival) : [...products])
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 10),
    [products],
  );
  const recentlyAdded = newArrivals.slice(0, 8);
  const recommendedProducts = useMemo(
    () =>
      [...products]
        .sort(
          (left, right) =>
            Number(right.isFeatured) - Number(left.isFeatured) ||
            right.priceAedCents - left.priceAedCents,
        )
        .slice(0, 10),
    [products],
  );
  const topBrandProducts = useMemo(() => {
    const selectedBrands = new Set(brandNames.slice(0, 6));
    return products.filter((product) => selectedBrands.has(product.brand)).slice(0, 10);
  }, [brandNames, products]);
  const cartQuantity = cart.reduce((total, line) => total + line.quantity, 0);
  const cartTotal = cart.reduce((total, line) => total + line.priceAedCents * line.quantity, 0);
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
        const savedCart = JSON.parse(window.sessionStorage.getItem("thashreef-cart") ?? "[]") as CartLine[];
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
    setCartOpen(true);
  }

  function selectDepartment(matcher: string): void {
    const matching =
      matcher === "all"
        ? "all"
        : (flatCategories.find((category) => category.slug.includes(matcher))?.id ?? "all");
    selectCategoryAndScroll(matching);
  }

  function selectCategoryAndScroll(categoryId: number | "all"): void {
    const nextCategoryId =
      categoryId === "all" || hasProductsInCategory(categoryId) ? categoryId : "all";
    setQuery("");
    setSelectedCategoryId(nextCategoryId);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function searchProducts(value: string): void {
    setQuery(value);
    if (value.trim()) {
      setSelectedCategoryId("all");
      window.requestAnimationFrame(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" }));
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
      <TopBar />
      <Header
        accountName={accountName}
        cartQuantity={cartQuantity}
        categoryTree={navigationCategoryTree}
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
            activeSlide={activeSlide}
            products={products}
            selectDepartment={selectDepartment}
            setActiveSlide={setActiveSlide}
            slide={slide}
            slideCount={slides.length}
          />
        </section>

        <TrustStrip />

        <CategoryCarousel selectDepartment={selectDepartment} />

        {homepageCategories.map((category) => {
          const ids = new Set(getDescendantCategoryIds(category));
          const categoryProducts = products.filter((product) => ids.has(product.categoryId)).slice(0, 6);
          return categoryProducts.length ? (
            <ProductCarousel
              addToCart={addToCart}
              eyebrow="Featured category"
              key={category.id}
              products={categoryProducts}
              subtitle={`Selected marine equipment from ${category.name}.`}
              title={category.name}
            />
          ) : null;
        })}

        <PromoBanner
          cta="Build a bulk order"
          eyebrow="Workshop and trade supply"
          imageAlt="Marine accessories arranged for maintenance work"
          imageUrl="/product-images/marine-essential.svg"
          onClick={() => setLoginOpen(true)}
          text="Bundle safety gear, pumps, electrical accessories, fenders and cleaning essentials for service teams with a faster quote flow."
          title="Marine accessories for practical UAE operations."
        />

        <ProductCarousel
          addToCart={addToCart}
          eyebrow="Editor picks"
          products={featuredProducts.length > 0 ? featuredProducts : products.slice(0, 10)}
          subtitle="High-utility accessories with strong availability and polished product cards."
          title="Featured Products"
        />
        <ProductCarousel
          addToCart={addToCart}
          eyebrow="Fast movers"
          products={bestSellers}
          subtitle="Commonly needed items for retail counters, crews and service workshops."
          title="Best Sellers"
        />
        <ProductCarousel
          addToCart={addToCart}
          eyebrow="Fresh arrivals"
          products={newArrivals}
          subtitle="Recently synced products from the Thashreef Marine UAE catalogue."
          title="New Arrivals"
        />

        <BrandLogoCarousel brands={brands} />

        <ProductCarousel
          addToCart={addToCart}
          eyebrow="Trusted labels"
          products={topBrandProducts.length > 0 ? topBrandProducts : products.slice(0, 10)}
          subtitle="Product rails grouped around the brands customers already ask for."
          title="Top Brands"
        />

        <PromoSplit selectDepartment={selectDepartment} />

        <ProductCarousel
          addToCart={addToCart}
          eyebrow="Latest catalogue"
          products={recentlyAdded}
          subtitle="A quick rail for new or recently updated marine accessories."
          title="Recently Added"
        />
        <ProductCarousel
          addToCart={addToCart}
          eyebrow="Smart picks"
          products={recommendedProducts}
          subtitle="Balanced recommendations across safety, electrical, anchoring and daily accessories."
          title="Recommended for You"
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
                  {filteredProducts.length} products available for {selectedCategoryName.toLowerCase()}.
                  Search by SKU, brand, category or product name.
                </p>
              </div>
              <div className="flex max-w-4xl flex-wrap gap-2">
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
              </div>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {filteredProducts.slice(0, 15).map((product, index) => (
                  <ProductCard
                    addToCart={addToCart}
                    index={index}
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-bold text-[#0a2540]">No products match this selection yet.</p>
                <p className="mt-2 text-sm text-slate-500">Choose All products or select another category to continue browsing.</p>
                <button className="mt-5 min-h-11 rounded-full bg-[#0a2540] px-5 text-sm font-bold text-white" onClick={() => selectCategoryAndScroll("all")} type="button">Show all products</button>
              </div>
            )}
          </div>
        </section>

        <WhyChooseUs />
        <ProjectGallery />
      </main>

      <Footer />

      <a
        aria-label="Contact Thashreef Marine UAE on WhatsApp"
        className="fixed bottom-5 left-5 z-20 grid size-12 place-items-center rounded-full bg-[#16a34a] text-xs font-black text-white shadow-xl shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-[#15803d]"
        href="https://wa.me/971500000000"
        rel="noreferrer"
        target="_blank"
      >
        WA
      </a>
      <AnimatePresence>
        {mobileMenuOpen ? (
          <MobileMenu
            accountName={accountName}
            categoryTree={navigationCategoryTree}
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

function TopBar(): ReactElement {
  return (
    <div className="bg-[#071827] px-4 py-2 text-center text-xs font-semibold text-white">
      Thashreef Marine UAE | Marine accessories, spare parts, UAE dispatch and GCC shipment support
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

function pruneEmptyCategoryBranches(
  categories: CategoryTreeNode[],
  assignedCategoryIds: Set<number>,
): CategoryTreeNode[] {
  return categories.flatMap((category) => {
    const children = pruneEmptyCategoryBranches(category.children, assignedCategoryIds);
    if (!assignedCategoryIds.has(category.id) && children.length === 0) return [];
    return [{ ...category, children }];
  });
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
        <Link className="flex shrink-0 items-center gap-3" href="/">
          <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#f97316] to-[#c2410c] font-black text-white shadow-lg shadow-orange-900/10">
            TM
          </span>
          <span className="hidden text-sm font-black leading-4 tracking-tight text-[#0a2540] sm:block">
            THASHREEF
            <br />
            MARINE UAE
          </span>
        </Link>
        <label className="relative flex min-h-12 min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 transition focus-within:border-[#0e7490] focus-within:bg-white focus-within:shadow-sm">
          <SearchIcon />
          <span className="sr-only">{t("header.search")}</span>
          <input
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("header.search")}
            value={query}
          />
        </label>
        <a
          className="hidden min-h-11 items-center rounded-full border border-slate-200 px-4 text-xs font-black text-slate-700 transition hover:border-[#0e7490] hover:text-[#0e7490] lg:inline-flex"
          href="https://wa.me/971500000000"
          rel="noreferrer"
          target="_blank"
        >
          {t("header.quickQuote")}
        </a>
        {accountName ? (
          <form action={logoutAction}>
            <button
              className="hidden min-h-11 rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:block"
              type="submit"
            >
              {t("header.logout")}
            </button>
          </form>
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
      <CategoryNavigation categories={categoryTree} selectedCategoryId={selectedCategoryId} selectCategory={selectCategory} />
    </header>
  );
}

function HeroShowcase({
  activeSlide,
  products,
  selectDepartment,
  setActiveSlide,
  slide,
  slideCount,
}: {
  activeSlide: number;
  products: Product[];
  selectDepartment: (matcher: string) => void;
  setActiveSlide: (index: number) => void;
  slide: HeroSlide;
  slideCount: number;
}): ReactElement {
  const productHighlights = products.slice(0, 3);

  return (
    <section className="relative min-h-[620px] overflow-hidden rounded-[2rem] bg-[#071827] text-white shadow-2xl shadow-slate-950/18">
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
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1280px) 1120px, 100vw"
            src={slide.imageUrl}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,24,39,.96),rgba(7,24,39,.78),rgba(7,24,39,.24))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,116,144,.35),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(249,115,22,.22),transparent_28%)]" />

      <div className="relative grid min-h-[620px] gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:p-10">
        <div className="flex max-w-3xl flex-col justify-center py-12">
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
            className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.42, delay: 0.08 }}
          >
            {slide.title}
          </motion.h1>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.42, delay: 0.14 }}
          >
            {slide.description}
          </motion.p>
          <div className="mt-4 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-cyan-50 backdrop-blur">
            {slide.accent}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="min-h-12 rounded-full bg-[#f97316] px-6 text-sm font-black text-white shadow-xl shadow-orange-950/20 transition hover:-translate-y-0.5 hover:bg-[#c2410c]"
              onClick={() => selectDepartment(slide.matcher)}
              type="button"
            >
              {slide.cta}
            </button>
            <a
              className="inline-flex min-h-12 items-center rounded-full border border-white/35 px-6 text-sm font-bold text-white transition hover:bg-white/10"
              href="#catalog"
            >
              Browse Catalog
            </a>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            <HeroMetric label="Products" value={products.length.toString()} />
            <HeroMetric label="Rails" value="6" />
            <HeroMetric label="Dispatch" value="UAE" />
          </div>
        </div>

        <div className="hidden flex-col justify-end gap-4 lg:flex">
          <div className="rounded-[1.75rem] border border-white/15 bg-white/12 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black">Accessory spotlight</p>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black">
                LIVE CATALOG
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {productHighlights.map((product, index) => (
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3" key={product.id}>
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-white">
                    <Image
                      alt={product.name}
                      className="object-contain p-2"
                      fill
                      sizes="64px"
                      src={product.imageUrl}
                      unoptimized={product.imageUrl.startsWith("/")}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{product.name}</p>
                    <p className="mt-1 text-xs text-cyan-50">{formatAedFromCents(product.priceAedCents)}</p>
                  </div>
                  <span className="ml-auto grid size-7 place-items-center rounded-full bg-[#f97316] text-xs font-black">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-full bg-white/10 p-2 backdrop-blur">
            {Array.from({ length: slideCount }, (_, index) => index).map((index) => (
              <button
                aria-label={`Show slide ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  activeSlide === index ? "w-12 bg-white" : "w-3 bg-white/45 hover:bg-white/75"
                }`}
                key={index}
                onClick={() => setActiveSlide(index)}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-[11px] font-black tracking-[0.18em] text-slate-300 uppercase">
        {label}
      </p>
    </div>
  );
}

function TrustStrip(): ReactElement {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-[1480px] gap-0 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
        <TrustStripItem icon={<TruckIcon />} title="Fast UAE dispatch" text="Local delivery support for marine accessories." />
        <TrustStripItem icon={<ShieldIcon />} title="Marine grade" text="Safety, power, anchoring, deck and cleaning supplies." />
        <TrustStripItem icon={<BriefcaseIcon />} title="Trade friendly" text="Built for workshops, crews, retailers and procurement teams." />
        <TrustStripItem icon={<LockIcon />} title="Secure cart" text="Simple demo cart flow with quick quote paths." />
      </div>
    </section>
  );
}

function TrustStripItem({
  icon,
  text,
  title,
}: {
  icon: ReactElement;
  text: string;
  title: string;
}): ReactElement {
  return (
    <article className="flex gap-3 border-b border-slate-100 py-5 sm:border-r sm:px-5 sm:last:border-r-0">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef8fb] text-[#0e7490]">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-black text-[#0a2540]">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-500">{text}</span>
      </span>
    </article>
  );
}

function CategoryCarousel({
  selectDepartment,
}: {
  selectDepartment: (matcher: string) => void;
}): ReactElement {
  return (
    <section className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Shop by category"
        subtitle="Accessory-focused departments for fast browsing — no boat-sales clutter, just products customers can buy."
        title="Find the right marine equipment faster"
      />
      <div className="mt-7 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none]">
        {categoryTiles.map((category) => (
          <motion.button
            className="group relative h-64 w-[290px] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-slate-900 text-left shadow-lg shadow-slate-900/10"
            key={category.title}
            onClick={() => selectDepartment(category.matcher)}
            type="button"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Image
              alt={category.imageAlt}
              className="object-cover transition duration-500 group-hover:scale-105"
              fill
              sizes="290px"
              src={category.imageUrl}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-slate-950/25 to-transparent" />
            <div className="absolute left-5 top-5 grid size-12 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur">
              {category.icon}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-xl font-black">{category.title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-200">{category.description}</p>
              <span className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-black backdrop-blur">
                Explore
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function ProductCarousel({
  addToCart,
  eyebrow,
  products,
  subtitle,
  title,
}: {
  addToCart: (product: Product) => void;
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
  const chipColor =
    tone === "dark"
      ? "border-white/10 bg-white/10 text-cyan-100"
      : "border-slate-200 bg-white text-slate-500";

  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-black tracking-[0.24em] text-[#f97316] uppercase">{eyebrow}</p>
        <h2 className={`mt-2 text-3xl font-black tracking-tight ${headingColor}`}>{title}</h2>
        <p className={`mt-2 max-w-2xl text-sm leading-6 ${subtitleColor}`}>{subtitle}</p>
      </div>
      <span className={`hidden rounded-full border px-4 py-2 text-xs font-black sm:inline-flex ${chipColor}`}>
        Swipe or scroll
      </span>
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
  index,
  product,
}: {
  addToCart: (product: Product) => void;
  index: number;
  product: Product;
}): ReactElement {
  const { locale } = useLocale();
  const name = locale === "ar" && product.nameAr ? product.nameAr : product.name;
  const description = locale === "ar" && product.descriptionAr ? product.descriptionAr : product.description;
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
        <Image
          alt={name}
          className="h-full w-full object-contain p-7 transition duration-300 group-hover:scale-105"
          height={640}
          loading={index > 3 ? "lazy" : "eager"}
          src={product.imageUrl}
          unoptimized={product.imageUrl.startsWith("/")}
          width={640}
        />
        <div className="absolute left-4 top-4 rounded-full bg-[#0a2540] px-3 py-1 text-[10px] font-black text-white shadow-sm">
          {product.category}
        </div>
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black text-[#0a2540] shadow-sm">
          {product.isFeatured ? "Featured" : "Marine"}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs font-black tracking-[0.16em] text-slate-400 uppercase">
          {product.brand}
        </p>
        <p className="mt-2 min-h-10 text-sm font-black leading-5 text-[#0a2540]">{name}</p>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
          {description}
        </p>
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
        </div>
        <button
          className="mt-4 min-h-11 w-full rounded-full bg-[#0a2540] px-3 text-sm font-black text-white transition hover:bg-[#0e7490]"
          onClick={() => addToCart(product)}
          type="button"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}

function PromoBanner({
  cta,
  eyebrow,
  imageAlt,
  imageUrl,
  onClick,
  text,
  title,
}: {
  cta: string;
  eyebrow: string;
  imageAlt: string;
  imageUrl: string;
  onClick: () => void;
  text: string;
  title: string;
}): ReactElement {
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-12 sm:px-6">
      <div className="grid overflow-hidden rounded-[2rem] bg-[#0a2540] text-white shadow-xl shadow-slate-950/10 lg:grid-cols-[1fr_360px]">
        <div className="p-7 sm:p-10">
          <p className="text-xs font-black tracking-[0.24em] text-cyan-100 uppercase">{eyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{text}</p>
          <button
            className="mt-7 min-h-12 rounded-full bg-white px-6 text-sm font-black text-[#0a2540] transition hover:-translate-y-0.5 hover:bg-cyan-50"
            onClick={onClick}
            type="button"
          >
            {cta}
          </button>
        </div>
        <div className="relative min-h-72 bg-gradient-to-br from-cyan-100 to-orange-100">
          <Image
            alt={imageAlt}
            className="object-contain p-10"
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            src={imageUrl}
            unoptimized={imageUrl.startsWith("/")}
          />
        </div>
      </div>
    </section>
  );
}

function BrandLogoCarousel({ brands }: { brands: Brand[] }): ReactElement {
  const { locale } = useLocale();
  return (
    <section className="mx-auto max-w-[1480px] px-4 pb-12 sm:px-6">
      <SectionHeader
        eyebrow="Shop by brand"
        subtitle="A premium logo rail gives shoppers a faster path to familiar marine accessory brands."
        title="Supplier and brand partners"
      />
      <div className="mt-7 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none]">
        {brands.slice(0, 12).map((brand, index) => (
          <Link
            aria-label={`Shop ${locale === "ar" && brand.nameAr ? brand.nameAr : brand.name} products`}
            className="flex h-28 w-52 shrink-0 snap-start items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0e568f]"
            href={`/brands/${brand.slug}`}
            key={brand.id}
          >
            <span
              className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${
                brandTiles[index % brandTiles.length].tone
              } text-sm font-black text-white`}
            >
              {brand.logoText.slice(0, 2).toUpperCase()}
            </span>
            <span className="ml-3 text-sm font-black text-[#0a2540]">{locale === "ar" && brand.nameAr ? brand.nameAr : brand.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PromoSplit({
  selectDepartment,
}: {
  selectDepartment: (matcher: string) => void;
}): ReactElement {
  return (
    <section className="mx-auto grid max-w-[1480px] gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-slate-950/6">
        <div className="relative min-h-56 bg-[#e8f7fb]">
          <Image
            alt="Life jacket marine safety accessory"
            className="object-contain p-10"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            src="/product-images/life-jacket.svg"
            unoptimized
          />
        </div>
        <div className="p-7">
          <p className="text-xs font-black tracking-[0.22em] text-[#f97316] uppercase">
            Safety bundle
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#0a2540]">
            Build a crew-ready safety kit
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Combine life jackets, rings, lights and rescue accessories in one focused shopping path.
          </p>
          <button
            className="mt-5 min-h-11 rounded-full bg-[#0a2540] px-5 text-sm font-black text-white"
            onClick={() => selectDepartment("life")}
            type="button"
          >
            Shop safety
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-slate-950/6">
        <div className="relative min-h-56 bg-[#fff3e6]">
          <Image
            alt="Marine anchor accessory"
            className="object-contain p-10"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            src="/product-images/anchor.svg"
            unoptimized
          />
        </div>
        <div className="p-7">
          <p className="text-xs font-black tracking-[0.22em] text-[#f97316] uppercase">
            Mooring essentials
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#0a2540]">
            Anchors, ropes, fenders and hardware
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Make docking and day-to-day protection easy with a stronger accessory-led category path.
          </p>
          <button
            className="mt-5 min-h-11 rounded-full bg-[#0a2540] px-5 text-sm font-black text-white"
            onClick={() => selectDepartment("anchor")}
            type="button"
          >
            Shop anchoring
          </button>
        </div>
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

function ProjectGallery(): ReactElement {
  const gallery = [
    {
      alt: "Marine battery and electrical accessory",
      image: "/product-images/battery.svg",
      title: "Electrical readiness",
    },
    {
      alt: "Marine pump accessory",
      image: "/product-images/pump.svg",
      title: "Pump and bilge care",
    },
    {
      alt: "Marine cleaning accessory",
      image: "/product-images/cleaning.svg",
      title: "Maintenance essentials",
    },
    {
      alt: "Marine fender accessory",
      image: "/product-images/fender.svg",
      title: "Docking protection",
    },
  ];

  return (
    <section className="mx-auto max-w-[1480px] px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Latest projects"
        subtitle="A visual gallery keeps the page active and reinforces the accessories-first direction."
        title="Accessory setups and service essentials"
      />
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {gallery.map((item) => (
          <article
            className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
            key={item.title}
          >
            <div className="relative aspect-square bg-gradient-to-br from-cyan-50 to-orange-50">
              <Image
                alt={item.alt}
                className="object-contain p-10 transition duration-300 group-hover:scale-105"
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                src={item.image}
                unoptimized
              />
            </div>
            <div className="p-5">
              <p className="text-sm font-black text-[#0a2540]">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Practical product group for everyday marine operations.
              </p>
            </div>
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
            <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
              Your cart is empty. Add safety gear, hardware or marine accessories to begin.
            </p>
          ) : (
            cart.map((line) => (
              <div className="rounded-2xl border border-slate-200 p-4" key={line.id}>
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
            ))
          )}
        </div>
        <div className="border-t border-slate-200 p-5">
          <div className="flex justify-between text-sm font-bold">
            <span>Subtotal</span>
            <span>{formatAedFromCents(total)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">Shipping and quote options are calculated later.</p>
          {cart.length === 0 ? (
            <button className="mt-5 min-h-12 w-full rounded-full bg-slate-300 text-sm font-black text-white" disabled type="button">Proceed to checkout</button>
          ) : (
            <Link className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-[#f97316] text-sm font-black text-white transition hover:bg-[#c2410c]" href="/checkout">Proceed to checkout</Link>
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
            <Image
              alt={product.name}
              className="mx-auto mt-8 h-64 w-full object-contain"
              height={640}
              src={product.imageUrl}
              unoptimized={product.imageUrl.startsWith("/")}
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
            <p className="text-xs font-bold text-slate-500">SKU {product.sku}</p>
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
        <section className="mt-3 rounded-2xl bg-white p-4 shadow-lg shadow-slate-950/10">
          <p className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
            Demo accounts
          </p>
          <div className="mt-3 grid gap-2">
            {demoAccounts.map((account) => (
              <div
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                key={account.username}
              >
                <span className="font-bold text-slate-800">
                  {account.label}: {account.username}
                </span>
                <code className="rounded bg-white px-2 py-1 text-xs text-slate-600">
                  {account.password}
                </code>
              </div>
            ))}
          </div>
        </section>
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
              selectedCategoryId === "all" ? "bg-[#0a2540] text-white" : "bg-slate-50 text-slate-700"
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
                  selectedCategoryId === category.id
                    ? "bg-[#0a2540] text-white"
                    : "text-[#0a2540]"
                }`}
                aria-expanded={expandedCategoryId === category.id}
                onClick={() => setExpandedCategoryId((current) => current === category.id ? null : category.id)}
                type="button"
              >
                {category.name}
              </button>
              {expandedCategoryId === category.id ? <div className="mt-2 grid gap-1">
                <button className="min-h-10 rounded-xl px-3 text-left text-xs font-black text-[#0e7490]" onClick={() => { selectCategory(category.id); close(); }} type="button">View all {category.name}</button>
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
              </div> : null}
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5">
          {accountName ? (
            <form action={logoutAction}>
              <button
                className="min-h-12 w-full rounded-full bg-[#0a2540] text-sm font-black text-white"
                type="submit"
              >
                Logout
              </button>
            </form>
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

function Footer(): ReactElement {
  return (
    <footer className="bg-[#071827] px-4 py-12 text-slate-300 sm:px-6">
      <div className="mx-auto grid max-w-[1480px] gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-lg font-black text-white">THASHREEF MARINE UAE</p>
          <p className="mt-3 max-w-sm text-sm leading-6">
            Premium marine accessories, spare parts and equipment for UAE customers, workshops,
            retail buyers and vessel service teams.
          </p>
          <div className="mt-5 flex gap-2">
            {brandTiles.slice(0, 4).map((brand) => (
              <span
                className={`grid size-9 place-items-center rounded-xl bg-gradient-to-br ${brand.tone} text-[10px] font-black text-white`}
                key={brand.label}
              >
                {brand.label.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        <FooterLinks heading="Shop" links={["Safety Gear", "Anchoring", "Electrical", "Cleaning"]} />
        <FooterLinks heading="Support" links={["Contact", "Quick Quote", "Shipping", "Returns"]} />
        <div>
          <p className="text-sm font-extrabold text-white">Service desk</p>
          <p className="mt-3 text-sm">Mon-Sat | 8am-6pm</p>
          <p className="mt-1 text-sm">+971 50 000 0000</p>
          <p className="mt-1 text-sm">sales@thashreef-marine-uae.local</p>
        </div>
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

function SearchIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function CartIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 4h2l2 11h10l2-8H7" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
    </svg>
  );
}

function MenuIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ShieldIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function AnchorIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v12M5 12h14M7 17c1.5 2 3 3 5 3s3.5-1 5-3M5 15v-3h3M19 15v-3h-3" />
    </svg>
  );
}

function BoltIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m13 2-8 12h6l-1 8 9-13h-6l1-7Z" />
    </svg>
  );
}

function DeckIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 17h16M6 13h12M8 9h8M10 5h4M5 21h14" />
    </svg>
  );
}

function PumpIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M7 15h8a4 4 0 0 0 0-8H9v4" />
      <path d="M4 19h14M7 11v8M15 11h5v4h-5" />
    </svg>
  );
}

function SparkIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />
    </svg>
  );
}

function TruckIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  );
}

function BriefcaseIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1M4 7h16v12H4zM4 12h16" />
    </svg>
  );
}

function LockIcon(): ReactElement {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
