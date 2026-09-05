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

export interface AdminActivityMetrics {
  customerRegistrations: { today: number; week: number; month: number };
  orders: { today: number; week: number; month: number };
  revenueAedCents: { today: number; week: number; month: number };
}

export interface AdminRecentOrder {
  id: number;
  customerName: string;
  orderDate: string;
  status: string;
  totalAedCents: number;
}

export interface AdminOrder extends AdminRecentOrder {
  customerEmail: string;
  customerPhone: string | null;
  paymentMethod: string;
  paymentStatus: "not_required" | "paid" | "pending" | "failed";
  shippingZone: string;
  paymentReference: string | null;
}

export interface AdminOrderDetail extends AdminOrder {
  deliveryAddress: string | null;
  items: Array<{
    id: number;
    imageUrl: string | null;
    lineTotalAedCents: number;
    name: string;
    quantity: number;
    unitPriceAedCents: number;
  }>;
}

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  dateJoined: string | null;
  status: string;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}

export type EmailOtpPurpose = "login" | "registration";
export type EmailOtpVerificationResult = "expired" | "invalid" | "locked" | "verified";

export interface CreateOrderInput {
  customerEmail: string;
  customerName: string;
  phone: string;
  emirate: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus?: "not_required" | "pending";
  shippingFeeAedCents: number;
  subtotalAedCents: number;
  totalAedCents: number;
  lines: Array<{
    productId: string;
    name: string;
    imageUrl: string;
    quantity: number;
    unitPriceAedCents: number;
  }>;
}

export interface Brand {
  id: number;
  name: string;
  nameAr: string | null;
  slug: string;
  logoText: string;
  imageUrl: string | null;
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
  createCustomer(input: CreateCustomerInput): Promise<DemoUser | null>;
  createEmailOtpChallenge(input: {
    codeHash: string;
    email: string;
    expiresAt: string;
    purpose: EmailOtpPurpose;
  }): Promise<{ id: string; status: "cooldown" | "created" }>;
  deleteEmailOtpChallenge(id: string): Promise<void>;
  verifyEmailOtpChallenge(input: {
    code: string;
    email: string;
    purpose: EmailOtpPurpose;
  }): Promise<EmailOtpVerificationResult>;
  createOrder(input: CreateOrderInput): Promise<AdminRecentOrder>;
  findUserByEmail(emailOrUsername: string): Promise<DemoUser | null>;
  findUserById(id: string): Promise<DemoUser | null>;
  updateUserPassword(id: string, passwordHash: string): Promise<boolean>;
  findCustomerByEmail(email: string): Promise<AdminCustomer | null>;
  findCustomerByPhone(phone: string): Promise<AdminCustomer | null>;
  getAdminOverviewMetrics(): Promise<AdminOverviewMetrics>;
  getAdminActivityMetrics(): Promise<AdminActivityMetrics>;
  listBrands(): Promise<Brand[]>;
  listHomepageBanners(): Promise<HomepageBanner[]>;
  listCategories(): Promise<Category[]>;
  listCustomers(limit: number): Promise<AdminCustomer[]>;
  listCategoryFields(): Promise<CategoryField[]>;
  listCustomerOrderDetails(customerEmail: string, limit: number): Promise<AdminOrderDetail[]>;
  listProducts(): Promise<Product[]>;
  listProductVariants(): Promise<ProductVariant[]>;
  listRecentOrders(limit: number): Promise<AdminRecentOrder[]>;
  listOrders(limit: number): Promise<AdminOrder[]>;
  getOrderDetail(id: number): Promise<AdminOrderDetail | null>;
  attachNgeniusOrderReference(id: number, reference: string): Promise<boolean>;
  findOrderByNgeniusReference(reference: string): Promise<AdminOrderDetail | null>;
  markNgeniusOrderPaid(id: number, reference: string): Promise<boolean>;
  updateOrderStatus(id: number, status: "accepted" | "rejected"): Promise<boolean>;
  updateBrand(id: number, input: Omit<Brand, "id" | "slug">): Promise<Brand | null>;
  updateCategory(
    id: number,
    input: Omit<PersistedCategoryInput, "slug" | "fieldLabels">,
  ): Promise<Category | null>;
  updateProduct(id: string, input: CreateProductInput): Promise<Product | null>;
  updateProductVisibility(id: string, isActive: boolean): Promise<Product | null>;
}
