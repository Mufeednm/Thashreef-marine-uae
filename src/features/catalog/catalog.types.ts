export interface CreateProductActionState {
  fieldErrors?: {
    brand?: string[];
    categoryId?: string[];
    description?: string[];
    imageUrl?: string[];
    name?: string[];
    regularPriceAed?: string[];
    salePriceAed?: string[];
    sku?: string[];
    stockQuantity?: string[];
  };
  message?: string;
  status: "error" | "idle" | "success";
}

export const initialCreateProductActionState: CreateProductActionState = {
  status: "idle",
};

export interface CreateCategoryActionState {
  fieldErrors?: {
    bannerImageUrl?: string[];
    customFields?: string[];
    displayOrder?: string[];
    isFeatured?: string[];
    name?: string[];
    parentCategoryId?: string[];
    logoText?: string[];
  };
  message?: string;
  status: "error" | "idle" | "success";
}

export const initialCreateCategoryActionState: CreateCategoryActionState = {
  status: "idle",
};
