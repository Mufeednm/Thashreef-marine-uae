export interface ProductVariant {
  id: number;
  productId: string;
  productExternalId: number;
  variantName: string;
  skuSuffix: string;
  priceAedCents: number;
  stockQuantity: number;
}
