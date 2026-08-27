import { NextResponse } from "next/server";
import { z } from "zod";
import { restoreSessionUser } from "@/application/auth/auth-service";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { getStripeClient } from "@/infrastructure/payments/stripe-client";

const stripeCheckoutSchema = z.object({
  deliveryAddress: z.string().trim().min(8).max(600),
  emirate: z.enum([
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain",
  ]),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1).max(120),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9][0-9 ()-]{5,30}$/, "Enter a valid mobile number."),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const parsed = stripeCheckoutSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please complete the required checkout details." },
        { status: 400 },
      );
    }

    const repository = createDemoStoreRepository();
    const user = await restoreSessionUser(repository, await readSessionUser());
    if (!user || user.role !== "customer") {
      return NextResponse.json({ message: "Please sign in before paying." }, { status: 401 });
    }

    const products = await repository.listProducts();
    const lines = parsed.data.lines.map((line) => ({
      ...line,
      product: products.find((product) => product.id === line.productId),
    }));
    if (lines.some((line) => !line.product)) {
      return NextResponse.json(
        { message: "One of the selected products is no longer available." },
        { status: 400 },
      );
    }

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
        imageUrl: line.product?.imageUrl ?? "",
        name: line.product?.name ?? "",
        productId: line.productId,
        quantity: line.quantity,
        unitPriceAedCents: line.product?.priceAedCents ?? 0,
      })),
      paymentMethod: "stripe",
      paymentStatus: "pending",
      phone: parsed.data.phone,
      shippingFeeAedCents: shipping,
      subtotalAedCents: subtotal,
      totalAedCents: subtotal + shipping,
    });

    const origin = new URL(request.url).origin;
    const checkout = await getStripeClient().checkout.sessions.create({
      cancel_url: `${origin}/checkout?stripe=cancelled`,
      client_reference_id: user.id,
      customer_email: user.email,
      line_items: [
        ...lines.map((line) => ({
          price_data: {
            currency: "aed",
            product_data: { name: line.product?.name ?? "Marine product" },
            unit_amount: line.product?.priceAedCents ?? 0,
          },
          quantity: line.quantity,
        })),
        ...(shipping
          ? [
              {
                price_data: {
                  currency: "aed",
                  product_data: { name: "UAE delivery" },
                  unit_amount: shipping,
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      metadata: { orderId: String(order.id) },
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    });
    if (!checkout.url) throw new Error("Stripe did not return a checkout URL.");
    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Stripe checkout creation failed", error);
    return NextResponse.json(
      { message: "We could not start secure card payment. Please try again." },
      { status: 500 },
    );
  }
}
