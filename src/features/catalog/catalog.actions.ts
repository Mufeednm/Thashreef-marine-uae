"use server";

import { revalidatePath } from "next/cache";
import {
  createCategoryForAdmin,
  createProductForAdmin,
} from "@/application/catalog/catalog-service";
import { requireAdminUser } from "@/application/auth/auth-service";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { createCategorySchema, createProductSchema } from "@/features/catalog/catalog.schemas";
import type {
  CreateCategoryActionState,
  CreateProductActionState,
} from "@/features/catalog/catalog.types";

export async function createProductAction(
  _previousState: CreateProductActionState,
  formData: FormData,
): Promise<CreateProductActionState> {
  const parsedProduct = createProductSchema.safeParse({
    brand: formData.get("brand"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    name: formData.get("name"),
    regularPriceAed: formData.get("regularPriceAed"),
    salePriceAed: formData.get("salePriceAed"),
    sku: formData.get("sku"),
    stockQuantity: formData.get("stockQuantity"),
  });

  if (!parsedProduct.success) {
    return {
      fieldErrors: parsedProduct.error.flatten().fieldErrors,
      message: "Please correct the product fields and try again.",
      status: "error",
    };
  }

  const repository = createDemoStoreRepository();
  const adminUser = await requireAdminUser(repository, await readSessionUser());

  if (!adminUser) {
    return {
      message: "Only the local admin account can add products.",
      status: "error",
    };
  }

  const result = await createProductForAdmin(repository, adminUser, {
    brand: parsedProduct.data.brand,
    categoryId: parsedProduct.data.categoryId,
    description: parsedProduct.data.description,
    imageUrl: parsedProduct.data.imageUrl?.trim() || undefined,
    name: parsedProduct.data.name,
    regularPriceAedCents: Math.round(parsedProduct.data.regularPriceAed * 100),
    salePriceAedCents:
      parsedProduct.data.salePriceAed === null
        ? null
        : Math.round(parsedProduct.data.salePriceAed * 100),
    sku: parsedProduct.data.sku.toUpperCase(),
    stockQuantity: parsedProduct.data.stockQuantity,
  });

  if (!result.ok) {
    const messageByReason = {
      "duplicate-sku": "That SKU already exists in the local demo catalog.",
      "invalid-category": "Products must be assigned to a subcategory, not a main category.",
      unauthorized: "Only the local admin account can add products.",
    } satisfies Record<typeof result.reason, string>;

    return {
      message: messageByReason[result.reason],
      status: "error",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");

  return {
    message: `${result.product.name} is now live in the local catalog.`,
    status: "success",
  };
}

export async function createCategoryAction(
  _previousState: CreateCategoryActionState,
  formData: FormData,
): Promise<CreateCategoryActionState> {
  const parsedCategory = createCategorySchema.safeParse({
    bannerImageUrl: formData.get("bannerImageUrl"),
    customFields: formData.get("customFields"),
    displayOrder: formData.get("displayOrder"),
    isFeatured: formData.get("isFeatured"),
    name: formData.get("name"),
    parentCategoryId: formData.get("parentCategoryId"),
  });

  if (!parsedCategory.success) {
    return {
      fieldErrors: parsedCategory.error.flatten().fieldErrors,
      message: "Please correct the category fields and try again.",
      status: "error",
    };
  }

  const repository = createDemoStoreRepository();
  const adminUser = await requireAdminUser(repository, await readSessionUser());

  if (!adminUser) {
    return {
      message: "Only the local admin account can create categories.",
      status: "error",
    };
  }

  const result = await createCategoryForAdmin(repository, adminUser, {
    bannerImageUrl: parsedCategory.data.bannerImageUrl || null,
    displayOrder: parsedCategory.data.displayOrder,
    fieldLabels: parsedCategory.data.customFields,
    isFeatured: parsedCategory.data.isFeatured,
    name: parsedCategory.data.name,
    parentCategoryId: parsedCategory.data.parentCategoryId,
  });

  if (!result.ok) {
    return {
      message:
        result.reason === "duplicate-category"
          ? "A category with that name already exists."
          : "Only the local admin account can create categories.",
      status: "error",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");

  return {
    message: `${result.category.name} category is ready with ${parsedCategory.data.customFields.length} custom fields.`,
    status: "success",
  };
}
