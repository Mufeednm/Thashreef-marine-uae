import type { ReactElement } from "react";
import type { Category } from "@/domain/catalog/category";
import type { Product } from "@/domain/catalog/product";
import type { ProductVariant } from "@/domain/catalog/product-variant";
import type {
  AdminOverviewMetrics,
  AdminRecentOrder,
} from "@/domain/demo-store/demo-store-repository";
import { formatAedFromCents } from "@/shared/utils/currency";

interface AdminOverviewPageProps {
  categories: Category[];
  metrics: AdminOverviewMetrics;
  products: Product[];
  recentOrders: AdminRecentOrder[];
  variants: ProductVariant[];
}

export function AdminOverviewPage({
  categories,
  metrics,
  products,
  recentOrders,
  variants,
}: AdminOverviewPageProps): ReactElement {
  const totalStock = products.reduce((total, product) => total + product.stockQuantity, 0);
  const inventoryValue = products.reduce(
    (total, product) => total + product.priceAedCents * product.stockQuantity,
    0,
  );
  const featuredProducts = products.filter((product) => product.isFeatured).length;
  const lowStock = products.filter((product) => product.stockQuantity <= 10);
  const featuredCategories = categories.filter((category) => category.isFeatured).slice(0, 6);

  return (
    <div className="space-y-7">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          detail={`${categories.length} structured categories`}
          label="Catalog products"
          value={products.length.toString()}
        />
        <Metric
          alert={lowStock.length > 0}
          detail={`${lowStock.length} low-stock items`}
          label="Units in stock"
          value={totalStock.toLocaleString("en-AE")}
        />
        <Metric
          detail={`${variants.length} active variants`}
          label="Inventory value"
          value={formatAedFromCents(inventoryValue)}
        />
        <Metric
          detail={`${metrics.activeCoupons} active coupons`}
          label="Revenue in workbook orders"
          value={formatAedFromCents(metrics.totalRevenueAedCents)}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#102846]">Operational pulse</h2>
              <p className="mt-1 text-sm text-slate-500">
                A quick look at the imported workbook data and current catalog readiness.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Synced
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Highlight
              label="Customer profiles"
              value={metrics.customerProfiles.toLocaleString("en-AE")}
            />
            <Highlight label="Workbook orders" value={metrics.orderCount.toLocaleString("en-AE")} />
            <Highlight label="Featured products" value={featuredProducts.toString()} />
            <Highlight label="Featured categories" value={featuredCategories.length.toString()} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {featuredCategories.map((category) => (
              <div className="rounded-2xl bg-slate-50 px-4 py-4" key={category.id}>
                <p className="text-sm font-bold text-slate-800">{category.name}</p>
                <p className="mt-1 text-xs text-slate-500">{category.slug}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#102846]">Low-stock attention</h2>
          <p className="mt-1 text-sm text-slate-500">Reorder before the next sales cycle.</p>
          <div className="mt-4 space-y-3">
            {lowStock.slice(0, 5).map((product) => (
              <div
                className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-3 py-3"
                key={product.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{product.sku}</p>
                </div>
                <span className="rounded-xl bg-white px-2 py-1 text-xs font-bold text-amber-700">
                  {product.stockQuantity} left
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-bold text-[#102846]">Recent orders</h2>
            <p className="mt-1 text-sm text-slate-500">
              Imported from the workbook so the admin side feels closer to a real operation.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-bold">Order</th>
                  <th className="px-5 py-3 font-bold">Customer</th>
                  <th className="px-5 py-3 font-bold">Date</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr className="hover:bg-slate-50" key={order.id}>
                    <td className="px-5 py-4 font-bold text-slate-800">#{order.id}</td>
                    <td className="px-5 py-4 text-slate-600">{order.customerName}</td>
                    <td className="px-5 py-4 text-slate-600">{order.orderDate}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {formatAedFromCents(order.totalAedCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#102846]">Catalog readiness</h2>
          <p className="mt-1 text-sm text-slate-500">
            Useful checkpoints before expanding the admin tools further.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="rounded-2xl bg-slate-50 px-4 py-3">
              All workbook product rows are synced into SQLite.
            </li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">
              Variants, orders, coupons, and customer profiles are available for future pages.
            </li>
            <li className="rounded-2xl bg-slate-50 px-4 py-3">
              New admin-created products write into the same SQLite catalog.
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}

function Highlight({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-xs font-bold tracking-[0.18em] text-slate-500 uppercase">{label}</p>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#102846]">{value}</p>
    </div>
  );
}

function Metric({
  alert = false,
  detail,
  label,
  value,
}: {
  alert?: boolean;
  detail: string;
  label: string;
  value: string;
}): ReactElement {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#102846]">{value}</p>
      <p className={`mt-2 text-xs font-semibold ${alert ? "text-amber-700" : "text-slate-500"}`}>
        {detail}
      </p>
    </article>
  );
}
