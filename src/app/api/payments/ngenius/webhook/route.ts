import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerEnvironment } from "@/config/env";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { completeNgeniusOrder } from "@/infrastructure/payments/ngenius-payment-completion";
import { retrieveNgeniusOrder } from "@/infrastructure/payments/ngenius-client";

const webhookSchema = z.object({
  eventName: z.string(),
  order: z.object({ reference: z.string().min(1) }),
});

export async function POST(request: Request): Promise<NextResponse> {
  const environment = getServerEnvironment();
  const headerName = environment.NGENIUS_WEBHOOK_HEADER_NAME;
  const secret = environment.NGENIUS_WEBHOOK_SECRET;
  if (!headerName || !secret || request.headers.get(headerName) !== secret) {
    return NextResponse.json({ message: "Invalid N-Genius webhook." }, { status: 401 });
  }
  const parsed = webhookSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ received: true });
  if (parsed.data.eventName !== "PURCHASED") return NextResponse.json({ received: true });
  try {
    const repository = createDemoStoreRepository();
    const order = await repository.findOrderByNgeniusReference(parsed.data.order.reference);
    if (order) await completeNgeniusOrder(order.id, await retrieveNgeniusOrder(parsed.data.order.reference));
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("N-Genius webhook processing failed", error);
    return NextResponse.json({ received: true });
  }
}
