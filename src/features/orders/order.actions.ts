"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminUser } from "@/application/auth/auth-service";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";

const statusSchema = z.object({ id: z.coerce.number().int().positive(), status: z.enum(["accepted", "rejected"]) });

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const parsed = statusSchema.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;
  const repository = createDemoStoreRepository();
  const admin = await requireAdminUser(repository, await readSessionUser());
  if (!admin) return;
  await repository.updateOrderStatus(parsed.data.id, parsed.data.status);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}
