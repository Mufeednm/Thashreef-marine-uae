export interface Category {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  bannerImageUrl: string | null;
  isFeatured: boolean;
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
  name: string;
  parentCategoryId?: number | null;
}
