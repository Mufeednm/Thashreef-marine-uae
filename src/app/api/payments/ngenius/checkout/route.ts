import { NextResponse } from "next/server";
import { z } from "zod";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { getServerEnvironment } from "@/config/env";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { createNgeniusHostedOrder } from "@/infrastructure/payments/ngenius-client";
import { isValidInternationalPhone } from "@/shared/utils/phone";

const checkoutSchema = z.object({
  deliveryAddress: z.string().trim().min(8).max(600),
  emirate: z.string().trim().min(2).max(120),
  lines: z.array(z.object({ productId: z.string().min(1).max(120), quantity: z.number().int().min(1).max(99) })).min(1),
  phone: z.string().trim().refine(isValidInternationalPhone, "Enter a valid mobile number with 8 to 15 digits."),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ message: "Please complete the required checkout details." }, { status: 400 });

    const repository = createDemoStoreRepository();
    const user = await restoreSessionUser(repository, await readSessionUser());
    if (!user || user.role !== "customer") return NextResponse.json({ message: "Please sign in before paying." }, { status: 401 });

    const products = await repository.listProducts();
    const lines = parsed.data.lines.map((line) => ({ ...line, product: products.find((product) => product.id === line.productId) }));
    if (lines.some((line) => !line.product)) return NextResponse.json({ message: "One of the selected products is no longer available." }, { status: 400 });

    const subtotalAedCents = lines.reduce((sum, line) => sum + (line.product?.priceAedCents ?? 0) * line.quantity, 0);
    const shippingFeeAedCents = subtotalAedCents >= 70000 ? 0 : 2000;
    const order = await repository.createOrder({
      customerEmail: user.email,
      customerName: user.name,
      deliveryAddress: parsed.data.deliveryAddress,
      emirate: parsed.data.emirate,
      lines: lines.map((line) => ({ imageUrl: line.product?.imageUrl ?? "", name: line.product?.name ?? "", productId: line.productId, quantity: line.quantity, unitPriceAedCents: line.product?.priceAedCents ?? 0 })),
      paymentMethod: "ngenius",
      paymentStatus: "pending",
      phone: parsed.data.phone,
      shippingFeeAedCents,
      subtotalAedCents,
      totalAedCents: subtotalAedCents + shippingFeeAedCents,
    });
    const origin = getCheckoutOrigin(request);
    const hostedOrder = await createNgeniusHostedOrder({
      cancelUrl: `${origin}/checkout?ngenius=cancelled`,
      emailAddress: user.email,
      redirectUrl: `${origin}/checkout/success?order_id=${order.id}`,
      totalAedCents: subtotalAedCents + shippingFeeAedCents,
    });
    if (!(await repository.attachNgeniusOrderReference(order.id, hostedOrder.reference))) throw new Error("N-Genius order could not be linked.");
    return NextResponse.json({ checkoutUrl: hostedOrder.paymentUrl });
  } catch (error) {
    console.error("N-Genius checkout creation failed", error);
    return NextResponse.json({ message: "We could not start secure card payment. Please try again." }, { status: 500 });
  }
}

function getCheckoutOrigin(request: Request): string {
  const configuredOrigin = getServerEnvironment().NEXT_PUBLIC_APP_URL;
  return configuredOrigin ? configuredOrigin.replace(/\/$/, "") : new URL(request.url).origin;
}
