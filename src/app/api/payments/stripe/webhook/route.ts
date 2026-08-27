import { NextResponse } from "next/server";
import { getStripeClient, getStripeWebhookSecret } from "@/infrastructure/payments/stripe-client";
import { completeStripeCheckoutSession } from "@/infrastructure/payments/stripe-payment-completion";

export async function POST(request: Request): Promise<NextResponse> {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = getStripeWebhookSecret();
  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: "Stripe webhook is not configured." }, { status: 400 });
  }

  try {
    const event = getStripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
    if (event.type !== "checkout.session.completed") return NextResponse.json({ received: true });

    await completeStripeCheckoutSession(event.data.object);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook verification failed", error);
    return NextResponse.json({ message: "Invalid Stripe webhook." }, { status: 400 });
  }
}
