import type { ReactElement } from "react";
import type { Product } from "@/domain/catalog/product";
import { logoutAction } from "@/features/auth/auth.actions";
import { formatAedFromCents } from "@/shared/utils/currency";

interface AdminDashboardProps {
  products: Product[];
}

const navigation = [
  "Overview",
  "Products",
  "Categories",
  "Orders",
  "Customers",
  "Content",
  "Reports",
  "Settings",
];

export function AdminDashboard({ products }: AdminDashboardProps): ReactElement {
  const totalStock = products.reduce((total, product) => total + product.stockQuantity, 0);
  const inventoryValue = products.reduce(
    (total, product) => total + product.priceAedCents * product.stockQuantity,
    0,
  );
  const lowStock = products.filter((product) => product.stockQuantity <= 10);
  const categories = new Set(products.map((product) => product.category));
  const recentProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="border-b border-slate-200 bg-[#102846] text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 lg:px-8">
          <p className="text-sm font-medium">Free UAE delivery on orders over AED 500</p>
          <div className="hidden items-center gap-5 text-xs text-slate-300 sm:flex">
            <span>UAE / AED</span>
            <span>Help centre</span>
            <span>+971 50 000 0000</span>
          </div>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-[#f05a28] text-lg font-black tracking-tight text-white">
              AM
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-[#102846]">
                THASHREEF-MARINE-UAE
              </p>
              <p className="text-[10px] font-bold tracking-[0.22em] text-slate-500 uppercase">
                Merchant console
              </p>
            </div>
          </div>
          <div className="hidden max-w-xl flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 md:block">
            Search products, orders, customers…
          </div>
          <form action={logoutAction}>
            <button
              className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              type="submit"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[224px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-4 py-6">
          <p className="px-3 text-[11px] font-bold tracking-[0.18em] text-slate-400 uppercase">
            Manage store
          </p>
          <nav
            aria-label="Admin navigation"
            className="mt-3 flex gap-1 overflow-x-auto lg:flex-col"
          >
            {navigation.map((item, index) => (
              <a
                className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition ${index === 0 ? "bg-[#e8f1fa] text-[#0e568f]" : "text-slate-600 hover:bg-slate-100"}`}
                href={index === 0 ? "#overview" : `#${item.toLowerCase()}`}
                key={item}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="mt-8 rounded-xl bg-[#102846] p-4 text-white">
            <p className="text-xs font-semibold text-slate-300">LOCAL DEMO</p>
            <p className="mt-2 text-sm leading-5">
              Data is safely stored in this project for testing.
            </p>
          </div>
        </aside>

        <main className="min-w-0 p-5 lg:p-8" id="overview">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-[#f05a28]">17 July 2026</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#102846]">
                Store overview
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                A clear snapshot of your marine parts catalog and operations.
              </p>
            </div>
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#f05a28] px-5 text-sm font-bold text-white transition hover:bg-[#d94d20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f05a28]"
              href="#add-product"
            >
              Add product
            </a>
          </div>

          <section
            className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Catalog summary"
          >
            <Metric
              label="Catalog products"
              value={products.length.toString()}
              detail={`${categories.size} active categories`}
            />
            <Metric
              label="Units in stock"
              value={totalStock.toLocaleString("en-AE")}
              detail={`${lowStock.length} need attention`}
              alert={lowStock.length > 0}
            />
            <Metric
              label="Inventory value"
              value={formatAedFromCents(inventoryValue)}
              detail="At current selling prices"
            />
            <Metric label="Sample orders" value="5" detail="2 delivered this month" />
          </section>

          <section className="mt-7 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#102846]">Catalog activity</h2>
                  <p className="mt-1 text-sm text-slate-500">Product availability by collection</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Healthy
                </span>
              </div>
              <div
                className="mt-7 flex h-36 items-end gap-3"
                aria-label="Inventory distribution chart"
              >
                {[62, 38, 82, 54, 70, 46, 90, 64, 76, 42, 58, 84].map((height, index) => (
                  <div
                    className="flex-1 rounded-t-md bg-[#9dc7e9]"
                    key={index}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>Electrical</span>
                <span>Safety</span>
                <span>Anchoring</span>
                <span>Deck</span>
                <span>Maintenance</span>
              </div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#102846]">Low-stock attention</h2>
              <p className="mt-1 text-sm text-slate-500">Reorder before the next sales cycle.</p>
              <div className="mt-4 space-y-3">
                {lowStock.slice(0, 4).map((product) => (
                  <div
                    className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-3 py-3"
                    key={product.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{product.name}</p>
                    </div>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-amber-700">
                      {product.stockQuantity} left
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section
            className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            id="products"
          >
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#102846]">Recent catalog products</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Seeded from the supplied marine inventory workbook.
                </p>
              </div>
              <span className="text-sm font-bold text-[#0e568f]">View all products →</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3 font-bold">Product</th>
                    <th className="px-5 py-3 font-bold">Category</th>
                    <th className="px-5 py-3 font-bold">Price</th>
                    <th className="px-5 py-3 font-bold">Stock</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentProducts.map((product) => (
                    <tr className="hover:bg-slate-50" key={product.id}>
                      <td className="max-w-[280px] px-5 py-4">
                        <p className="truncate font-bold text-slate-800">{product.name}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{product.category}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {formatAedFromCents(product.priceAedCents)}
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
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
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
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#102846]">{value}</p>
      <p className={`mt-2 text-xs font-semibold ${alert ? "text-amber-700" : "text-slate-500"}`}>
        {detail}
      </p>
    </article>
  );
}
