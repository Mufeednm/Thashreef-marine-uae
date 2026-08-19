"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState, type ReactElement, type ReactNode } from "react";
import type { Category } from "@/domain/catalog/category";
import type { Product } from "@/domain/catalog/product";
import type { Brand } from "@/domain/demo-store/demo-store-repository";
import { formatAedFromCents } from "@/shared/utils/currency";
import { deleteProductAction } from "@/features/catalog/catalog.actions";
import { AddProductForm } from "@/features/catalog/components/add-product-form";
import {
  initialCreateProductActionState,
  type CreateProductActionState,
} from "@/features/catalog/catalog.types";

interface AdminProductsPageProps {
  categories: Category[];
  brands: Brand[];
  products: Product[];
}

export function AdminProductsPage({
  categories,
  brands,
  products,
}: AdminProductsPageProps): ReactElement {
  const [categoryId, setCategoryId] = useState<number | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const productCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.parentCategoryId !== null &&
          categories.some(
            (parentCategory) =>
              parentCategory.id === category.parentCategoryId &&
              parentCategory.parentCategoryId === null,
          ),
      ),
    [categories],
  );
  const categoriesWithProducts = useMemo(
    () =>
      productCategories.filter((category) =>
        products.some((product) => product.categoryId === category.id),
      ),
    [productCategories, products],
  );
  const filteredProducts = useMemo(
    () =>
      categoryId === "all"
        ? products
        : products.filter((product) => product.categoryId === categoryId),
    [categoryId, products],
  );

  return (
    <div className="space-y-7">
      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Products" value={products.length.toString()} />
        <SummaryCard label="Categories" value={categories.length.toString()} />
        <SummaryCard
          label="Featured"
          value={products.filter((product) => product.isFeatured).length.toString()}
        />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#102846]">All catalog products</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredProducts.length} products shown. Use the category filter to narrow the
              catalogue.
            </p>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600">
            <span className="sr-only">Filter products by category</span>
            <select
              className="min-h-11 max-w-full rounded-xl border border-slate-200 bg-white px-3 outline-none transition focus:border-[#0e568f]"
              onChange={(event) =>
                setCategoryId(event.target.value === "all" ? "all" : Number(event.target.value))
              }
              value={categoryId}
            >
              <option value="all">All populated categories</option>
              {categoriesWithProducts.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="min-h-11 rounded-xl bg-[#f05a28] px-4 text-sm font-bold text-white transition hover:bg-[#d94d20]"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            Create product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-bold">Product</th>
                <th className="px-5 py-3 font-bold">Brand / category</th>
                <th className="px-5 py-3 font-bold">Price</th>
                <th className="px-5 py-3 font-bold">Placement</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr className="hover:bg-slate-50" key={product.id}>
                  <td className="max-w-[320px] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8f1fa] text-xs font-extrabold text-[#0e568f]">
                        {product.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-800">{product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-700">{product.brand}</p>
                    <p className="mt-1 text-xs text-slate-500">{product.category}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {formatAedFromCents(product.priceAedCents)}
                    </p>
                    {product.salePriceAedCents ? (
                      <p className="text-xs text-slate-400 line-through">
                        {formatAedFromCents(product.regularPriceAedCents)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex max-w-40 flex-wrap gap-1">
                      {product.isFeatured ? <Badge label="Featured" tone="orange" /> : null}
                      {product.isNewArrival ? <Badge label="New" tone="blue" /> : null}
                      {product.isTopSelling ? <Badge label="Top" tone="green" /> : null}
                      {!product.isFeatured && !product.isNewArrival && !product.isTopSelling ? (
                        <span className="text-xs text-slate-400">Standard</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {product.isActive ? "Active" : "Draft"}
                      </span>
                      {product.isFeatured ? (
                        <span className="rounded-full bg-[#fff1ea] px-2.5 py-1 text-xs font-bold text-[#d94d20]">
                          Featured
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <ProductActions onView={() => setViewProduct(product)} product={product} />
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500" colSpan={7}>
                    No products are assigned to this category yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      {createOpen ? (
        <CatalogModal close={() => setCreateOpen(false)} title="Create product">
          <AddProductForm brands={brands} categories={productCategories} />
        </CatalogModal>
      ) : null}
      {viewProduct ? (
        <CatalogModal close={() => setViewProduct(null)} title="Product details">
          <ProductDetails product={viewProduct} />
        </CatalogModal>
      ) : null}
    </div>
  );
}

function ProductActions({
  onView,
  product,
}: {
  onView: () => void;
  product: Product;
}): ReactElement {
  const [state, action, pending] = useActionState<CreateProductActionState, FormData>(
    deleteProductAction,
    initialCreateProductActionState,
  );
  return (
    <div className="flex min-w-36 items-center gap-2">
      <button
        aria-label={`View ${product.name}`}
        className="icon-button"
        onClick={onView}
        type="button"
      >
        <ViewIcon />
      </button>
      <Link
        aria-label={`Edit ${product.name}`}
        className="icon-button"
        href={`/admin/products/${product.id}`}
      >
        <EditIcon />
      </Link>
      <form
        action={action}
        onSubmit={(event) => {
          if (!window.confirm(`Delete ${product.name}? This cannot be undone.`))
            event.preventDefault();
        }}
      >
        <input name="id" type="hidden" value={product.id} />
        <button
          aria-label={`Delete ${product.name}`}
          className="icon-button border-rose-100 text-rose-700 hover:bg-rose-50 disabled:text-slate-400"
          disabled={pending}
          type="submit"
        >
          <DeleteIcon />
        </button>
      </form>
      {state.message ? (
        <span aria-live="polite" className="text-xs text-rose-700">
          {state.status === "error" ? state.message : "Deleted"}
        </span>
      ) : null}
    </div>
  );
}

function CatalogModal({
  children,
  close,
  title,
}: {
  children: ReactNode;
  close: () => void;
  title: string;
}): ReactElement {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-0 sm:items-center sm:justify-center sm:p-6"
      role="dialog"
    >
      <section className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[2rem] bg-[#f4f8fa] p-5 shadow-2xl sm:max-w-5xl sm:rounded-[2rem] sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-[#102846]">{title}</h2>
          <button
            aria-label="Close product modal"
            className="icon-button bg-white"
            onClick={close}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function ProductDetails({ product }: { product: Product }): ReactElement {
  const images = [product.imageUrl, product.secondaryImageUrl, product.tertiaryImageUrl].filter(
    (image): image is string => Boolean(image),
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-[#f05a28] uppercase">
          {product.brand} · {product.category}
        </p>
        <h3 className="mt-2 text-2xl font-extrabold text-[#102846]">{product.name}</h3>
        <p className="mt-4 text-sm leading-6 text-slate-600">{product.description}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3">
          <Detail label="Price" value={formatAedFromCents(product.priceAedCents)} />
          <Detail label="Status" value={product.isActive ? "Active" : "Draft"} />
          <Detail
            label="Created"
            value={new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(
              new Date(product.createdAt),
            )}
          />
          <Detail
            label="Gallery"
            value={`${images.length} image${images.length === 1 ? "" : "s"}`}
          />
        </dl>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
        {images.map((image, index) => (
          <div
            className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white p-2"
            key={image}
          >
            <Image
              alt={`${product.name} image ${index + 1}`}
              className="h-full w-full object-contain"
              height={300}
              src={image}
              unoptimized={image.startsWith("/")}
              width={300}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-xl bg-slate-100 p-3">
      <dt className="text-xs font-bold tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-slate-800">{value}</dd>
    </div>
  );
}
function ViewIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}
function EditIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m4 16.5-.5 4 4-.5L19 8.5 15.5 5 4 16.5Z" />
      <path d="m14.5 6 3.5 3.5" />
    </svg>
  );
}
function DeleteIcon(): ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16M10 11v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 13h10l1-13" />
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

function Badge({
  label,
  tone,
}: {
  label: string;
  tone: "blue" | "green" | "orange";
}): ReactElement {
  const styles = {
    blue: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${styles[tone]}`}>
      {label}
    </span>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#102846]">{value}</p>
    </article>
  );
}
