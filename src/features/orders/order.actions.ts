"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/application/auth/auth-service";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { sendOrderStatusEmail } from "@/infrastructure/email/smtp-order-email-sender";

const statusSchema = z.object({ id: z.coerce.number().int().positive(), status: z.enum(["accepted", "rejected"]) });

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const parsed = statusSchema.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  const repository = createDemoStoreRepository();
  const admin = await requireAdminUser(repository, await readSessionUser());
  if (!admin) return;
  const statusChanged = await repository.updateOrderStatus(parsed.data.id, parsed.data.status);
  if (!statusChanged) return;
  const order = await repository.getOrderDetail(parsed.data.id);
  if (order) {
    try {
      await sendOrderStatusEmail(order, parsed.data.status);
    } catch (error) {
      console.error(`Order status email failed for order ${order.id}`, error);
    }
  }
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}
