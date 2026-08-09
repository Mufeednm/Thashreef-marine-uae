import type { DemoUser } from "@/domain/auth/user";
import type { Category, CreateCategoryInput } from "@/domain/catalog/category";
import type { CategoryField } from "@/domain/catalog/category-field";
import type { CreateProductInput, Product } from "@/domain/catalog/product";
import type { ProductVariant } from "@/domain/catalog/product-variant";

export interface PersistedProductInput extends CreateProductInput {
  id: string;
  slug: string;
  createdAt: string;
  createdByUserId: string;
}

export interface PersistedCategoryInput extends CreateCategoryInput {
  slug: string;
}

export interface AdminOverviewMetrics {
  activeCoupons: number;
  customerProfiles: number;
  orderCount: number;
  totalRevenueAedCents: number;
}

export interface AdminRecentOrder {
  id: number;
  customerName: string;
  orderDate: string;
  status: string;
  totalAedCents: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoText: string;
  displayOrder: number;
}

export interface HomepageBanner {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  sortOrder: number;
}

export interface DemoStoreRepository {
  addBrand(input: Omit<Brand, "id">): Promise<Brand>;
  addCategory(input: PersistedCategoryInput): Promise<Category>;
  addCategoryField(input: {
    categoryId: number;
    displayOrder: number;
    fieldKey: string;
    label: string;
  }): Promise<CategoryField>;
  deleteBrand(id: number): Promise<void>;
  deleteCategory(id: number): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  addProduct(input: PersistedProductInput): Promise<Product>;
  findUserByEmail(emailOrUsername: string): Promise<DemoUser | null>;
  findUserById(id: string): Promise<DemoUser | null>;
  getAdminOverviewMetrics(): Promise<AdminOverviewMetrics>;
  listBrands(): Promise<Brand[]>;
  listHomepageBanners(): Promise<HomepageBanner[]>;
  listCategories(): Promise<Category[]>;
  listCategoryFields(): Promise<CategoryField[]>;
  listProducts(): Promise<Product[]>;
  listProductVariants(): Promise<ProductVariant[]>;
  listRecentOrders(limit: number): Promise<AdminRecentOrder[]>;
  updateBrand(id: number, input: Omit<Brand, "id" | "slug">): Promise<Brand | null>;
  updateCategory(
    id: number,
    input: Omit<PersistedCategoryInput, "slug" | "fieldLabels">,
  ): Promise<Category | null>;
  updateProduct(id: string, input: CreateProductInput): Promise<Product | null>;
}
