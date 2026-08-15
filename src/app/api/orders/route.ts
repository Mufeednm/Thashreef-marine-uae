import { NextResponse } from "next/server";
import { z } from "zod";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import {
  sendOrderConfirmationEmail,
  type OrderEmailDelivery,
} from "@/infrastructure/email/smtp-order-email-sender";

const orderSchema = z.object({
  deliveryAddress: z.string().trim().min(8).max(600),
  emirate: z.string().trim().min(2).max(80),
  paymentMethod: z.enum(["cod", "card", "stripe", "uae"]),
  phone: z.string().trim().min(7).max(32),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1).max(120),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = orderSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success)
      return NextResponse.json(
        { message: "Please complete the required checkout details." },
        { status: 400 },
      );
    const repository = createDemoStoreRepository();
    const user = await restoreSessionUser(repository, await readSessionUser());
    if (!user || user.role !== "customer")
      return NextResponse.json(
        { message: "Please sign in before placing an order." },
        { status: 401 },
      );
    const products = await repository.listProducts();
    const lines = parsed.data.lines.map((line) => ({
      ...line,
      product: products.find((product) => product.id === line.productId),
    }));
    if (lines.some((line) => !line.product))
      return NextResponse.json(
        { message: "One of the selected products is no longer available." },
        { status: 400 },
      );
    const subtotal = lines.reduce(
      (sum, line) => sum + (line.product?.priceAedCents ?? 0) * line.quantity,
      0,
    );
    const shipping = subtotal >= 70000 ? 0 : 2000;
    const order = await repository.createOrder({
      customerEmail: user.email,
      customerName: user.name,
      deliveryAddress: parsed.data.deliveryAddress,
      emirate: parsed.data.emirate,
      lines: lines.map((line) => ({
        name: line.product?.name ?? "",
        productId: line.productId,
        quantity: line.quantity,
        unitPriceAedCents: line.product?.priceAedCents ?? 0,
      })),
      paymentMethod: parsed.data.paymentMethod,
      phone: parsed.data.phone,
      shippingFeeAedCents: shipping,
      subtotalAedCents: subtotal,
      totalAedCents: subtotal + shipping,
    });
    let emailDelivery: OrderEmailDelivery | "failed" = "not-configured";
    const orderDetail = await repository.getOrderDetail(order.id);
    if (orderDetail) {
      try {
        emailDelivery = await sendOrderConfirmationEmail(orderDetail);
      } catch (error) {
        console.error(`Order confirmation email failed for order ${order.id}`, error);
        emailDelivery = "failed";
      }
    }
    return NextResponse.json({ emailDelivery, orderId: order.id });
  } catch (error) {
    console.error("Order submission failed", error);
    return NextResponse.json(
      { message: "We could not save this order. Please try again." },
      { status: 500 },
    );
  }
}
