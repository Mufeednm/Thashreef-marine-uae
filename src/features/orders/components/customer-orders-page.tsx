import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import type { AdminOrderDetail } from "@/domain/demo-store/demo-store-repository";
import { Footer } from "@/features/storefront/components/storefront-experience";
import { formatAedFromCents } from "@/shared/utils/currency";

export function CustomerOrdersPage({
  customer,
  orders,
}: {
  customer: { email: string; name: string; phone: string | null };
  orders: AdminOrderDetail[];
}): ReactElement {
  const totalSpent = orders.reduce((total, order) => total + order.totalAedCents, 0);
  return (
    <>
      <main className="min-h-dvh bg-[#f4f8fa] px-4 py-8 text-[#0a2540] sm:px-6 lg:py-12">
        <section className="mx-auto max-w-[1250px]">
          <Link className="text-sm font-bold text-[#0e7490] hover:underline" href="/">
            ← Back to shop
          </Link>
          <div className="mt-6 grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
            <aside className="h-fit overflow-hidden rounded-[2rem] bg-[#071827] text-white shadow-xl shadow-slate-950/10 lg:sticky lg:top-24">
              <div className="bg-gradient-to-br from-cyan-300/20 to-transparent p-6 sm:p-8">
                <div className="grid size-14 place-items-center rounded-2xl bg-[#f97316] text-xl font-black">
                  {customer.name.slice(0, 1).toUpperCase()}
                </div>
                <p className="mt-5 text-xs font-black tracking-[0.2em] text-cyan-200 uppercase">
                  My account
                </p>
                <h1 className="mt-2 text-2xl font-black tracking-tight">{customer.name}</h1>
                <p className="mt-2 break-all text-sm text-slate-300">{customer.email}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {customer.phone ?? "No mobile number saved"}
                </p>
              </div>
              <nav aria-label="Account navigation" className="border-t border-white/10 p-4">
                <span className="flex min-h-12 items-center rounded-2xl bg-white/10 px-4 text-sm font-black text-white">
                  My orders
                </span>
                <Link
                  className="mt-2 flex min-h-12 items-center rounded-2xl px-4 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  href="/#catalog"
                >
                  Continue shopping
                </Link>
                <Link
                  className="mt-2 flex min-h-12 items-center rounded-2xl px-4 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  href="/contact"
                >
                  Contact support
                </Link>
              </nav>
            </aside>

            <div>
              <header className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black tracking-[0.2em] text-[#f97316] uppercase">
                  Order centre
                </p>
                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Recent orders</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                      See your delivery details and the latest status. We will send further order
                      updates by email or WhatsApp.
                    </p>
                  </div>
                  <Link
                    className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-[#f97316] px-5 text-sm font-black text-white transition hover:bg-[#ea580c]"
                    href="/#catalog"
                  >
                    Shop products
                  </Link>
                </div>
                <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:max-w-md">
                  <AccountMetric label="Orders" value={String(orders.length)} />
                  <AccountMetric label="Order value" value={formatAedFromCents(totalSpent)} />
                </dl>
              </header>

              {orders.length ? (
                <div className="mt-6 space-y-4">
                  {orders.map((order) => (
                    <article
                      className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                      key={order.id}
                    >
                      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-black">Order #{order.id}</p>
                            <span className={statusClass(order.status)}>
                              {formatStatus(order.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            Placed {formatOrderDate(order.orderDate)} · {order.shippingZone}{" "}
                            delivery
                          </p>
                        </div>
                        <p className="text-xl font-black tabular-nums">
                          {formatAedFromCents(order.totalAedCents)}
                        </p>
                      </div>
                      <div className="mt-5 grid gap-5 md:grid-cols-[1fr_220px]">
                        <div>
                          <p className="text-xs font-black tracking-[0.16em] text-slate-500 uppercase">
                            Items
                          </p>
                          <ul className="mt-3 divide-y divide-slate-100">
                            {order.items.map((item) => (
                              <li
                                className="flex items-start justify-between gap-4 py-3 first:pt-0"
                                key={item.id}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <OrderItemImage imageUrl={item.imageUrl} name={item.name} />
                                  <span className="min-w-0 text-sm font-semibold text-slate-700">
                                    <span className="block">{item.name}</span>
                                    <span className="text-slate-500">Qty {item.quantity}</span>
                                  </span>
                                </div>
                                <span className="shrink-0 text-sm font-black">
                                  {formatAedFromCents(item.lineTotalAedCents)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-black tracking-[0.16em] text-slate-500 uppercase">
                            Delivery
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {order.deliveryAddress ??
                              "Our team will confirm your delivery address."}
                          </p>
                        </div>
                      </div>
                      <p className="mt-5 rounded-xl bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950">
                        {order.status === "rejected"
                          ? "This order needs attention. Contact our support team for assistance."
                          : "Order received. Further updates will be sent soon by email or WhatsApp."}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <section className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
                  <h2 className="text-2xl font-black">No orders yet</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                    When you place an order, its details and updates will appear here.
                  </p>
                  <Link
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#f97316] px-6 text-sm font-black text-white transition hover:bg-[#ea580c]"
                    href="/#catalog"
                  >
                    Shop marine products
                  </Link>
                </section>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function OrderItemImage({
  imageUrl,
  name,
}: {
  imageUrl: string | null;
  name: string;
}): ReactElement {
  if (!imageUrl) {
    return (
      <span
        aria-label="Product image unavailable"
        className="grid size-12 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-400"
        role="img"
      >
        —
      </span>
    );
  }

  return (
    <Image
      alt={name}
      className="size-12 shrink-0 rounded-xl border border-slate-100 bg-slate-50 object-cover"
      height={48}
      src={imageUrl}
      unoptimized={imageUrl.startsWith("/")}
      width={48}
    />
  );
}

function AccountMetric({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <dt className="text-xs font-bold text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-black">{value}</dd>
    </div>
  );
}

function formatOrderDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(date);
}

function formatStatus(status: string): string {
  return status === "accepted"
    ? "Accepted"
    : status === "rejected"
      ? "Needs attention"
      : "Received";
}

function statusClass(status: string): string {
  if (status === "accepted")
    return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800";
  if (status === "rejected")
    return "rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800";
  return "rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800";
}
