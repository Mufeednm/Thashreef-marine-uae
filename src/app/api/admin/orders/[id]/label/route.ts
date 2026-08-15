import { NextResponse } from "next/server";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId < 1) return NextResponse.json({ message: "Order not found." }, { status: 404 });

  const repository = createDemoStoreRepository();
  const user = await restoreSessionUser(repository, await readSessionUser());
  if (!user || (user.role !== "admin" && user.role !== "staff")) return NextResponse.json({ message: "Admin access is required." }, { status: 401 });
  const order = await repository.getOrderDetail(orderId);
  if (!order) return NextResponse.json({ message: "Order not found." }, { status: 404 });

  const orderDate = new Intl.DateTimeFormat("en-AE", { dateStyle: "medium" }).format(new Date(order.orderDate));
  const address = escapeHtml(order.deliveryAddress || order.shippingZone).replace(/\r?\n/g, "<br>");
  const items = order.items.map((item) => `<li><span>${escapeHtml(item.name)}</span><strong>× ${item.quantity}</strong></li>`).join("");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Parcel label — Order #${order.id}</title><style>
@page { size: 100mm 150mm; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; background: #e2e8f0; color: #0f172a; font-family: Arial, Helvetica, sans-serif; }
.label { width: 100mm; min-height: 150mm; margin: 16px auto; padding: 7mm; background: #fff; border: 1.5px solid #0f172a; }
.header { display: flex; justify-content: space-between; gap: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 5mm; }
.brand { font-size: 17px; font-weight: 800; letter-spacing: .04em; line-height: 1.1; }
.brand small, .caption { display: block; color: #475569; font-size: 9px; font-weight: 700; letter-spacing: .12em; margin-top: 5px; text-transform: uppercase; }
.order { font-size: 15px; font-weight: 800; text-align: right; white-space: nowrap; }
.to { margin-top: 6mm; }
.caption { margin: 0 0 5px; }
.name { font-size: 20px; font-weight: 800; line-height: 1.15; }
.address { font-size: 14px; font-weight: 600; line-height: 1.45; margin-top: 5px; }
.phone { color: #334155; font-size: 13px; font-weight: 700; margin-top: 5px; }
.items { border-top: 1px solid #94a3b8; margin-top: 6mm; padding-top: 4mm; }
ul { list-style: none; margin: 0; padding: 0; }
li { display: flex; gap: 12px; justify-content: space-between; padding: 3px 0; font-size: 12px; font-weight: 600; line-height: 1.35; }
li strong { white-space: nowrap; }
.footer { border-top: 1px solid #94a3b8; color: #334155; display: grid; font-size: 10px; font-weight: 700; gap: 3px; margin-top: 6mm; padding-top: 4mm; }
.actions { display: flex; justify-content: center; padding: 20px; }
button { background: #0f172a; border: 0; border-radius: 8px; color: #fff; cursor: pointer; font: inherit; font-weight: 700; min-height: 44px; padding: 0 18px; }
@media print { body { background: #fff; } .label { border-width: 1px; margin: 0; } .actions { display: none; } }
</style></head><body><main class="label"><header class="header"><div><div class="brand">MARSA EDGE<br>MARINE LLC</div><small>Parcel label</small></div><div class="order">ORDER #${order.id}<small>${escapeHtml(orderDate)}</small></div></header><section class="to"><p class="caption">Ship to</p><div class="name">${escapeHtml(order.customerName)}</div><div class="address">${address}</div>${order.customerPhone ? `<div class="phone">${escapeHtml(order.customerPhone)}</div>` : ""}</section><section class="items"><p class="caption">Contents</p><ul>${items}</ul></section><footer class="footer"><span>Order date: ${escapeHtml(orderDate)}</span><span>UAE delivery · Keep this label attached to the parcel</span></footer></main><div class="actions"><button type="button" onclick="window.print()">Print parcel label</button></div><script>window.addEventListener("load", () => window.setTimeout(() => window.print(), 150));</script></body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}
