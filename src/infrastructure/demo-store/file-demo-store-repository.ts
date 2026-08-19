import "server-only";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { QueryTypes, type Transaction } from "sequelize";
import { z } from "zod";
import type { DemoUser } from "@/domain/auth/user";
import type { Category } from "@/domain/catalog/category";
import type { CategoryField } from "@/domain/catalog/category-field";
import type { CreateProductInput, Product } from "@/domain/catalog/product";
import type { ProductVariant } from "@/domain/catalog/product-variant";
import type {
  AdminOverviewMetrics,
  AdminOrder,
  AdminActivityMetrics,
  AdminCustomer,
  AdminRecentOrder,
  Brand,
  CreateCustomerInput,
  CreateOrderInput,
  DemoStoreRepository,
  HomepageBanner,
  PersistedCategoryInput,
  PersistedProductInput,
} from "@/domain/demo-store/demo-store-repository";
import { getDatabaseConnection } from "@/infrastructure/database/sequelize";
import { initializeMySqlSchema } from "@/infrastructure/database/mysql-schema";
import { getServerEnvironment } from "@/config/env";
import { hashPassword } from "@/shared/security/password-hash";
import {
  marineBrands,
  marineCatalogSeedVersion,
  marineCategories,
  marineProducts,
} from "@/infrastructure/demo-store/marine-catalog-seed";

const authSeedPath = path.join(process.cwd(), "data", "demo-store.json");

const demoUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  username: z.string().trim().min(3),
  email: z.string().email(),
  password: z.string().min(3),
  role: z.enum(["admin", "staff", "customer"]),
});

const authSeedSchema = z.object({
  users: z.array(demoUserSchema),
});

type AuthSeed = z.infer<typeof authSeedSchema>;

let initialization: Promise<void> | undefined;

export function createDemoStoreRepository(): DemoStoreRepository {
  return new SqliteDemoStoreRepository();
}

class SqliteDemoStoreRepository implements DemoStoreRepository {
  async addBrand(input: Omit<Brand, "id">): Promise<Brand> {
    await ensureDatabase();
    const database = getDatabaseConnection();
    await database.query(
      `INSERT INTO brands (name, name_ar, slug, logo_text, image_url, display_order)
       VALUES (:name, :nameAr, :slug, :logoText, :imageUrl, :displayOrder)`,
      {
        replacements: {
          ...input,
          name: input.name.trim(),
          nameAr: input.nameAr?.trim() || null,
          logoText: input.logoText.trim(),
          imageUrl: input.imageUrl?.trim() || null,
        },
      },
    );
    const [brand] = await database.query<Brand>(
      `SELECT id, name, name_ar AS nameAr, slug, logo_text AS logoText, image_url AS imageUrl, display_order AS displayOrder
       FROM brands WHERE slug = :slug LIMIT 1`,
      { replacements: { slug: input.slug }, type: QueryTypes.SELECT },
    );
    if (!brand) throw new Error("Brand was not created.");
    return brand;
  }

  async addProduct(input: PersistedProductInput): Promise<Product> {
    await ensureDatabase();

    const category = await getDatabaseConnection().query<{
      id: number;
      name: string;
      mainCategoryId: number | null;
    }>(
      `SELECT child.id, child.name, parent.id AS mainCategoryId
       FROM categories child
       INNER JOIN categories parent ON parent.id = child.parent_category_id
       WHERE child.id = :id AND parent.parent_category_id IS NULL
       LIMIT 1`,
      { replacements: { id: input.categoryId }, type: QueryTypes.SELECT },
    );

    if (!category[0]) {
      throw new Error(`Unknown category id: ${input.categoryId}`);
    }
    if (!category[0]) {
      throw new Error("Products must be assigned to a subcategory.");
    }

    const effectivePrice = input.salePriceAedCents ?? input.regularPriceAedCents;
    const product: Product = {
      brand: input.brand.trim(),
      category: category[0].name,
      categoryId: input.categoryId,
      createdAt: input.createdAt,
      createdByUserId: input.createdByUserId,
      description: input.description.trim(),
      descriptionAr: input.descriptionAr?.trim() || null,
      hasVariants: false,
      homepageOrder: input.homepageOrder ?? 0,
      id: input.id,
      imageUrl: input.imageUrl?.trim() || resolveProductImageUrl(category[0].name, input.name),
      isActive: true,
      isFeatured: input.isFeatured ?? false,
      isNewArrival: input.isNewArrival ?? true,
      isTopSelling: input.isTopSelling ?? false,
      isBestDeal: input.isBestDeal ?? false,
      isBannerProduct: input.isBannerProduct ?? false,
      name: input.name.trim(),
      nameAr: input.nameAr?.trim() || null,
      priceAedCents: effectivePrice,
      regularPriceAedCents: input.regularPriceAedCents,
      salePriceAedCents: input.salePriceAedCents ?? null,
      secondaryImageUrl: input.secondaryImageUrl?.trim() || null,
      tertiaryImageUrl: input.tertiaryImageUrl?.trim() || null,
      sku: input.sku.trim().toUpperCase(),
      slug: input.slug,
      stockQuantity: input.stockQuantity,
    };

    await getDatabaseConnection().query(
      `INSERT INTO products (
         id, external_id, name, name_ar, slug, sku, brand, category, category_id, description, description_ar,
         image_url, secondary_image_url, tertiary_image_url, regular_price_aed_cents, sale_price_aed_cents,
         price_aed_cents, has_variants, is_featured, is_new_arrival, is_top_selling, is_best_deal, is_banner_product, homepage_order, is_active, stock_quantity, created_at, created_by_user_id
       ) VALUES (
         :id, NULL, :name, :nameAr, :slug, :sku, :brand, :category, :categoryId, :description, :descriptionAr,
         :imageUrl, :secondaryImageUrl, :tertiaryImageUrl, :regularPriceAedCents, :salePriceAedCents,
         :priceAedCents, :hasVariants, :isFeatured, :isNewArrival, :isTopSelling, :isBestDeal, :isBannerProduct, :homepageOrder, :isActive, :stockQuantity, :createdAt, :createdByUserId
       )`,
      {
        replacements: {
          ...product,
          hasVariants: product.hasVariants ? 1 : 0,
          isActive: product.isActive ? 1 : 0,
          isFeatured: product.isFeatured ? 1 : 0,
          isNewArrival: product.isNewArrival ? 1 : 0,
          isTopSelling: product.isTopSelling ? 1 : 0,
          isBestDeal: product.isBestDeal ? 1 : 0,
          isBannerProduct: product.isBannerProduct ? 1 : 0,
        },
      },
    );

    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await ensureDatabase();
    await getDatabaseConnection().query("DELETE FROM products WHERE id = :id", {
      replacements: { id },
    });
  }

  async updateProduct(id: string, input: CreateProductInput): Promise<Product | null> {
    await ensureDatabase();
    const database = getDatabaseConnection();
    const [category] = await database.query<{ name: string }>(
      `SELECT child.name FROM categories child
       INNER JOIN categories parent ON parent.id = child.parent_category_id
       WHERE child.id = :id AND parent.parent_category_id IS NULL
       LIMIT 1`,
      { replacements: { id: input.categoryId }, type: QueryTypes.SELECT },
    );
    if (!category) return null;

    await database.query(
      `UPDATE products SET
        name = :name, name_ar = :nameAr, sku = :sku, brand = :brand, category = :category, category_id = :categoryId,
        description = :description, description_ar = :descriptionAr, image_url = COALESCE(NULLIF(:imageUrl, ''), image_url),
        secondary_image_url = COALESCE(NULLIF(:secondaryImageUrl, ''), secondary_image_url),
        tertiary_image_url = COALESCE(NULLIF(:tertiaryImageUrl, ''), tertiary_image_url),
        regular_price_aed_cents = :regularPriceAedCents, sale_price_aed_cents = :salePriceAedCents,
        price_aed_cents = :priceAedCents, is_featured = :isFeatured, is_new_arrival = :isNewArrival,
        is_top_selling = :isTopSelling, is_best_deal = :isBestDeal, is_banner_product = :isBannerProduct,
        homepage_order = :homepageOrder
       WHERE id = :id`,
      {
        replacements: {
          id,
          name: input.name.trim(),
          nameAr: input.nameAr?.trim() || null,
          sku: input.sku.trim().toUpperCase(),
          brand: input.brand.trim(),
          category: category.name,
          categoryId: input.categoryId,
          description: input.description.trim(),
          descriptionAr: input.descriptionAr?.trim() || null,
          imageUrl: input.imageUrl?.trim() ?? "",
          secondaryImageUrl: input.secondaryImageUrl?.trim() ?? "",
          tertiaryImageUrl: input.tertiaryImageUrl?.trim() ?? "",
          regularPriceAedCents: input.regularPriceAedCents,
          salePriceAedCents: input.salePriceAedCents ?? null,
          priceAedCents: input.salePriceAedCents ?? input.regularPriceAedCents,
          isFeatured: input.isFeatured ? 1 : 0,
          isNewArrival: input.isNewArrival ? 1 : 0,
          isTopSelling: input.isTopSelling ? 1 : 0,
          isBestDeal: input.isBestDeal ? 1 : 0,
          isBannerProduct: input.isBannerProduct ? 1 : 0,
          homepageOrder: input.homepageOrder ?? 0,
        },
      },
    );
    return (await this.listProducts()).find((product) => product.id === id) ?? null;
  }

  async addCategory(input: {
    bannerImageUrl?: string | null;
    displayOrder: number;
    fieldLabels: string[];
    isFeatured: boolean;
    showOnHomepage?: boolean;
    homepageOrder?: number;
    name: string;
    nameAr?: string | null;
    parentCategoryId?: number | null;
    slug: string;
  }): Promise<Category> {
    await ensureDatabase();

    await getDatabaseConnection().query(
      `INSERT INTO categories (
         name, name_ar, slug, parent_category_id, banner_image_url, is_featured, show_on_homepage, homepage_order, display_order
       ) VALUES (
         :name, :nameAr, :slug, :parentCategoryId, :bannerImageUrl, :isFeatured, :showOnHomepage, :homepageOrder, :displayOrder
       )`,
      {
        replacements: {
          bannerImageUrl: input.bannerImageUrl?.trim() || null,
          displayOrder: input.displayOrder,
          isFeatured: input.isFeatured ? 1 : 0,
          showOnHomepage: (input.showOnHomepage ?? input.isFeatured) ? 1 : 0,
          homepageOrder: input.homepageOrder ?? input.displayOrder,
          name: input.name.trim(),
          nameAr: input.nameAr?.trim() || null,
          parentCategoryId: input.parentCategoryId ?? null,
          slug: input.slug,
        },
      },
    );

    const [created] = await getDatabaseConnection().query<Category>(
      `SELECT
         id,
         name,
         name_ar AS nameAr,
         slug,
         parent_category_id AS parentCategoryId,
         banner_image_url AS bannerImageUrl,
         is_featured AS isFeatured,
         show_on_homepage AS showOnHomepage,
         homepage_order AS homepageOrder,
         display_order AS displayOrder
       FROM categories
       WHERE slug = :slug
       LIMIT 1`,
      { replacements: { slug: input.slug }, type: QueryTypes.SELECT },
    );

    if (!created) {
      throw new Error("Category was not created.");
    }

    return {
      ...created,
      isFeatured: Boolean(created.isFeatured),
      showOnHomepage: Boolean(created.showOnHomepage),
    };
  }

  async deleteBrand(id: number): Promise<void> {
    await ensureDatabase();
    await getDatabaseConnection().query("DELETE FROM brands WHERE id = :id", {
      replacements: { id },
    });
  }

  async deleteCategory(id: number): Promise<void> {
    await ensureDatabase();
    const database = getDatabaseConnection();
    await database.query("DELETE FROM category_fields WHERE category_id = :id", {
      replacements: { id },
    });
    await database.query("DELETE FROM categories WHERE id = :id", { replacements: { id } });
  }

  async updateBrand(id: number, input: Omit<Brand, "id" | "slug">): Promise<Brand | null> {
    await ensureDatabase();
    const database = getDatabaseConnection();
    const [existing] = await database.query<Brand>(
      "SELECT id, name, name_ar AS nameAr, slug, logo_text AS logoText, image_url AS imageUrl, display_order AS displayOrder FROM brands WHERE id = :id LIMIT 1",
      { replacements: { id }, type: QueryTypes.SELECT },
    );
    if (!existing) return null;
    await database.query(
      `UPDATE brands SET name = :name, name_ar = :nameAr, logo_text = :logoText, image_url = COALESCE(NULLIF(:imageUrl, ''), image_url), display_order = :displayOrder WHERE id = :id`,
      {
        replacements: {
          id,
          name: input.name.trim(),
          nameAr: input.nameAr?.trim() || null,
          logoText: input.logoText.trim(),
          imageUrl: input.imageUrl?.trim() ?? "",
          displayOrder: input.displayOrder,
        },
      },
    );
    if (existing.name !== input.name.trim()) {
      await database.query("UPDATE products SET brand = :name WHERE brand = :previousName", {
        replacements: { name: input.name.trim(), previousName: existing.name },
      });
    }
    return {
      ...existing,
      name: input.name.trim(),
      nameAr: input.nameAr?.trim() || null,
      logoText: input.logoText.trim(),
      imageUrl: input.imageUrl?.trim() || existing.imageUrl,
      displayOrder: input.displayOrder,
    };
  }

  async updateCategory(
    id: number,
    input: Omit<PersistedCategoryInput, "slug" | "fieldLabels">,
  ): Promise<Category | null> {
    await ensureDatabase();
    const database = getDatabaseConnection();
    const [existing] = await database.query<Category>(
      "SELECT id FROM categories WHERE id = :id LIMIT 1",
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      },
    );
    if (!existing) return null;
    await database.query(
      `UPDATE categories SET name = :name, name_ar = :nameAr, parent_category_id = :parentCategoryId,
       banner_image_url = :bannerImageUrl, is_featured = :isFeatured,
       show_on_homepage = :showOnHomepage, homepage_order = :homepageOrder,
       display_order = :displayOrder WHERE id = :id`,
      {
        replacements: {
          id,
          name: input.name.trim(),
          nameAr: input.nameAr?.trim() || null,
          parentCategoryId: input.parentCategoryId ?? null,
          bannerImageUrl: input.bannerImageUrl?.trim() || null,
          isFeatured: input.isFeatured ? 1 : 0,
          showOnHomepage: input.showOnHomepage ? 1 : 0,
          homepageOrder: input.homepageOrder ?? 0,
          displayOrder: input.displayOrder,
        },
      },
    );
    const rows = await this.listCategories();
    return rows.find((category) => category.id === id) ?? null;
  }

  async addCategoryField(input: {
    categoryId: number;
    displayOrder: number;
    fieldKey: string;
    label: string;
  }): Promise<CategoryField> {
    await ensureDatabase();

    await getDatabaseConnection().query(
      `INSERT INTO category_fields (
         category_id, label, field_key, input_type, is_required, display_order
       ) VALUES (
         :categoryId, :label, :fieldKey, 'text', 0, :displayOrder
       )
       ON DUPLICATE KEY UPDATE
         label = VALUES(label),
         display_order = VALUES(display_order)`,
      { replacements: input },
    );

    const [created] = await getDatabaseConnection().query<CategoryField>(
      `SELECT
         id,
         category_id AS categoryId,
         label,
         field_key AS fieldKey,
         input_type AS inputType,
         is_required AS isRequired,
         display_order AS displayOrder
       FROM category_fields
       WHERE category_id = :categoryId AND field_key = :fieldKey
       LIMIT 1`,
      {
        replacements: { categoryId: input.categoryId, fieldKey: input.fieldKey },
        type: QueryTypes.SELECT,
      },
    );

    if (!created) {
      throw new Error("Category field was not created.");
    }

    return {
      ...created,
      isRequired: Boolean(created.isRequired),
    };
  }

  async findUserByEmail(emailOrUsername: string): Promise<DemoUser | null> {
    await ensureDatabase();
    const users = await getDatabaseConnection().query<DemoUser>(
      `SELECT id, name, username, email, password, role
       FROM users
       WHERE lower(email) = lower(:identifier) OR lower(username) = lower(:identifier)
       LIMIT 1`,
      { replacements: { identifier: emailOrUsername }, type: QueryTypes.SELECT },
    );

    return users[0] ?? null;
  }

  async createCustomer(input: CreateCustomerInput): Promise<DemoUser | null> {
    await ensureDatabase();
    const database = getDatabaseConnection();
    const id = randomUUID();
    const username = `customer-${id.slice(0, 8)}`;
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    try {
      return await database.transaction(async (transaction: Transaction) => {
        const [existing] = await database.query<{ id: string }>(
          "SELECT id FROM users WHERE lower(email) = lower(:email) LIMIT 1",
          { replacements: { email }, transaction, type: QueryTypes.SELECT },
        );
        if (existing) return null;
        const [existingPhone] = await database.query<{ id: number }>(
          "SELECT id FROM customer_profiles WHERE phone = :phone LIMIT 1",
          { replacements: { phone: input.phone.trim() }, transaction, type: QueryTypes.SELECT },
        );
        if (existingPhone) return null;

        await database.query(
          `INSERT INTO users (id, name, username, email, password, role)
           VALUES (:id, :name, :username, :email, :password, 'customer')`,
          { replacements: { id, name, username, email, password: input.password }, transaction },
        );
        await database.query(
          `INSERT INTO customer_profiles (name, email, phone, role, date_joined, status)
           VALUES (:name, :email, :phone, 'customer', :dateJoined, 'active')`,
          {
            replacements: {
              name,
              email,
              phone: input.phone.trim(),
              dateJoined: new Date().toISOString(),
            },
            transaction,
          },
        );
        return { id, name, username, email, password: input.password, role: "customer" };
      });
    } catch (error) {
      if (isDuplicateEntryError(error)) return null;
      throw error;
    }
  }

  async createOrder(input: CreateOrderInput): Promise<AdminRecentOrder> {
    await ensureDatabase();
    const database = getDatabaseConnection();
    const email = input.customerEmail.trim().toLowerCase();
    let [customer] = await database.query<{ id: number }>(
      "SELECT id FROM customer_profiles WHERE lower(email) = :email ORDER BY id DESC LIMIT 1",
      { replacements: { email }, type: QueryTypes.SELECT },
    );
    if (!customer) {
      await database.query(
        `INSERT INTO customer_profiles (name, email, phone, role, date_joined, status)
         VALUES (:name, :email, :phone, 'customer', :dateJoined, 'active')`,
        {
          replacements: {
            dateJoined: new Date().toISOString(),
            email,
            name: input.customerName,
            phone: input.phone,
          },
        },
      );
      [customer] = await database.query<{ id: number }>(
        "SELECT id FROM customer_profiles WHERE lower(email) = :email ORDER BY id DESC LIMIT 1",
        { replacements: { email }, type: QueryTypes.SELECT },
      );
    }
    if (!customer) throw new Error("Customer profile was not created.");
    const orderDate = new Date().toISOString();
    await database.query(
      `INSERT INTO orders (customer_profile_id, order_date, status, shipping_zone, currency, subtotal_aed_cents, shipping_fee_aed_cents, total_aed_cents, payment_method, delivery_address)
       VALUES (:customerProfileId, :orderDate, 'new', :shippingZone, 'AED', :subtotal, :shipping, :total, :paymentMethod, :deliveryAddress)`,
      {
        replacements: {
          customerProfileId: customer.id,
          deliveryAddress: input.deliveryAddress,
          orderDate,
          paymentMethod: input.paymentMethod,
          shipping: input.shippingFeeAedCents,
          shippingZone: input.emirate,
          subtotal: input.subtotalAedCents,
          total: input.totalAedCents,
        },
      },
    );
    const [createdOrder] = await database.query<{ id: number }>(
      "SELECT id FROM orders WHERE customer_profile_id = :customerProfileId ORDER BY id DESC LIMIT 1",
      { replacements: { customerProfileId: customer.id }, type: QueryTypes.SELECT },
    );
    if (!createdOrder) throw new Error("Order was not created.");
    for (const line of input.lines) {
      await database.query(
        `INSERT INTO order_items (order_id, variant_or_product_id, product_name, quantity, unit_price_aed_cents, line_total_aed_cents)
         VALUES (:orderId, 0, :name, :quantity, :price, :lineTotal)`,
        {
          replacements: {
            lineTotal: line.unitPriceAedCents * line.quantity,
            name: line.name,
            orderId: createdOrder.id,
            price: line.unitPriceAedCents,
            quantity: line.quantity,
          },
        },
      );
    }
    return {
      id: createdOrder.id,
      customerName: input.customerName,
      orderDate,
      status: "new",
      totalAedCents: input.totalAedCents,
    };
  }

  async findUserById(id: string): Promise<DemoUser | null> {
    await ensureDatabase();
    const users = await getDatabaseConnection().query<DemoUser>(
      "SELECT id, name, username, email, password, role FROM users WHERE id = :id LIMIT 1",
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    return users[0] ?? null;
  }

  async findCustomerByEmail(email: string): Promise<AdminCustomer | null> {
    await ensureDatabase();
    const customers = await getDatabaseConnection().query<AdminCustomer>(
      `SELECT id, name, email, phone, date_joined AS dateJoined, status
       FROM customer_profiles WHERE lower(email) = lower(:email) ORDER BY id DESC LIMIT 1`,
      { replacements: { email }, type: QueryTypes.SELECT },
    );
    return customers[0] ?? null;
  }

  async findCustomerByPhone(phone: string): Promise<AdminCustomer | null> {
    await ensureDatabase();
    const customers = await getDatabaseConnection().query<AdminCustomer>(
      `SELECT id, name, email, phone, date_joined AS dateJoined, status
       FROM customer_profiles WHERE phone = :phone ORDER BY id DESC LIMIT 1`,
      { replacements: { phone }, type: QueryTypes.SELECT },
    );
    return customers[0] ?? null;
  }

  async getAdminOverviewMetrics(): Promise<AdminOverviewMetrics> {
    await ensureDatabase();

    const [orders] = await getDatabaseConnection().query<{
      orderCount: number;
      totalRevenueAedCents: number;
    }>(
      `SELECT COUNT(*) AS orderCount, COALESCE(SUM(total_aed_cents), 0) AS totalRevenueAedCents
       FROM orders`,
      { type: QueryTypes.SELECT },
    );
    const [customers] = await getDatabaseConnection().query<{ customerProfiles: number }>(
      "SELECT COUNT(*) AS customerProfiles FROM customer_profiles",
      { type: QueryTypes.SELECT },
    );
    const [coupons] = await getDatabaseConnection().query<{ activeCoupons: number }>(
      "SELECT COUNT(*) AS activeCoupons FROM coupons WHERE lower(status) = 'active'",
      { type: QueryTypes.SELECT },
    );

    return {
      activeCoupons: Number(coupons?.activeCoupons ?? 0),
      customerProfiles: Number(customers?.customerProfiles ?? 0),
      orderCount: Number(orders?.orderCount ?? 0),
      totalRevenueAedCents: Number(orders?.totalRevenueAedCents ?? 0),
    };
  }

  async listBrands(): Promise<Brand[]> {
    await ensureDatabase();

    return getDatabaseConnection().query<Brand>(
      `SELECT
         id,
         name,
         name_ar AS nameAr,
         slug,
         logo_text AS logoText, image_url AS imageUrl,
         display_order AS displayOrder
       FROM brands
       ORDER BY display_order, name`,
      { type: QueryTypes.SELECT },
    );
  }

  async listHomepageBanners(): Promise<HomepageBanner[]> {
    await ensureDatabase();
    return getDatabaseConnection()
      .query<HomepageBanner>(
        `SELECT id, image_url AS imageUrl, title, subtitle, button_text AS buttonText,
       button_link AS buttonLink, is_active AS isActive, sort_order AS sortOrder
       FROM homepage_banners WHERE is_active = 1 ORDER BY sort_order, id`,
        { type: QueryTypes.SELECT },
      )
      .then((rows) => rows.map((row) => ({ ...row, isActive: Boolean(row.isActive) })));
  }

  async listCategories(): Promise<Category[]> {
    await ensureDatabase();

    return getDatabaseConnection()
      .query<Category>(
        `SELECT
         id,
         name,
         name_ar AS nameAr,
         slug,
         parent_category_id AS parentCategoryId,
         banner_image_url AS bannerImageUrl,
         is_featured AS isFeatured,
         show_on_homepage AS showOnHomepage,
         homepage_order AS homepageOrder,
         display_order AS displayOrder
       FROM categories
       ORDER BY parent_category_id IS NOT NULL, display_order, name`,
        { type: QueryTypes.SELECT },
      )
      .then((rows) =>
        rows.map((row) => ({
          ...row,
          isFeatured: Boolean(row.isFeatured),
          showOnHomepage: Boolean(row.showOnHomepage),
        })),
      );
  }

  async getAdminActivityMetrics(): Promise<AdminActivityMetrics> {
    await ensureDatabase();
    const database = getDatabaseConnection();
    const [customers] = await database.query<{ today: number; week: number; month: number }>(
      `SELECT
         SUM(CASE WHEN DATE(date_joined) = CURDATE() THEN 1 ELSE 0 END) AS today,
         SUM(CASE WHEN DATE(date_joined) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) THEN 1 ELSE 0 END) AS week,
         SUM(CASE WHEN DATE(date_joined) >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS month
       FROM customer_profiles`,
      { type: QueryTypes.SELECT },
    );
    const [orders] = await database.query<{
      today: number;
      week: number;
      month: number;
      todayRevenue: number;
      weekRevenue: number;
      monthRevenue: number;
    }>(
      `SELECT
         SUM(CASE WHEN DATE(order_date) = CURDATE() THEN 1 ELSE 0 END) AS today,
         SUM(CASE WHEN DATE(order_date) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) THEN 1 ELSE 0 END) AS week,
         SUM(CASE WHEN DATE(order_date) >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN 1 ELSE 0 END) AS month,
         SUM(CASE WHEN DATE(order_date) = CURDATE() THEN total_aed_cents ELSE 0 END) AS todayRevenue,
         SUM(CASE WHEN DATE(order_date) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) THEN total_aed_cents ELSE 0 END) AS weekRevenue,
         SUM(CASE WHEN DATE(order_date) >= DATE_FORMAT(CURDATE(), '%Y-%m-01') THEN total_aed_cents ELSE 0 END) AS monthRevenue
       FROM orders`,
      { type: QueryTypes.SELECT },
    );
    return {
      customerRegistrations: {
        month: Number(customers?.month ?? 0),
        today: Number(customers?.today ?? 0),
        week: Number(customers?.week ?? 0),
      },
      orders: {
        month: Number(orders?.month ?? 0),
        today: Number(orders?.today ?? 0),
        week: Number(orders?.week ?? 0),
      },
      revenueAedCents: {
        month: Number(orders?.monthRevenue ?? 0),
        today: Number(orders?.todayRevenue ?? 0),
        week: Number(orders?.weekRevenue ?? 0),
      },
    };
  }

  async listCustomers(limit: number): Promise<AdminCustomer[]> {
    await ensureDatabase();
    return getDatabaseConnection().query<AdminCustomer>(
      `SELECT id, name, email, phone, date_joined AS dateJoined, status
       FROM customer_profiles ORDER BY date_joined DESC, id DESC LIMIT :limit`,
      { replacements: { limit }, type: QueryTypes.SELECT },
    );
  }

  async listCategoryFields(): Promise<CategoryField[]> {
    await ensureDatabase();

    return getDatabaseConnection()
      .query<CategoryField>(
        `SELECT
         id,
         category_id AS categoryId,
         label,
         field_key AS fieldKey,
         input_type AS inputType,
         is_required AS isRequired,
         display_order AS displayOrder
       FROM category_fields
       ORDER BY category_id, display_order, label`,
        { type: QueryTypes.SELECT },
      )
      .then((rows) =>
        rows.map((row) => ({
          ...row,
          isRequired: Boolean(row.isRequired),
        })),
      );
  }

  async listProducts(): Promise<Product[]> {
    await ensureDatabase();

    return getDatabaseConnection()
      .query<Product>(
        `SELECT
         p.id,
         p.name,
         p.name_ar AS nameAr,
         p.slug,
         p.sku,
         p.brand,
         p.category_id AS categoryId,
         COALESCE(c.name, p.category) AS category,
         COALESCE(gc.id, pc.id, c.id) AS mainCategoryId,
         COALESCE(gc.name, pc.name, c.name, p.category) AS mainCategory,
         p.description,
         p.description_ar AS descriptionAr,
         p.image_url AS imageUrl,
         p.secondary_image_url AS secondaryImageUrl,
         p.tertiary_image_url AS tertiaryImageUrl,
         p.regular_price_aed_cents AS regularPriceAedCents,
         p.sale_price_aed_cents AS salePriceAedCents,
         p.price_aed_cents AS priceAedCents,
         p.has_variants AS hasVariants,
         p.is_featured AS isFeatured,
         p.is_new_arrival AS isNewArrival,
         p.is_top_selling AS isTopSelling,
         p.is_best_deal AS isBestDeal,
         p.is_banner_product AS isBannerProduct,
         p.homepage_order AS homepageOrder,
         p.is_active AS isActive,
         p.stock_quantity AS stockQuantity,
         p.created_at AS createdAt,
         p.created_by_user_id AS createdByUserId
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN categories pc ON pc.id = c.parent_category_id
       LEFT JOIN categories gc ON gc.id = pc.parent_category_id`,
        { type: QueryTypes.SELECT },
      )
      .then((rows) =>
        rows.map((row) => ({
          ...row,
          hasVariants: Boolean(row.hasVariants),
          isActive: Boolean(row.isActive),
          isFeatured: Boolean(row.isFeatured),
          isNewArrival: Boolean(row.isNewArrival),
          isTopSelling: Boolean(row.isTopSelling),
          isBestDeal: Boolean(row.isBestDeal),
          isBannerProduct: Boolean(row.isBannerProduct),
        })),
      );
  }

  async listProductVariants(): Promise<ProductVariant[]> {
    await ensureDatabase();

    return getDatabaseConnection().query<ProductVariant>(
      `SELECT
         id,
         product_id AS productId,
         product_external_id AS productExternalId,
         variant_name AS variantName,
         sku_suffix AS skuSuffix,
         price_aed_cents AS priceAedCents,
         stock_quantity AS stockQuantity
       FROM product_variants
       ORDER BY product_external_id, id`,
      { type: QueryTypes.SELECT },
    );
  }

  async listRecentOrders(limit: number): Promise<AdminRecentOrder[]> {
    await ensureDatabase();

    return getDatabaseConnection().query<AdminRecentOrder>(
      `SELECT
         o.id,
         COALESCE(cp.name, 'Guest customer') AS customerName,
         o.order_date AS orderDate,
         o.status,
         o.total_aed_cents AS totalAedCents
       FROM orders o
       LEFT JOIN customer_profiles cp ON cp.id = o.customer_profile_id
       ORDER BY o.order_date DESC, o.id DESC
       LIMIT :limit`,
      { replacements: { limit }, type: QueryTypes.SELECT },
    );
  }

  async listOrders(limit: number): Promise<AdminOrder[]> {
    await ensureDatabase();
    return getDatabaseConnection().query<AdminOrder>(
      `SELECT o.id, COALESCE(cp.name, 'Guest customer') AS customerName, COALESCE(cp.email, '') AS customerEmail,
        o.order_date AS orderDate, o.status, o.total_aed_cents AS totalAedCents, o.payment_method AS paymentMethod,
        o.shipping_zone AS shippingZone, cp.phone AS customerPhone
       FROM orders o LEFT JOIN customer_profiles cp ON cp.id = o.customer_profile_id
       ORDER BY o.order_date DESC, o.id DESC LIMIT :limit`,
      { replacements: { limit }, type: QueryTypes.SELECT },
    );
  }

  async updateOrderStatus(id: number, status: "accepted" | "rejected"): Promise<void> {
    await ensureDatabase();
    await getDatabaseConnection().query("UPDATE orders SET status = :status WHERE id = :id", {
      replacements: { id, status },
    });
  }

  async getOrderDetail(
    id: number,
  ): Promise<import("@/domain/demo-store/demo-store-repository").AdminOrderDetail | null> {
    await ensureDatabase();
    const database = getDatabaseConnection();
    const [order] = await database.query<
      import("@/domain/demo-store/demo-store-repository").AdminOrderDetail
    >(
      `SELECT o.id, COALESCE(cp.name, 'Guest customer') AS customerName, COALESCE(cp.email, '') AS customerEmail,
        cp.phone AS customerPhone, o.order_date AS orderDate, o.status, o.total_aed_cents AS totalAedCents,
        o.payment_method AS paymentMethod, o.shipping_zone AS shippingZone, o.delivery_address AS deliveryAddress
       FROM orders o LEFT JOIN customer_profiles cp ON cp.id = o.customer_profile_id WHERE o.id = :id LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );
    if (!order) return null;
    const items = await database.query<
      import("@/domain/demo-store/demo-store-repository").AdminOrderDetail["items"][number]
    >(
      `SELECT id, product_name AS name, quantity, unit_price_aed_cents AS unitPriceAedCents,
        line_total_aed_cents AS lineTotalAedCents FROM order_items WHERE order_id = :id ORDER BY id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );
    return { ...order, items };
  }
}

async function ensureDatabase(): Promise<void> {
  initialization ??= initializeDatabase();
  return initialization;
}

async function initializeDatabase(): Promise<void> {
  const database = getDatabaseConnection();
  await initializeMySqlSchema(database);
  await normalizeCategoryHierarchy(database);
  if (getServerEnvironment().SEED_DEMO_DATA) {
    await seedHomepageBanners();
    await syncAuthUsers();
    await syncMarineCatalogSeed();
  }
}

async function normalizeCategoryHierarchy(
  database: ReturnType<typeof getDatabaseConnection>,
): Promise<void> {
  await database.query(
    `UPDATE categories child
     INNER JOIN categories parent ON parent.id = child.parent_category_id
     INNER JOIN categories main ON main.id = parent.parent_category_id
     SET child.parent_category_id = main.id
     WHERE main.parent_category_id IS NULL`,
  );
}

async function seedHomepageBanners(): Promise<void> {
  const database = getDatabaseConnection();
  const [existing] = await database.query<{ count: number }>(
    "SELECT COUNT(*) AS count FROM homepage_banners",
    { type: QueryTypes.SELECT },
  );
  if (Number(existing?.count ?? 0) > 0) return;
  const banners = [
    [
      "/product-images/marine-essential.svg",
      "Ready for every mile at sea",
      "Marine parts, trusted brands, UAE delivery.",
      "Shop essentials",
      "#catalog",
      1,
    ],
    [
      "/product-images/life-jacket.svg",
      "Safety is never optional",
      "Professional life-saving equipment for every vessel.",
      "Explore safety",
      "#catalog",
      2,
    ],
    [
      "/product-images/battery.svg",
      "Power your next voyage",
      "Reliable electrical systems and onboard charging.",
      "Shop electrical",
      "#catalog",
      3,
    ],
  ] as const;
  for (const [imageUrl, title, subtitle, buttonText, buttonLink, sortOrder] of banners) {
    await database.query(
      `INSERT INTO homepage_banners (image_url, title, subtitle, button_text, button_link, sort_order)
       VALUES (:imageUrl, :title, :subtitle, :buttonText, :buttonLink, :sortOrder)`,
      { replacements: { imageUrl, title, subtitle, buttonText, buttonLink, sortOrder } },
    );
  }
}

async function syncAuthUsers(): Promise<void> {
  const database = getDatabaseConnection();
  const seed = await readAuthSeed();

  for (const user of seed.users) {
    await database.query(
      `INSERT INTO users (id, name, username, email, password, role)
       VALUES (:id, :name, :username, :email, :password, :role)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), username = VALUES(username), email = VALUES(email),
         password = VALUES(password), role = VALUES(role)`,
      { replacements: { ...user, password: hashPassword(user.password) } },
    );
  }
}

function isDuplicateEntryError(error: unknown): boolean {
  return error instanceof Error && /duplicate entry|unique constraint/i.test(error.message);
}

async function syncMarineCatalogSeed(): Promise<void> {
  const database = getDatabaseConnection();

  const [currentVersion, catalogCounts] = await Promise.all([
    database.query<{ value: string }>(
      "SELECT value FROM seed_meta WHERE `key` = 'marine_catalog_version' LIMIT 1",
      { type: QueryTypes.SELECT },
    ),
    database.query<{ brands: number; categories: number; products: number }>(
      `SELECT
         (SELECT COUNT(*) FROM brands) AS brands,
         (SELECT COUNT(*) FROM categories) AS categories,
         (SELECT COUNT(*) FROM products) AS products`,
      { type: QueryTypes.SELECT },
    ),
  ]);

  const catalogWasFullyCleared =
    Number(catalogCounts[0]?.brands ?? 0) === 0 &&
    Number(catalogCounts[0]?.categories ?? 0) === 0 &&
    Number(catalogCounts[0]?.products ?? 0) === 0;

  if (currentVersion[0]?.value === marineCatalogSeedVersion && !catalogWasFullyCleared) {
    return;
  }

  await database.query("DELETE FROM product_variants");
  await database.query("DELETE FROM products");
  await database.query("DELETE FROM category_fields");
  await database.query("DELETE FROM categories");
  await database.query("DELETE FROM brands");

  for (const brand of marineBrands) {
    await database.query(
      `INSERT INTO brands (
         id, name, slug, logo_text, display_order
       ) VALUES (
         :id, :name, :slug, :logoText, :displayOrder
       )
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), slug = VALUES(slug), logo_text = VALUES(logo_text),
         display_order = VALUES(display_order)`,
      {
        replacements: {
          displayOrder: brand.displayOrder,
          id: brand.id,
          logoText: brand.logoText,
          name: brand.name,
          slug: brand.slug,
        },
      },
    );
  }

  for (const category of marineCategories) {
    await database.query(
      `INSERT INTO categories (
         id, name, slug, parent_category_id, banner_image_url, is_featured, display_order
       ) VALUES (
         :id, :name, :slug, :parentCategoryId, :bannerImageUrl, :isFeatured, :displayOrder
       )
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), slug = VALUES(slug), parent_category_id = VALUES(parent_category_id),
         banner_image_url = VALUES(banner_image_url), is_featured = VALUES(is_featured),
         display_order = VALUES(display_order)`,
      {
        replacements: {
          bannerImageUrl: category.bannerImageUrl,
          displayOrder: category.displayOrder,
          id: category.id,
          isFeatured: category.isFeatured ? 1 : 0,
          name: category.name,
          parentCategoryId: category.parentCategoryId,
          slug: category.slug,
        },
      },
    );
  }

  const categoryNameById = new Map(
    marineCategories.map((category) => [category.id, category.name]),
  );

  for (const product of marineProducts) {
    const effectivePrice = product.salePriceAedCents ?? product.regularPriceAedCents;

    await database.query(
      `INSERT INTO products (
         id, external_id, name, slug, sku, brand, category, category_id, description,
         image_url, secondary_image_url, regular_price_aed_cents, sale_price_aed_cents,
         price_aed_cents, has_variants, is_featured, is_active, stock_quantity, created_at, created_by_user_id
       ) VALUES (
         :id, :externalId, :name, :slug, :sku, :brand, :category, :categoryId, :description,
         :imageUrl, NULL, :regularPriceAedCents, :salePriceAedCents,
         :priceAedCents, 0, :isFeatured, 1, :stockQuantity, :createdAt, :createdByUserId
       )
       ON DUPLICATE KEY UPDATE
         external_id = VALUES(external_id), name = VALUES(name), slug = VALUES(slug), brand = VALUES(brand),
         category = VALUES(category), category_id = VALUES(category_id), description = VALUES(description),
         image_url = VALUES(image_url), secondary_image_url = VALUES(secondary_image_url),
         regular_price_aed_cents = VALUES(regular_price_aed_cents), sale_price_aed_cents = VALUES(sale_price_aed_cents),
         price_aed_cents = VALUES(price_aed_cents), has_variants = VALUES(has_variants),
         is_featured = VALUES(is_featured), is_active = VALUES(is_active), stock_quantity = VALUES(stock_quantity)`,
      {
        replacements: {
          brand: product.brand,
          category: categoryNameById.get(product.categoryId) ?? "Marine Accessories",
          categoryId: product.categoryId,
          createdAt: "2026-07-17T09:00:00.000Z",
          createdByUserId: "admin-001",
          description: product.description,
          externalId: Number(product.id.replace(/\D/g, "")),
          id: product.id,
          imageUrl: product.imageUrl,
          isFeatured: product.isFeatured ? 1 : 0,
          name: product.name,
          priceAedCents: effectivePrice,
          regularPriceAedCents: product.regularPriceAedCents,
          salePriceAedCents: product.salePriceAedCents,
          sku: product.sku,
          slug: product.slug,
          stockQuantity: product.stockQuantity,
        },
      },
    );
  }

  await database.query(
    `INSERT INTO seed_meta (\`key\`, value)
     VALUES ('marine_catalog_version', :version)
     ON DUPLICATE KEY UPDATE value = VALUES(value)`,
    { replacements: { version: marineCatalogSeedVersion } },
  );
}

async function readAuthSeed(): Promise<AuthSeed> {
  const contents = await readFile(authSeedPath, "utf8");
  const parsed = authSeedSchema.safeParse(JSON.parse(contents) as unknown);

  if (!parsed.success) {
    throw new Error(
      `Invalid auth seed data: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  }

  return parsed.data;
}

function resolveProductImageUrl(primaryText: string, secondaryText: string): string {
  const value = `${primaryText} ${secondaryText}`.toLowerCase();

  if (value.includes("life jacket") || value.includes("lifejacket") || value.includes("lalizas")) {
    return "/product-images/life-jacket.svg";
  }
  if (value.includes("life ring") || value.includes("buoy")) {
    return "/product-images/life-ring.svg";
  }
  if (value.includes("anchor")) {
    return "/product-images/anchor.svg";
  }
  if (value.includes("fender")) {
    return "/product-images/fender.svg";
  }
  if (value.includes("navigation light") || value.includes("side light")) {
    return "/product-images/navigation-light.svg";
  }
  if (value.includes("connector") || value.includes("plug") || value.includes("shore power")) {
    return "/product-images/connector.svg";
  }
  if (value.includes("battery") || value.includes("switch") || value.includes("victron")) {
    return "/product-images/battery.svg";
  }
  if (value.includes("pump") || value.includes("plumbing") || value.includes("water")) {
    return "/product-images/pump.svg";
  }
  if (value.includes("clean") || value.includes("brush") || value.includes("polish")) {
    return "/product-images/cleaning.svg";
  }
  if (value.includes("ladder")) {
    return "/product-images/ladder.svg";
  }

  return "/product-images/marine-essential.svg";
}
