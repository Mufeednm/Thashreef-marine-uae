export interface Category {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  bannerImageUrl: string | null;
  isFeatured: boolean;
  showOnHomepage: boolean;
  homepageOrder: number;
  displayOrder: number;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  depth: number;
}

export interface CreateCategoryInput {
  bannerImageUrl?: string | null;
  displayOrder: number;
  fieldLabels: string[];
  isFeatured: boolean;
  showOnHomepage?: boolean;
  homepageOrder?: number;
  name: string;
  parentCategoryId?: number | null;
}

export type UpdateCategoryInput = Omit<CreateCategoryInput, "fieldLabels">;
