import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { QueryTypes } from "sequelize";
import { z } from "zod";
import type { DemoUser } from "@/domain/auth/user";
import type { Category } from "@/domain/catalog/category";
import type { CategoryField } from "@/domain/catalog/category-field";
import type { Product } from "@/domain/catalog/product";
import type { ProductVariant } from "@/domain/catalog/product-variant";
import type {
  AdminOverviewMetrics,
  AdminRecentOrder,
  Brand,
  DemoStoreRepository,
  PersistedProductInput,
} from "@/domain/demo-store/demo-store-repository";
import { getDatabaseConnection } from "@/infrastructure/database/sequelize";
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
  async addProduct(input: PersistedProductInput): Promise<Product> {
    await ensureDatabase();

    const category = await getDatabaseConnection().query<{
      id: number;
      name: string;
      parentCategoryId: number | null;
    }>(
      `SELECT id, name, parent_category_id AS parentCategoryId
       FROM categories
       WHERE id = :id
       LIMIT 1`,
      { replacements: { id: input.categoryId }, type: QueryTypes.SELECT },
    );

    if (!category[0]) {
      throw new Error(`Unknown category id: ${input.categoryId}`);
    }
    if (!category[0].parentCategoryId) {
      throw new Error("Products must be assigned to a subcategory or child category.");
    }

    const effectivePrice = input.salePriceAedCents ?? input.regularPriceAedCents;
    const product: Product = {
      brand: input.brand.trim(),
      category: category[0].name,
      categoryId: input.categoryId,
      createdAt: input.createdAt,
      createdByUserId: input.createdByUserId,
      description: input.description.trim(),
      hasVariants: false,
      id: input.id,
      imageUrl: input.imageUrl?.trim() || resolveProductImageUrl(category[0].name, input.name),
      isActive: true,
      isFeatured: false,
      name: input.name.trim(),
      priceAedCents: effectivePrice,
      regularPriceAedCents: input.regularPriceAedCents,
      salePriceAedCents: input.salePriceAedCents ?? null,
      secondaryImageUrl: null,
      sku: input.sku.trim().toUpperCase(),
      slug: input.slug,
      stockQuantity: input.stockQuantity,
    };

    await getDatabaseConnection().query(
      `INSERT INTO products (
         id, external_id, name, slug, sku, brand, category, category_id, description,
         image_url, secondary_image_url, regular_price_aed_cents, sale_price_aed_cents,
         price_aed_cents, has_variants, is_featured, is_active, stock_quantity, created_at, created_by_user_id
       ) VALUES (
         :id, NULL, :name, :slug, :sku, :brand, :category, :categoryId, :description,
         :imageUrl, :secondaryImageUrl, :regularPriceAedCents, :salePriceAedCents,
         :priceAedCents, :hasVariants, :isFeatured, :isActive, :stockQuantity, :createdAt, :createdByUserId
       )`,
      {
        replacements: {
          ...product,
          hasVariants: product.hasVariants ? 1 : 0,
          isActive: product.isActive ? 1 : 0,
          isFeatured: product.isFeatured ? 1 : 0,
        },
      },
    );

    return product;
  }

  async addCategory(input: {
    bannerImageUrl?: string | null;
    displayOrder: number;
    fieldLabels: string[];
    isFeatured: boolean;
    name: string;
    parentCategoryId?: number | null;
    slug: string;
  }): Promise<Category> {
    await ensureDatabase();

    await getDatabaseConnection().query(
      `INSERT INTO categories (
         name, slug, parent_category_id, banner_image_url, is_featured, display_order
       ) VALUES (
         :name, :slug, :parentCategoryId, :bannerImageUrl, :isFeatured, :displayOrder
       )`,
      {
        replacements: {
          bannerImageUrl: input.bannerImageUrl?.trim() || null,
          displayOrder: input.displayOrder,
          isFeatured: input.isFeatured ? 1 : 0,
          name: input.name.trim(),
          parentCategoryId: input.parentCategoryId ?? null,
          slug: input.slug,
        },
      },
    );

    const [created] = await getDatabaseConnection().query<Category>(
      `SELECT
         id,
         name,
         slug,
         parent_category_id AS parentCategoryId,
         banner_image_url AS bannerImageUrl,
         is_featured AS isFeatured,
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
    };
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
       ON CONFLICT(category_id, field_key) DO UPDATE SET
         label = excluded.label,
         display_order = excluded.display_order`,
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

  async findUserById(id: string): Promise<DemoUser | null> {
    await ensureDatabase();
    const users = await getDatabaseConnection().query<DemoUser>(
      "SELECT id, name, username, email, password, role FROM users WHERE id = :id LIMIT 1",
      { replacements: { id }, type: QueryTypes.SELECT },
    );

    return users[0] ?? null;
  }

  async getAdminOverviewMetrics(): Promise<AdminOverviewMetrics> {
    await ensureDatabase();

    const [orders] = await getDatabaseConnection().query<
      { orderCount: number; totalRevenueAedCents: number }
    >(
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
         slug,
         logo_text AS logoText,
         display_order AS displayOrder
       FROM brands
       ORDER BY display_order, name`,
      { type: QueryTypes.SELECT },
    );
  }

  async listCategories(): Promise<Category[]> {
    await ensureDatabase();

    return getDatabaseConnection().query<Category>(
      `SELECT
         id,
         name,
         slug,
         parent_category_id AS parentCategoryId,
         banner_image_url AS bannerImageUrl,
         is_featured AS isFeatured,
         display_order AS displayOrder
       FROM categories
       ORDER BY parent_category_id IS NOT NULL, display_order, name`,
      { type: QueryTypes.SELECT },
    ).then((rows) =>
      rows.map((row) => ({
        ...row,
        isFeatured: Boolean(row.isFeatured),
      })),
    );
  }

  async listCategoryFields(): Promise<CategoryField[]> {
    await ensureDatabase();

    return getDatabaseConnection().query<CategoryField>(
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
    ).then((rows) =>
      rows.map((row) => ({
        ...row,
        isRequired: Boolean(row.isRequired),
      })),
    );
  }

  async listProducts(): Promise<Product[]> {
    await ensureDatabase();

    return getDatabaseConnection().query<Product>(
      `SELECT
         p.id,
         p.name,
         p.slug,
         p.sku,
         p.brand,
         p.category_id AS categoryId,
         COALESCE(c.name, p.category) AS category,
         COALESCE(gc.id, pc.id, c.id) AS mainCategoryId,
         COALESCE(gc.name, pc.name, c.name, p.category) AS mainCategory,
         p.description,
         p.image_url AS imageUrl,
         p.secondary_image_url AS secondaryImageUrl,
         p.regular_price_aed_cents AS regularPriceAedCents,
         p.sale_price_aed_cents AS salePriceAedCents,
         p.price_aed_cents AS priceAedCents,
         p.has_variants AS hasVariants,
         p.is_featured AS isFeatured,
         p.is_active AS isActive,
         p.stock_quantity AS stockQuantity,
         p.created_at AS createdAt,
         p.created_by_user_id AS createdByUserId
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN categories pc ON pc.id = c.parent_category_id
       LEFT JOIN categories gc ON gc.id = pc.parent_category_id`,
      { type: QueryTypes.SELECT },
    ).then((rows) =>
      rows.map((row) => ({
        ...row,
        hasVariants: Boolean(row.hasVariants),
        isActive: Boolean(row.isActive),
        isFeatured: Boolean(row.isFeatured),
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
}

async function ensureDatabase(): Promise<void> {
  initialization ??= initializeDatabase();
  return initialization;
}

async function initializeDatabase(): Promise<void> {
  const database = getDatabaseConnection();

  await database.query(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS seed_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_category_id INTEGER NULL,
    banner_image_url TEXT NULL,
    is_featured INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS category_fields (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    field_key TEXT NOT NULL,
    input_type TEXT NOT NULL DEFAULT 'text',
    is_required INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE(category_id, field_key)
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    external_id INTEGER NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL DEFAULT 'Generic',
    category TEXT NOT NULL DEFAULT '',
    category_id INTEGER NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL DEFAULT '/product-images/marine-essential.svg',
    secondary_image_url TEXT NULL,
    regular_price_aed_cents INTEGER NOT NULL DEFAULT 0,
    sale_price_aed_cents INTEGER NULL,
    price_aed_cents INTEGER NOT NULL DEFAULT 0,
    has_variants INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    stock_quantity INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    created_by_user_id TEXT NOT NULL
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_external_id INTEGER NOT NULL,
    variant_name TEXT NOT NULL,
    sku_suffix TEXT NOT NULL,
    price_aed_cents INTEGER NOT NULL,
    stock_quantity INTEGER NOT NULL
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS customer_profiles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NULL,
    role TEXT NOT NULL,
    country TEXT NULL,
    date_joined TEXT NULL,
    status TEXT NOT NULL
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer_profile_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    status TEXT NOT NULL,
    shipping_zone TEXT NOT NULL,
    currency TEXT NOT NULL,
    subtotal_aed_cents INTEGER NOT NULL,
    shipping_fee_aed_cents INTEGER NOT NULL,
    total_aed_cents INTEGER NOT NULL,
    payment_method TEXT NOT NULL
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    variant_or_product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_aed_cents INTEGER NOT NULL,
    line_total_aed_cents INTEGER NOT NULL
  )`);

  await database.query(`CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL,
    value_text TEXT NOT NULL,
    min_order_aed_cents INTEGER NOT NULL,
    expiry_date TEXT NOT NULL,
    status TEXT NOT NULL
  )`);

  await ensureProductColumns();
  await syncAuthUsers();
  await syncMarineCatalogSeed();
}

async function ensureProductColumns(): Promise<void> {
  const database = getDatabaseConnection();
  const columns = await database.query<{ name: string }>("PRAGMA table_info(products)", {
    type: QueryTypes.SELECT,
  });
  const existing = new Set(columns.map((column) => column.name));
  const additions = [
    ["external_id", "ALTER TABLE products ADD COLUMN external_id INTEGER NULL"],
    ["brand", "ALTER TABLE products ADD COLUMN brand TEXT NOT NULL DEFAULT 'Generic'"],
    ["category", "ALTER TABLE products ADD COLUMN category TEXT NOT NULL DEFAULT ''"],
    ["category_id", "ALTER TABLE products ADD COLUMN category_id INTEGER NULL"],
    [
      "secondary_image_url",
      "ALTER TABLE products ADD COLUMN secondary_image_url TEXT NULL",
    ],
    [
      "regular_price_aed_cents",
      "ALTER TABLE products ADD COLUMN regular_price_aed_cents INTEGER NOT NULL DEFAULT 0",
    ],
    [
      "sale_price_aed_cents",
      "ALTER TABLE products ADD COLUMN sale_price_aed_cents INTEGER NULL",
    ],
    [
      "price_aed_cents",
      "ALTER TABLE products ADD COLUMN price_aed_cents INTEGER NOT NULL DEFAULT 0",
    ],
    [
      "has_variants",
      "ALTER TABLE products ADD COLUMN has_variants INTEGER NOT NULL DEFAULT 0",
    ],
    [
      "is_featured",
      "ALTER TABLE products ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0",
    ],
    ["is_active", "ALTER TABLE products ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1"],
  ] as const;

  for (const [name, statement] of additions) {
    if (!existing.has(name)) {
      await database.query(statement);
    }
  }
}

async function syncAuthUsers(): Promise<void> {
  const database = getDatabaseConnection();
  const seed = await readAuthSeed();

  for (const user of seed.users) {
    await database.query(
      `INSERT INTO users (id, name, username, email, password, role)
       VALUES (:id, :name, :username, :email, :password, :role)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         username = excluded.username,
         email = excluded.email,
         password = excluded.password,
         role = excluded.role`,
      { replacements: user },
    );
  }
}

async function syncMarineCatalogSeed(): Promise<void> {
  const database = getDatabaseConnection();

  const [currentVersion] = await database.query<{ value: string }>(
    "SELECT value FROM seed_meta WHERE key = 'marine_catalog_version' LIMIT 1",
    { type: QueryTypes.SELECT },
  );

  if (currentVersion?.value === marineCatalogSeedVersion) {
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
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         slug = excluded.slug,
         logo_text = excluded.logo_text,
         display_order = excluded.display_order`,
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
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         slug = excluded.slug,
         parent_category_id = excluded.parent_category_id,
         banner_image_url = excluded.banner_image_url,
         is_featured = excluded.is_featured,
         display_order = excluded.display_order`,
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

  const categoryNameById = new Map(marineCategories.map((category) => [category.id, category.name]));

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
       ON CONFLICT(sku) DO UPDATE SET
         external_id = excluded.external_id,
         name = excluded.name,
         slug = excluded.slug,
         brand = excluded.brand,
         category = excluded.category,
         category_id = excluded.category_id,
         description = excluded.description,
         image_url = excluded.image_url,
         secondary_image_url = excluded.secondary_image_url,
         regular_price_aed_cents = excluded.regular_price_aed_cents,
         sale_price_aed_cents = excluded.sale_price_aed_cents,
         price_aed_cents = excluded.price_aed_cents,
         has_variants = excluded.has_variants,
         is_featured = excluded.is_featured,
         is_active = excluded.is_active,
         stock_quantity = excluded.stock_quantity`,
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
    `INSERT INTO seed_meta (key, value)
     VALUES ('marine_catalog_version', :version)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
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
