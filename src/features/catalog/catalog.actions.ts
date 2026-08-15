"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  createBrandForAdmin,
  createCategoryForAdmin,
  createProductForAdmin,
  deleteProductForAdmin,
  deleteBrandForAdmin,
  deleteCategoryForAdmin,
  updateBrandForAdmin,
  updateCategoryForAdmin,
  updateProductForAdmin,
} from "@/application/catalog/catalog-service";
import { requireAdminUser } from "@/application/auth/auth-service";
import { readSessionUser } from "@/infrastructure/auth/session-cookie";
import { createDemoStoreRepository } from "@/infrastructure/demo-store/file-demo-store-repository";
import {
  brandSchema,
  catalogRecordIdSchema,
  createCategorySchema,
  createProductSchema,
} from "@/features/catalog/catalog.schemas";
import type {
  CreateCategoryActionState,
  CreateProductActionState,
} from "@/features/catalog/catalog.types";

const uploadImageSchema = z
  .instanceof(File)
  .nullable()
  .refine((file) => !file || file.size === 0 || file.size <= 5 * 1024 * 1024, {
    error: "Image must be 5 MB or smaller.",
  })
  .refine(
    (file) =>
      !file || file.size === 0 || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    {
      error: "Upload a JPG, PNG, or WebP image.",
    },
  );

const productImageSchema = z.object({
  imageFile: uploadImageSchema,
  secondaryImageFile: uploadImageSchema,
  tertiaryImageFile: uploadImageSchema,
});

const catalogImageSchema = z.object({
  imageFile: z
    .instanceof(File)
    .nullable()
    .refine((file) => !file || file.size === 0 || file.size <= 5 * 1024 * 1024, {
      error: "Image must be 5 MB or smaller.",
    })
    .refine(
      (file) =>
        !file || file.size === 0 || ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      {
        error: "Upload a JPG, PNG, or WebP image.",
      },
    ),
});

export async function createProductAction(
  _previousState: CreateProductActionState,
  formData: FormData,
): Promise<CreateProductActionState> {
  const parsedProduct = createProductSchema.safeParse({
    brand: formData.get("brand"),
    isBannerProduct: formData.get("isBannerProduct"),
    isBestDeal: formData.get("isBestDeal"),
    isFeatured: formData.get("isFeatured"),
    isNewArrival: formData.get("isNewArrival"),
    isTopSelling: formData.get("isTopSelling"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    descriptionAr: formData.get("descriptionAr"),
    imageUrl: "",
    name: formData.get("name"),
    nameAr: formData.get("nameAr"),
    regularPriceAed: formData.get("regularPriceAed"),
    salePriceAed: formData.get("salePriceAed"),
  });

  const parsedImage = productImageSchema.safeParse(productImageFormValues(formData));

  if (
    !parsedProduct.success ||
    !parsedImage.success ||
    !parsedImage.data?.imageFile ||
    parsedImage.data.imageFile.size === 0
  ) {
    const fieldErrors = parsedProduct.success ? {} : parsedProduct.error.flatten().fieldErrors;
    const imageErrors = parsedImage.success ? {} : parsedImage.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        ...fieldErrors,
        ...imageErrors,
        ...(!parsedImage.data?.imageFile || parsedImage.data.imageFile.size === 0
          ? { imageFile: ["The primary product image is required."] }
          : {}),
      },
      message: productValidationMessage({
        ...fieldErrors,
        ...imageErrors,
        ...(!parsedImage.data?.imageFile || parsedImage.data.imageFile.size === 0
          ? { imageFile: ["The primary product image is required."] }
          : {}),
      }),
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
    descriptionAr: parsedProduct.data.descriptionAr,
    imageUrl: await persistProductImage(parsedImage.data.imageFile),
    secondaryImageUrl: await persistProductImage(parsedImage.data.secondaryImageFile),
    tertiaryImageUrl: await persistProductImage(parsedImage.data.tertiaryImageFile),
    homepageOrder: parsedProduct.data.homepageOrder,
    isBannerProduct: parsedProduct.data.isBannerProduct,
    isBestDeal: parsedProduct.data.isBestDeal,
    isFeatured: parsedProduct.data.isFeatured,
    isNewArrival: parsedProduct.data.isNewArrival,
    isTopSelling: parsedProduct.data.isTopSelling,
    name: parsedProduct.data.name,
    nameAr: parsedProduct.data.nameAr,
    regularPriceAedCents: Math.round(parsedProduct.data.regularPriceAed * 100),
    salePriceAedCents:
      parsedProduct.data.salePriceAed === null
        ? null
        : Math.round(parsedProduct.data.salePriceAed * 100),
    sku: `ADMIN-${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`,
    // Kept only for legacy SQLite compatibility; orders are accepted without stock checks.
    stockQuantity: 0,
  });

  if (!result.ok) {
    const messageByReason = {
      "duplicate-sku": "The product could not be assigned an internal reference. Please try again.",
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

export async function updateProductAction(
  _previousState: CreateProductActionState,
  formData: FormData,
): Promise<CreateProductActionState> {
  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = createProductSchema.safeParse(productFormValues(formData));
  const parsedImage = productImageSchema.safeParse(productImageFormValues(formData));
  if (!id.success || !parsed.success || !parsedImage.success) {
    const fieldErrors = parsed.success ? undefined : parsed.error.flatten().fieldErrors;
    const imageErrors = parsedImage.success ? undefined : parsedImage.error.flatten().fieldErrors;
    return {
      fieldErrors: { ...fieldErrors, ...imageErrors },
      message: imageErrors
        ? productValidationMessage(imageErrors)
        : fieldErrors
          ? productValidationMessage(fieldErrors)
          : "This product record is invalid.",
      status: "error",
    };
  }

  const repository = createDemoStoreRepository();
  const adminUser = await requireAdminUser(repository, await readSessionUser());
  if (!adminUser)
    return { message: "Only the local admin account can update products.", status: "error" };
  const existingProduct = (await repository.listProducts()).find(
    (product) => product.id === id.data,
  );
  if (!existingProduct) return { message: "This product could not be found.", status: "error" };
  const [uploadedImage, uploadedSecondaryImage, uploadedTertiaryImage] = await Promise.all([
    persistCatalogImage(parsedImage.data.imageFile, "products"),
    persistCatalogImage(parsedImage.data.secondaryImageFile, "products"),
    persistCatalogImage(parsedImage.data.tertiaryImageFile, "products"),
  ]);
  const result = await updateProductForAdmin(repository, adminUser, id.data, {
    ...toProductInput(parsed.data, existingProduct.sku),
    imageUrl: uploadedImage,
    secondaryImageUrl: uploadedSecondaryImage,
    tertiaryImageUrl: uploadedTertiaryImage,
  });
  if (!result.ok)
    return {
      message: "This product could not be updated. Check its brand and category.",
      status: "error",
    };
  revalidateCatalogAdmin();
  revalidatePath(`/products/${result.product.slug}`);
  return { message: `${result.product.name} has been updated.`, status: "success" };
}

export async function deleteProductAction(
  _previousState: CreateProductActionState,
  formData: FormData,
): Promise<CreateProductActionState> {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return { message: "Invalid product record.", status: "error" };
  const repository = createDemoStoreRepository();
  const result = await deleteProductForAdmin(
    repository,
    await requireAdminUser(repository, await readSessionUser()),
    id.data,
  );
  if (!result.ok) return { message: "This product could not be deleted.", status: "error" };
  revalidateCatalogAdmin();
  return { message: "Product deleted from the catalog.", status: "success" };
}

function productFormValues(formData: FormData) {
  return {
    brand: formData.get("brand"),
    homepageOrder: 0,
    isBannerProduct: formData.get("isBannerProduct"),
    isBestDeal: formData.get("isBestDeal"),
    isFeatured: formData.get("isFeatured"),
    isNewArrival: formData.get("isNewArrival"),
    isTopSelling: formData.get("isTopSelling"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    descriptionAr: formData.get("descriptionAr"),
    imageUrl: "",
    name: formData.get("name"),
    nameAr: formData.get("nameAr"),
    regularPriceAed: formData.get("regularPriceAed"),
    salePriceAed: formData.get("salePriceAed"),
  };
}

function productImageFormValues(formData: FormData) {
  return {
    imageFile: formData.get("imageFile"),
    secondaryImageFile: formData.get("secondaryImageFile"),
    tertiaryImageFile: formData.get("tertiaryImageFile"),
  };
}

function toProductInput(product: z.infer<typeof createProductSchema>, sku: string) {
  return {
    ...product,
    imageUrl: product.imageUrl?.trim() || undefined,
    regularPriceAedCents: Math.round(product.regularPriceAed * 100),
    salePriceAedCents:
      product.salePriceAed === null ? null : Math.round(product.salePriceAed * 100),
    sku,
    stockQuantity: 0,
  };
}

function productValidationMessage(fieldErrors: Record<string, string[] | undefined>): string {
  const messages = Object.values(fieldErrors).flatMap((messages) => messages ?? []);
  return messages.length > 0
    ? messages.join(" ")
    : "Please correct the highlighted product fields and try again.";
}

async function persistProductImage(file: File | null): Promise<string | undefined> {
  return persistCatalogImage(file, "products");
}

async function persistCatalogImage(
  file: File | null,
  directory: "brands" | "categories" | "products",
): Promise<string | undefined> {
  if (!file || file.size === 0) return undefined;
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[file.type];
  if (!extension) return undefined;
  const uploadsDirectory = path.join(process.cwd(), "public", "uploads", directory);
  await mkdir(uploadsDirectory, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadsDirectory, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${directory}/${fileName}`;
}

async function getAdminContext() {
  const repository = createDemoStoreRepository();
  return { repository, adminUser: await requireAdminUser(repository, await readSessionUser()) };
}

function revalidateCatalogAdmin(): void {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
}

export async function createBrandAction(
  _previousState: CreateCategoryActionState,
  formData: FormData,
): Promise<CreateCategoryActionState> {
  const parsed = brandSchema.safeParse({
    name: formData.get("name"),
    nameAr: formData.get("nameAr"),
  });
  const parsedImage = catalogImageSchema.safeParse({ imageFile: formData.get("imageFile") });
  if (!parsed.success || !parsedImage.success)
    return {
      fieldErrors: {
        ...(parsed.success ? {} : parsed.error.flatten().fieldErrors),
        ...(parsedImage.success ? {} : parsedImage.error.flatten().fieldErrors),
      },
      message: "Please correct the brand fields.",
      status: "error",
    };
  if (!parsedImage.data.imageFile || parsedImage.data.imageFile.size === 0)
    return {
      fieldErrors: { imageFile: ["A brand image is required."] },
      message: "A brand image is required.",
      status: "error",
    };
  const { repository, adminUser } = await getAdminContext();
  const result = await createBrandForAdmin(repository, adminUser, {
    ...parsed.data,
    displayOrder: 0,
    imageUrl: (await persistCatalogImage(parsedImage.data.imageFile, "brands")) ?? null,
    logoText: parsed.data.name.slice(0, 24),
  });
  if (!result.ok)
    return {
      message:
        result.reason === "duplicate"
          ? "A brand with that name already exists."
          : "Only admins can manage brands.",
      status: "error",
    };
  revalidateCatalogAdmin();
  return { message: "Brand created and ready for product assignment.", status: "success" };
}

export async function updateBrandAction(
  _previousState: CreateCategoryActionState,
  formData: FormData,
): Promise<CreateCategoryActionState> {
  const id = catalogRecordIdSchema.safeParse(formData.get("id"));
  const parsed = brandSchema.safeParse({
    name: formData.get("name"),
    nameAr: formData.get("nameAr"),
  });
  const parsedImage = catalogImageSchema.safeParse({ imageFile: formData.get("imageFile") });
  if (!id.success || !parsed.success || !parsedImage.success)
    return { message: "Please correct the brand fields.", status: "error" };
  const { repository, adminUser } = await getAdminContext();
  const existingBrand = (await repository.listBrands()).find((brand) => brand.id === id.data);
  if (!existingBrand) return { message: "This brand could not be found.", status: "error" };
  if (
    (!parsedImage.data.imageFile || parsedImage.data.imageFile.size === 0) &&
    !existingBrand.imageUrl
  )
    return {
      fieldErrors: { imageFile: ["A brand image is required."] },
      message: "Upload a brand image before saving.",
      status: "error",
    };
  const result = await updateBrandForAdmin(repository, adminUser, id.data, {
    ...parsed.data,
    displayOrder: existingBrand.displayOrder,
    imageUrl: (await persistCatalogImage(parsedImage.data.imageFile, "brands")) ?? null,
    logoText: parsed.data.name.slice(0, 24),
  });
  if (!result.ok)
    return {
      message:
        result.reason === "duplicate"
          ? "A brand with that name already exists."
          : "This brand could not be updated.",
      status: "error",
    };
  revalidateCatalogAdmin();
  return { message: "Brand updated. Existing products now use the new name.", status: "success" };
}

export async function deleteBrandAction(
  _previousState: CreateCategoryActionState,
  formData: FormData,
): Promise<CreateCategoryActionState> {
  const id = catalogRecordIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { message: "Invalid brand record.", status: "error" };
  const { repository, adminUser } = await getAdminContext();
  const result = await deleteBrandForAdmin(repository, adminUser, id.data);
  if (!result.ok)
    return {
      message:
        result.reason === "in-use"
          ? "This brand is used by products and cannot be deleted."
          : "This brand could not be deleted.",
      status: "error",
    };
  revalidateCatalogAdmin();
  return { message: "Brand deleted.", status: "success" };
}

export async function updateCategoryAction(
  _previousState: CreateCategoryActionState,
  formData: FormData,
): Promise<CreateCategoryActionState> {
  const id = catalogRecordIdSchema.safeParse(formData.get("id"));
  const parsed = createCategorySchema.safeParse({
    bannerImageUrl: formData.get("bannerImageUrl"),
    isFeatured: formData.get("isFeatured"),
    homepageOrder: formData.get("homepageOrder"),
    showOnHomepage: formData.get("showOnHomepage"),
    name: formData.get("name"),
    nameAr: formData.get("nameAr"),
    parentCategoryId: formData.get("parentCategoryId"),
  });
  const parsedImage = catalogImageSchema.safeParse({ imageFile: formData.get("imageFile") });
  if (!id.success || !parsed.success || !parsedImage.success)
    return { message: "Please correct the category fields.", status: "error" };
  const { repository, adminUser } = await getAdminContext();
  const existingCategory = (await repository.listCategories()).find(
    (category) => category.id === id.data,
  );
  if (!existingCategory) return { message: "This category could not be found.", status: "error" };
  const result = await updateCategoryForAdmin(repository, adminUser, id.data, {
    ...parsed.data,
    bannerImageUrl:
      (await persistCatalogImage(parsedImage.data.imageFile, "categories")) ??
      parsed.data.bannerImageUrl,
    displayOrder: existingCategory.displayOrder,
  });
  if (!result.ok) {
    const message =
      result.reason === "invalid-parent" || result.reason === "self-parent"
        ? "A category cannot be placed under itself or one of its own child categories."
        : result.reason === "duplicate"
          ? "A category with that name already exists."
          : "This category could not be updated.";
    return { message, status: "error" };
  }
  revalidateCatalogAdmin();
  return { message: "Category updated.", status: "success" };
}

export async function deleteCategoryAction(
  _previousState: CreateCategoryActionState,
  formData: FormData,
): Promise<CreateCategoryActionState> {
  const id = catalogRecordIdSchema.safeParse(formData.get("id"));
  if (!id.success) return { message: "Invalid category record.", status: "error" };
  const { repository, adminUser } = await getAdminContext();
  const result = await deleteCategoryForAdmin(repository, adminUser, id.data);
  if (!result.ok)
    return {
      message:
        result.reason === "in-use"
          ? "This category has products or child categories and cannot be deleted."
          : "This category could not be deleted.",
      status: "error",
    };
  revalidateCatalogAdmin();
  return { message: "Category deleted.", status: "success" };
}

export async function createCategoryAction(
  _previousState: CreateCategoryActionState,
  formData: FormData,
): Promise<CreateCategoryActionState> {
  const parsedCategory = createCategorySchema.safeParse({
    bannerImageUrl: "",
    customFields: formData.get("customFields"),
    isFeatured: formData.get("isFeatured"),
    homepageOrder: formData.get("homepageOrder"),
    showOnHomepage: formData.get("showOnHomepage"),
    name: formData.get("name"),
    nameAr: formData.get("nameAr"),
    parentCategoryId: formData.get("parentCategoryId"),
  });
  const parsedImage = catalogImageSchema.safeParse({ imageFile: formData.get("imageFile") });

  if (!parsedCategory.success || !parsedImage.success) {
    return {
      fieldErrors: {
        ...(parsedCategory.success ? {} : parsedCategory.error.flatten().fieldErrors),
        ...(parsedImage.success ? {} : parsedImage.error.flatten().fieldErrors),
      },
      message: "Please correct the category fields and try again.",
      status: "error",
    };
  }

  if (!parsedImage.data.imageFile || parsedImage.data.imageFile.size === 0)
    return {
      fieldErrors: { imageFile: ["A category image is required."] },
      message: "A category image is required.",
      status: "error",
    };

  const repository = createDemoStoreRepository();
  const adminUser = await requireAdminUser(repository, await readSessionUser());

  if (!adminUser) {
    return {
      message: "Only the local admin account can create categories.",
      status: "error",
    };
  }

  const result = await createCategoryForAdmin(repository, adminUser, {
    bannerImageUrl: (await persistCatalogImage(parsedImage.data.imageFile, "categories")) ?? null,
    displayOrder: 0,
    fieldLabels: parsedCategory.data.customFields,
    isFeatured: parsedCategory.data.isFeatured,
    homepageOrder: parsedCategory.data.homepageOrder,
    showOnHomepage: parsedCategory.data.showOnHomepage,
    name: parsedCategory.data.name,
    nameAr: parsedCategory.data.nameAr,
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
