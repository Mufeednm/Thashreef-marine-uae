export interface CreateProductActionState {
  fieldErrors?: {
    brand?: string[];
    categoryId?: string[];
    description?: string[];
    descriptionAr?: string[];
    imageUrl?: string[];
    imageFile?: string[];
    name?: string[];
    nameAr?: string[];
    regularPriceAed?: string[];
    salePriceAed?: string[];
    sku?: string[];
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
    nameAr?: string[];
    parentCategoryId?: string[];
    logoText?: string[];
  };
  message?: string;
  status: "error" | "idle" | "success";
}

export const initialCreateCategoryActionState: CreateCategoryActionState = {
  status: "idle",
};
