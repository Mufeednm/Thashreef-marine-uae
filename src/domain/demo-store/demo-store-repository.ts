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

export interface DemoStoreRepository {
  addCategory(input: PersistedCategoryInput): Promise<Category>;
  addCategoryField(input: {
    categoryId: number;
    displayOrder: number;
    fieldKey: string;
    label: string;
  }): Promise<CategoryField>;
  addProduct(input: PersistedProductInput): Promise<Product>;
  findUserByEmail(emailOrUsername: string): Promise<DemoUser | null>;
  findUserById(id: string): Promise<DemoUser | null>;
  getAdminOverviewMetrics(): Promise<AdminOverviewMetrics>;
  listBrands(): Promise<Brand[]>;
  listCategories(): Promise<Category[]>;
  listCategoryFields(): Promise<CategoryField[]>;
  listProducts(): Promise<Product[]>;
  listProductVariants(): Promise<ProductVariant[]>;
  listRecentOrders(limit: number): Promise<AdminRecentOrder[]>;
}
