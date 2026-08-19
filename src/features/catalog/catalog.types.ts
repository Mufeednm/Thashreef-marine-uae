export interface CreateProductActionState {
  fieldErrors?: {
    brand?: string[];
    categoryId?: string[];
    description?: string[];
    descriptionAr?: string[];
    imageUrl?: string[];
    imageFile?: string[];
    secondaryImageFile?: string[];
    tertiaryImageFile?: string[];
    name?: string[];
    nameAr?: string[];
    regularPriceAed?: string[];
    salePriceAed?: string[];
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
    imageFile?: string[];
    name?: string[];
    nameAr?: string[];
    parentCategoryId?: string[];
  };
  message?: string;
  status: "error" | "idle" | "success";
}

export const initialCreateCategoryActionState: CreateCategoryActionState = {
  status: "idle",
};
