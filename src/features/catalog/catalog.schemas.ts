import { z } from "zod";

export const createProductSchema = z.object({
  brand: z.string().trim().min(2, { error: "Brand must be at least 2 characters long." }),
  homepageOrder: z.coerce.number().int().min(0).default(0),
  isBannerProduct: z
    .string()
    .nullish()
    .transform((value) => value === "on"),
  isBestDeal: z
    .string()
    .nullish()
    .transform((value) => value === "on"),
  isFeatured: z
    .string()
    .nullish()
    .transform((value) => value === "on"),
  isNewArrival: z
    .string()
    .nullish()
    .transform((value) => value === "on"),
  isTopSelling: z
    .string()
    .nullish()
    .transform((value) => value === "on"),
  categoryId: z.coerce.number().int().positive({ error: "Select a category." }),
  description: z
    .string()
    .trim()
    .min(16, { error: "Description must be at least 16 characters long." })
    .max(280, { error: "Description must be 280 characters or less." }),
  descriptionAr: z
    .string()
    .trim()
    .max(280, { error: "Arabic description must be 280 characters or less." })
    .optional()
    .transform((value) => value || null),
  imageUrl: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value ?? ""),
  name: z.string().trim().min(3, { error: "Product name must be at least 3 characters long." }),
  nameAr: z
    .string()
    .trim()
    .max(140, { error: "Arabic product name must be 140 characters or less." })
    .optional()
    .transform((value) => value || null),
  regularPriceAed: z
    .string()
    .trim()
    .min(1, { error: "Price is required." })
    .refine((value) => !Number.isNaN(Number(value)), { error: "Price must be numeric." })
    .transform((value) => Number(value))
    .refine((value) => value > 0, { error: "Price must be greater than zero." }),
  salePriceAed: z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "")
    .refine((value) => value === "" || !Number.isNaN(Number(value)), {
      error: "Sale price must be numeric.",
    })
    .transform((value) => (value === "" ? null : Number(value)))
    .refine((value) => value === null || value >= 0, {
      error: "Sale price cannot be negative.",
    }),
});

export const createCategorySchema = z.object({
  bannerImageUrl: z
    .string()
    .trim()
    .nullish()
    .transform((value) => value || null),
  name: z.string().trim().min(2, { error: "Category name must be at least 2 characters long." }),
  nameAr: z
    .string()
    .trim()
    .max(100, { error: "Arabic category name must be 100 characters or less." })
    .optional()
    .transform((value) => value || null),
  parentCategoryId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || (Number.isInteger(value) && value > 0), {
      error: "Choose a valid parent category.",
    }),
  showOnHomepage: z
    .string()
    .nullish()
    .transform((value) => value === "on"),
});

export const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Brand name must be at least 2 characters long." })
    .max(80),
  nameAr: z
    .string()
    .trim()
    .max(80, { error: "Arabic brand name must be 80 characters or less." })
    .optional()
    .transform((value) => value || null),
});

export const catalogRecordIdSchema = z.coerce.number().int().positive();
