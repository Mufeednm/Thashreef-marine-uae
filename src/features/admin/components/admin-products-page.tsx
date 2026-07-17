import Link from "next/link";
import type { ReactElement } from "react";
import type { Category } from "@/domain/catalog/category";
import type { Product } from "@/domain/catalog/product";
import type { ProductVariant } from "@/domain/catalog/product-variant";
import { formatAedFromCents } from "@/shared/utils/currency";

interface AdminProductsPageProps {
  categories: Category[];
  products: Product[];
  variants: ProductVariant[];
}

export function AdminProductsPage({
  categories,
  products,
  variants,
}: AdminProductsPageProps): ReactElement {
  const variantCountByProduct = new Map<string, number>();

  for (const variant of variants) {
    variantCountByProduct.set(
      variant.productId,
      (variantCountByProduct.get(variant.productId) ?? 0) + 1,
    );
  }

  return (
    <div className="space-y-7">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Products" value={products.length.toString()} />
        <SummaryCard label="Categories" value={categories.length.toString()} />
        <SummaryCard label="Variants" value={variants.length.toString()} />
        <SummaryCard
          label="Featured"
          value={products.filter((product) => product.isFeatured).length.toString()}
        />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#102846]">Catalog pages</h2>
            <p className="mt-1 text-sm text-slate-500">
              Products are now managed from dedicated pages instead of a single long dashboard.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#f05a28] px-5 text-sm font-bold text-white transition hover:bg-[#d94d20]"
            href="/admin/products/new"
          >
            Add product
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#102846]">All catalog products</h2>
            <p className="mt-1 text-sm text-slate-500">
              Imported workbook products and new admin-created products share the same list.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-bold">Product</th>
                <th className="px-5 py-3 font-bold">Brand</th>
                <th className="px-5 py-3 font-bold">Category</th>
                <th className="px-5 py-3 font-bold">Price</th>
                <th className="px-5 py-3 font-bold">Variants</th>
                <th className="px-5 py-3 font-bold">Stock</th>
                <th className="px-5 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr className="hover:bg-slate-50" key={product.id}>
                  <td className="max-w-[300px] px-5 py-4">
                    <p className="truncate font-bold text-slate-800">{product.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{product.sku}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{product.brand}</td>
                  <td className="px-5 py-4 text-slate-600">{product.category}</td>
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
                  <td className="px-5 py-4 text-slate-600">
                    {variantCountByProduct.get(product.id) ?? (product.hasVariants ? 1 : 0)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        product.stockQuantity <= 10
                          ? "font-bold text-amber-700"
                          : "font-semibold text-slate-700"
                      }
                    >
                      {product.stockQuantity} units
                    </span>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
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
