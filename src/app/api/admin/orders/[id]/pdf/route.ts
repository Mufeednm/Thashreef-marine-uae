import PDFDocument from "pdfkit";
import { NextResponse } from "next/server";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { formatAedFromCents } from "@/shared/utils/currency";

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

  const document = new PDFDocument({ margin: 48, size: "A4" });
  const pdf = new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });

  document.fillColor("#102846").fontSize(22).text("Marsa Edge Marine LLC");
  document.fillColor("#52606d").fontSize(10).text("Order detail", { align: "right" });
  document.moveDown(1.5).fillColor("#102846").fontSize(16).text(`Order #${order.id}`);
  document.fillColor("#52606d").fontSize(10).text(`Placed ${new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.orderDate))}`);
  document.moveDown().fillColor("#102846").fontSize(12).text("Customer");
  document.fillColor("#334155").fontSize(10).text(`${safeText(order.customerName)}\n${safeText(order.customerEmail)}\n${safeText(order.customerPhone || "No mobile number saved")}`);
  document.moveDown().fillColor("#102846").fontSize(12).text("Delivery address");
  document.fillColor("#334155").fontSize(10).text(safeText(order.deliveryAddress || order.shippingZone));
  document.moveDown().fillColor("#102846").fontSize(12).text("Items");
  document.moveDown(0.5);
  document.fontSize(9).fillColor("#52606d").text("PRODUCT", 48).text("QTY", 390, document.y - 11).text("TOTAL", 460, document.y - 11);
  document.moveTo(48, document.y + 5).lineTo(547, document.y + 5).strokeColor("#d9e2ec").stroke();
  for (const item of order.items) {
    document.moveDown(0.8).fillColor("#102846").fontSize(10).text(safeText(item.name), 48, document.y, { width: 320 });
    const rowY = document.y - 12;
    document.fillColor("#334155").text(String(item.quantity), 390, rowY);
    document.fillColor("#102846").text(formatAedFromCents(item.lineTotalAedCents), 460, rowY, { align: "right", width: 87 });
  }
  document.moveDown(1.5).moveTo(330, document.y).lineTo(547, document.y).strokeColor("#d9e2ec").stroke();
  document.moveDown(0.6).fillColor("#102846").fontSize(12).text("Order total", 330).text(formatAedFromCents(order.totalAedCents), 460, document.y - 14, { align: "right", width: 87 });
  document.moveDown(2).fillColor("#52606d").fontSize(9).text(`Payment: ${safeText(order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod)}    Status: ${safeText(order.status)}`);
  document.end();

  return new Response(Uint8Array.from(await pdf), { headers: { "Content-Disposition": `attachment; filename=\"marsa-edge-order-${order.id}.pdf\"`, "Content-Type": "application/pdf" } });
}

function safeText(value: string): string {
  return value.replace(/[\r\n]+/g, ", ").replace(/[^\x20-\x7E]/g, "?");
}
