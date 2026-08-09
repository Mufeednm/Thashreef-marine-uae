import type { ReactElement } from "react";
import type { Category } from "@/domain/catalog/category";
import type { Product } from "@/domain/catalog/product";
import type { ProductVariant } from "@/domain/catalog/product-variant";
import type {
  AdminActivityMetrics,
  AdminOverviewMetrics,
  AdminRecentOrder,
} from "@/domain/demo-store/demo-store-repository";
import { formatAedFromCents } from "@/shared/utils/currency";

interface AdminOverviewPageProps {
  activity: AdminActivityMetrics;
  categories: Category[];
  metrics: AdminOverviewMetrics;
  products: Product[];
  recentOrders: AdminRecentOrder[];
  variants: ProductVariant[];
}

export function AdminOverviewPage({
  activity,
  categories,
  metrics,
  products,
  recentOrders,
  variants,
}: AdminOverviewPageProps): ReactElement {
  return (
    <div className="space-y-7">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          detail={`${categories.length} structured categories`}
          label="Catalog products"
          value={products.length.toString()}
        />
        <Metric
          detail={`${variants.length} active variants`}
          label="Product variants"
          value={variants.length.toLocaleString("en-AE")}
        />
        <Metric
          detail={`${metrics.activeCoupons} active coupons`}
          label="Revenue in workbook orders"
          value={formatAedFromCents(metrics.totalRevenueAedCents)}
        />
        <Metric detail="Registered storefront users" label="Customers" value={metrics.customerProfiles.toLocaleString("en-AE")} />
      </section>

      <section>
        <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#102846]">Store activity</h2>
              <p className="mt-1 text-sm text-slate-500">
                A simple snapshot of catalog, customer and order activity.
              </p>
            </div>
            <span className="mr-6 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Synced
            </span>
          </div>
          <div className="grid border-t border-slate-200 xl:grid-cols-[1.45fr_0.9fr]">
            <ActivityComparison activity={activity} />
            <RevenueSummary values={activity.revenueAedCents} />
          </div>
        </article>

      </section>

      <section>
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

      </section>
    </div>
  );
}

function ActivityComparison({ activity }: { activity: AdminActivityMetrics }): ReactElement {
  const periods = ["Today", "Last 7 days", "This month"];
  const rows = [
    { color: "bg-sky-600", label: "New customers", values: [activity.customerRegistrations.today, activity.customerRegistrations.week, activity.customerRegistrations.month] },
    { color: "bg-emerald-600", label: "Orders received", values: [activity.orders.today, activity.orders.week, activity.orders.month] },
  ];
  const max = Math.max(...rows.flatMap((row) => row.values), 1);
  return <article className="p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-extrabold tracking-tight text-[#102846]">Customer and order activity</h3><p className="mt-1 text-sm text-slate-500">Live totals from the customer and order records in SQLite.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Current periods</span></div><div className="mt-8 space-y-7" role="img" aria-label="Comparison of customer registrations and orders for today, the last seven days, and this month">{rows.map((row) => <div key={row.label}><div className="mb-3 flex items-center gap-2"><span className={`size-2.5 rounded-full ${row.color}`} /><p className="text-sm font-bold text-slate-700">{row.label}</p></div><div className="space-y-3">{row.values.map((value, index) => <div className="grid grid-cols-[92px_1fr_auto] items-center gap-3" key={periods[index]}><span className="text-xs font-semibold text-slate-500">{periods[index]}</span><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full min-w-1 rounded-full ${row.color}`} style={{ width: `${Math.max((value / max) * 100, value ? 4 : 0)}%` }} /></div><span className="w-8 text-right text-sm font-extrabold tabular-nums text-[#102846]">{value}</span></div>)}</div></div>)}</div></article>;
}

function RevenueSummary({ values }: { values: { today: number; week: number; month: number } }): ReactElement {
  const periods = [{ label: "Today", value: values.today }, { label: "Last 7 days", value: values.week }, { label: "This month", value: values.month }];
  const max = Math.max(...periods.map((period) => period.value), 1);
  return <article className="border-t border-slate-200 bg-slate-50/70 p-6 sm:p-8 xl:border-t-0 xl:border-l"><p className="text-sm font-bold text-[#102846]">Order value</p><p className="mt-2 text-3xl font-extrabold tracking-tight text-[#102846]">{formatAedFromCents(values.month)}</p><p className="mt-1 text-sm text-slate-500">Total received this month</p><div className="mt-8 flex h-36 items-end gap-4" aria-label="Order value comparison by period" role="img">{periods.map((period) => <div className="flex flex-1 flex-col items-center gap-2" key={period.label}><span className="text-center text-xs font-bold tabular-nums text-slate-700">{formatAedFromCents(period.value)}</span><div className="flex h-20 w-full items-end rounded-t-xl bg-slate-200 p-1"><div className="w-full rounded-lg bg-gradient-to-t from-[#f05a28] to-[#fb923c]" style={{ height: `${Math.max((period.value / max) * 100, period.value ? 8 : 0)}%` }} /></div><span className="text-center text-[11px] font-bold text-slate-500">{period.label}</span></div>)}</div><p className="mt-7 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Values are order totals, not forecasts. They update as orders are recorded.</p></article>;
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
