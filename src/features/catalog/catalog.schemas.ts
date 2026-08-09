import { z } from "zod";

export const createProductSchema = z.object({
  brand: z.string().trim().min(2, { error: "Brand must be at least 2 characters long." }),
  homepageOrder: z.coerce.number().int().min(0).default(0),
  isBannerProduct: z.string().nullish().transform((value) => value === "on"),
  isBestDeal: z.string().nullish().transform((value) => value === "on"),
  isFeatured: z.string().nullish().transform((value) => value === "on"),
  isNewArrival: z.string().nullish().transform((value) => value === "on"),
  isTopSelling: z.string().nullish().transform((value) => value === "on"),
  categoryId: z.coerce.number().int().positive({ error: "Select a category." }),
  description: z
    .string()
    .trim()
    .min(16, { error: "Description must be at least 16 characters long." })
    .max(280, { error: "Description must be 280 characters or less." }),
  imageUrl: z.string().trim().nullish().transform((value) => value ?? ""),
  name: z.string().trim().min(3, { error: "Product name must be at least 3 characters long." }),
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
  sku: z
    .string()
    .trim()
    .min(3, { error: "SKU must be at least 3 characters long." })
    .max(24, { error: "SKU must be 24 characters or less." })
    .regex(/^[A-Za-z0-9-]+$/, {
      error: "SKU can only use letters, numbers, and hyphens.",
    }),
});

export const createCategorySchema = z.object({
  bannerImageUrl: z.string().trim().optional(),
  customFields: z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      (value ?? "")
        .split(/\r?\n|,/)
        .map((field) => field.trim())
        .filter(Boolean)
        .slice(0, 24),
    ),
  displayOrder: z.coerce
    .number()
    .int({ error: "Display order must be a whole number." })
    .min(0, { error: "Display order cannot be negative." }),
  isFeatured: z
    .string()
    .optional()
    .transform((value) => value === "on"),
  homepageOrder: z.coerce.number().int().min(0).default(0),
  showOnHomepage: z.string().optional().transform((value) => value === "on"),
  name: z.string().trim().min(2, { error: "Category name must be at least 2 characters long." }),
  parentCategoryId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || (Number.isInteger(value) && value > 0), {
      error: "Choose a valid parent category.",
    }),
});

export const brandSchema = z.object({
  displayOrder: z.coerce.number().int().min(0, { error: "Display order cannot be negative." }),
  logoText: z.string().trim().min(1, { error: "Logo text is required." }).max(24),
  name: z.string().trim().min(2, { error: "Brand name must be at least 2 characters long." }).max(80),
});

export const catalogRecordIdSchema = z.coerce.number().int().positive();
