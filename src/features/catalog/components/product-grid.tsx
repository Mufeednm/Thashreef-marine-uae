import type { ReactElement } from "react";
import type { Product } from "@/domain/catalog/product";
import { formatAedFromCents } from "@/shared/utils/currency";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps): ReactElement {
  if (products.length === 0) {
    return (
      <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-950">No products yet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in as the admin account and add the first test product.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-teal-700 uppercase">
            Live Catalog
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">Products visible after login</h2>
        </div>
        <p className="text-sm text-slate-500">{products.length} products</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((product) => (
          <article
            className="overflow-hidden rounded-[28px] border border-white/70 bg-white/92 shadow-lg shadow-slate-900/8"
            key={product.id}
          >
            <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#0f766e,#164e63)] px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.26em] text-teal-100 uppercase">
                    {product.category}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <p className="text-sm leading-6 text-slate-600">{product.description}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="Price" value={formatAedFromCents(product.priceAedCents)} />
                <Stat
                  label="Added"
                  value={new Date(product.createdAt).toLocaleDateString("en-AE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

interface StatProps {
  label: string;
  value: string;
}

function Stat({ label, value }: StatProps): ReactElement {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
