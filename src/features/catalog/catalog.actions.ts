"use server";

import { revalidatePath } from "next/cache";
import {
  createBrandForAdmin,
  createCategoryForAdmin,
  createProductForAdmin,
  deleteBrandForAdmin,
  deleteCategoryForAdmin,
  updateBrandForAdmin,
  updateCategoryForAdmin,
} from "@/application/catalog/catalog-service";
import { requireAdminUser } from "@/application/auth/auth-service";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import { brandSchema, catalogRecordIdSchema, createCategorySchema, createProductSchema } from "@/features/catalog/catalog.schemas";
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
    homepageOrder: formData.get("homepageOrder"),
    isBannerProduct: formData.get("isBannerProduct"),
    isBestDeal: formData.get("isBestDeal"),
    isFeatured: formData.get("isFeatured"),
    isNewArrival: formData.get("isNewArrival"),
    isTopSelling: formData.get("isTopSelling"),
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
    homepageOrder: parsedProduct.data.homepageOrder,
    isBannerProduct: parsedProduct.data.isBannerProduct,
    isBestDeal: parsedProduct.data.isBestDeal,
    isFeatured: parsedProduct.data.isFeatured,
    isNewArrival: parsedProduct.data.isNewArrival,
    isTopSelling: parsedProduct.data.isTopSelling,
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
      "invalid-brand": "Select a brand that is managed in the Brand catalog.",
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

async function getAdminContext() {
  const repository = createDemoStoreRepository();
  return { repository, adminUser: await requireAdminUser(repository, await readSessionUser()) };
}

function revalidateCatalogAdmin(): void {
  revalidatePath("/"); revalidatePath("/shop"); revalidatePath("/admin"); revalidatePath("/admin/brands");
  revalidatePath("/admin/categories"); revalidatePath("/admin/products"); revalidatePath("/admin/products/new");
}

export async function createBrandAction(_previousState: CreateCategoryActionState, formData: FormData): Promise<CreateCategoryActionState> {
  const parsed = brandSchema.safeParse({ name: formData.get("name"), logoText: formData.get("logoText"), displayOrder: formData.get("displayOrder") });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, message: "Please correct the brand fields.", status: "error" };
  const { repository, adminUser } = await getAdminContext();
  const result = await createBrandForAdmin(repository, adminUser, parsed.data);
  if (!result.ok) return { message: result.reason === "duplicate" ? "A brand with that name already exists." : "Only admins can manage brands.", status: "error" };
  revalidateCatalogAdmin();
  return { message: "Brand created and ready for product assignment.", status: "success" };
}

export async function updateBrandAction(_previousState: CreateCategoryActionState, formData: FormData): Promise<CreateCategoryActionState> {
  const id = catalogRecordIdSchema.safeParse(formData.get("id"));
  const parsed = brandSchema.safeParse({ name: formData.get("name"), logoText: formData.get("logoText"), displayOrder: formData.get("displayOrder") });
  if (!id.success || !parsed.success) return { message: "Please correct the brand fields.", status: "error" };
  const { repository, adminUser } = await getAdminContext();
  const result = await updateBrandForAdmin(repository, adminUser, id.data, parsed.data);
  if (!result.ok) return { message: result.reason === "duplicate" ? "A brand with that name already exists." : "This brand could not be updated.", status: "error" };
  revalidateCatalogAdmin();
  return { message: "Brand updated. Existing products now use the new name.", status: "success" };
}

export async function deleteBrandAction(_previousState: CreateCategoryActionState, formData: FormData): Promise<CreateCategoryActionState> {
  const id = catalogRecordIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { message: "Invalid brand record.", status: "error" };
  const { repository, adminUser } = await getAdminContext();
  const result = await deleteBrandForAdmin(repository, adminUser, id.data);
  if (!result.ok) return { message: result.reason === "in-use" ? "This brand is used by products and cannot be deleted." : "This brand could not be deleted.", status: "error" };
  revalidateCatalogAdmin();
  return { message: "Brand deleted.", status: "success" };
}

export async function updateCategoryAction(_previousState: CreateCategoryActionState, formData: FormData): Promise<CreateCategoryActionState> {
  const id = catalogRecordIdSchema.safeParse(formData.get("id"));
  const parsed = createCategorySchema.safeParse({ bannerImageUrl: formData.get("bannerImageUrl"), displayOrder: formData.get("displayOrder"), isFeatured: formData.get("isFeatured"), homepageOrder: formData.get("homepageOrder"), showOnHomepage: formData.get("showOnHomepage"), name: formData.get("name"), parentCategoryId: formData.get("parentCategoryId") });
  if (!id.success || !parsed.success) return { message: "Please correct the category fields.", status: "error" };
  const { repository, adminUser } = await getAdminContext();
  const result = await updateCategoryForAdmin(repository, adminUser, id.data, parsed.data);
  if (!result.ok) return { message: result.reason === "in-use" ? "This category is currently in use." : "This category could not be updated.", status: "error" };
  revalidateCatalogAdmin();
  return { message: "Category updated.", status: "success" };
}

export async function deleteCategoryAction(_previousState: CreateCategoryActionState, formData: FormData): Promise<CreateCategoryActionState> {
  const id = catalogRecordIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { message: "Invalid category record.", status: "error" };
  const { repository, adminUser } = await getAdminContext();
  const result = await deleteCategoryForAdmin(repository, adminUser, id.data);
  if (!result.ok) return { message: result.reason === "in-use" ? "This category has products or child categories and cannot be deleted." : "This category could not be deleted.", status: "error" };
  revalidateCatalogAdmin();
  return { message: "Category deleted.", status: "success" };
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
    homepageOrder: formData.get("homepageOrder"),
    showOnHomepage: formData.get("showOnHomepage"),
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
    homepageOrder: parsedCategory.data.homepageOrder,
    showOnHomepage: parsedCategory.data.showOnHomepage,
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
