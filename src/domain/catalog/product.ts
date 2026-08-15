export interface Product {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  sku: string;
  brand: string;
  categoryId: number;
  category: string;
  mainCategory?: string | null;
  mainCategoryId?: number | null;
  description: string;
  descriptionAr: string | null;
  imageUrl: string;
  secondaryImageUrl?: string | null;
  tertiaryImageUrl?: string | null;
  regularPriceAedCents: number;
  salePriceAedCents?: number | null;
  priceAedCents: number;
  hasVariants: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isTopSelling: boolean;
  isBestDeal: boolean;
  isBannerProduct: boolean;
  homepageOrder: number;
  isActive: boolean;
  stockQuantity: number;
  createdAt: string;
  createdByUserId: string;
}

export interface CreateProductInput {
  name: string;
  nameAr?: string | null;
  sku: string;
  brand: string;
  categoryId: number;
  description: string;
  descriptionAr?: string | null;
  imageUrl?: string;
  secondaryImageUrl?: string;
  tertiaryImageUrl?: string;
  regularPriceAedCents: number;
  salePriceAedCents?: number | null;
  stockQuantity: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTopSelling?: boolean;
  isBestDeal?: boolean;
  isBannerProduct?: boolean;
  homepageOrder?: number;
}
