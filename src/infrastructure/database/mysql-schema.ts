import "server-only";
import type { Sequelize } from "sequelize";

/**
 * Creates the production schema without relying on SQLite-only DDL. Each
 * statement is idempotent so a new Hostinger MySQL database can be seeded on
 * first application start.
 */
export async function initializeMySqlSchema(database: Sequelize): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY, name VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, role VARCHAR(32) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS email_otp_challenges (
      id VARCHAR(64) PRIMARY KEY, email VARCHAR(255) NOT NULL, purpose VARCHAR(32) NOT NULL,
      code_hash VARCHAR(255) NOT NULL, expires_at VARCHAR(40) NOT NULL, attempt_count INT NOT NULL DEFAULT 0,
      used_at VARCHAR(40) NULL, created_at VARCHAR(40) NOT NULL,
      INDEX email_otp_challenges_lookup_idx (email, purpose, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS seed_meta (
      \`key\` VARCHAR(191) PRIMARY KEY, value VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS brands (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, name_ar VARCHAR(255) NULL,
      slug VARCHAR(191) NOT NULL UNIQUE, logo_text VARCHAR(255) NOT NULL, image_url TEXT NULL,
      display_order INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, name_ar VARCHAR(255) NULL,
      slug VARCHAR(191) NOT NULL UNIQUE, parent_category_id INT NULL, banner_image_url TEXT NULL,
      is_featured TINYINT(1) NOT NULL DEFAULT 0, show_on_homepage TINYINT(1) NOT NULL DEFAULT 0,
      homepage_order INT NOT NULL DEFAULT 0, display_order INT NOT NULL DEFAULT 0,
      INDEX categories_parent_category_id_idx (parent_category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS category_fields (
      id INT AUTO_INCREMENT PRIMARY KEY, category_id INT NOT NULL, label VARCHAR(255) NOT NULL,
      field_key VARCHAR(191) NOT NULL, input_type VARCHAR(32) NOT NULL DEFAULT 'text',
      is_required TINYINT(1) NOT NULL DEFAULT 0, display_order INT NOT NULL DEFAULT 0,
      UNIQUE KEY category_fields_category_key_unique (category_id, field_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY, external_id INT NULL, name VARCHAR(255) NOT NULL, name_ar VARCHAR(255) NULL,
      slug VARCHAR(191) NOT NULL UNIQUE, sku VARCHAR(191) NOT NULL UNIQUE, brand VARCHAR(255) NOT NULL DEFAULT 'Generic',
      category VARCHAR(255) NOT NULL DEFAULT '', category_id INT NULL, description TEXT NOT NULL, description_ar TEXT NULL,
      image_url TEXT NOT NULL, secondary_image_url TEXT NULL, tertiary_image_url TEXT NULL, regular_price_aed_cents INT NOT NULL DEFAULT 0,
      sale_price_aed_cents INT NULL, price_aed_cents INT NOT NULL DEFAULT 0, has_variants TINYINT(1) NOT NULL DEFAULT 0,
      is_featured TINYINT(1) NOT NULL DEFAULT 0, is_new_arrival TINYINT(1) NOT NULL DEFAULT 0,
      is_top_selling TINYINT(1) NOT NULL DEFAULT 0, is_best_deal TINYINT(1) NOT NULL DEFAULT 0,
      is_banner_product TINYINT(1) NOT NULL DEFAULT 0, homepage_order INT NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1, stock_quantity INT NOT NULL DEFAULT 0,
      created_at VARCHAR(40) NOT NULL, created_by_user_id VARCHAR(64) NOT NULL,
      INDEX products_category_id_idx (category_id), INDEX products_brand_idx (brand)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS homepage_banners (
      id INT AUTO_INCREMENT PRIMARY KEY, image_url TEXT NOT NULL, title VARCHAR(255) NOT NULL,
      subtitle TEXT NOT NULL, button_text VARCHAR(255) NOT NULL, button_link VARCHAR(255) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1, sort_order INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY, product_id VARCHAR(64) NOT NULL, product_external_id INT NOT NULL,
      variant_name VARCHAR(255) NOT NULL, sku_suffix VARCHAR(191) NOT NULL, price_aed_cents INT NOT NULL,
      stock_quantity INT NOT NULL DEFAULT 0, INDEX product_variants_product_id_idx (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS customer_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
      phone VARCHAR(64) NULL, role VARCHAR(32) NOT NULL, country VARCHAR(128) NULL,
      date_joined VARCHAR(40) NULL, status VARCHAR(32) NOT NULL, INDEX customer_profiles_email_idx (email),
      UNIQUE KEY customer_profiles_phone_unique (phone)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY, customer_profile_id INT NOT NULL, order_date VARCHAR(40) NOT NULL,
      status VARCHAR(32) NOT NULL, shipping_zone VARCHAR(128) NOT NULL, currency CHAR(3) NOT NULL,
      subtotal_aed_cents INT NOT NULL, shipping_fee_aed_cents INT NOT NULL, total_aed_cents INT NOT NULL,
      payment_method VARCHAR(64) NOT NULL, payment_status VARCHAR(32) NOT NULL DEFAULT 'not_required',
      stripe_checkout_session_id VARCHAR(255) NULL, delivery_address TEXT NULL, INDEX orders_customer_profile_id_idx (customer_profile_id),
      INDEX orders_order_date_idx (order_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY, order_id INT NOT NULL, variant_or_product_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL, product_image_url TEXT NULL, quantity INT NOT NULL, unit_price_aed_cents INT NOT NULL,
      line_total_aed_cents INT NOT NULL, INDEX order_items_order_id_idx (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(191) NOT NULL UNIQUE, discount_type VARCHAR(32) NOT NULL,
      value_text VARCHAR(255) NOT NULL, min_order_aed_cents INT NOT NULL, expiry_date VARCHAR(40) NOT NULL,
      status VARCHAR(32) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const statement of statements) await database.query(statement);
  const [brandImageColumn] = await database.query("SHOW COLUMNS FROM brands LIKE 'image_url'");
  if (Array.isArray(brandImageColumn) && brandImageColumn.length === 0) {
    await database.query("ALTER TABLE brands ADD COLUMN image_url TEXT NULL AFTER logo_text");
  }
  const [productTertiaryImageColumn] = await database.query(
    "SHOW COLUMNS FROM products LIKE 'tertiary_image_url'",
  );
  if (Array.isArray(productTertiaryImageColumn) && productTertiaryImageColumn.length === 0) {
    await database.query(
      "ALTER TABLE products ADD COLUMN tertiary_image_url TEXT NULL AFTER secondary_image_url",
    );
  }
  const [orderDeliveryAddressColumn] = await database.query(
    "SHOW COLUMNS FROM orders LIKE 'delivery_address'",
  );
  if (Array.isArray(orderDeliveryAddressColumn) && orderDeliveryAddressColumn.length === 0) {
    await database.query(
      "ALTER TABLE orders ADD COLUMN delivery_address TEXT NULL AFTER payment_method",
    );
  }
  const [orderPaymentStatusColumn] = await database.query(
    "SHOW COLUMNS FROM orders LIKE 'payment_status'",
  );
  if (Array.isArray(orderPaymentStatusColumn) && orderPaymentStatusColumn.length === 0) {
    await database.query(
      "ALTER TABLE orders ADD COLUMN payment_status VARCHAR(32) NOT NULL DEFAULT 'not_required' AFTER payment_method",
    );
  }
  const [orderStripeSessionColumn] = await database.query(
    "SHOW COLUMNS FROM orders LIKE 'stripe_checkout_session_id'",
  );
  if (Array.isArray(orderStripeSessionColumn) && orderStripeSessionColumn.length === 0) {
    await database.query(
      "ALTER TABLE orders ADD COLUMN stripe_checkout_session_id VARCHAR(255) NULL AFTER payment_status",
    );
  }
  const [orderItemImageColumn] = await database.query(
    "SHOW COLUMNS FROM order_items LIKE 'product_image_url'",
  );
  if (Array.isArray(orderItemImageColumn) && orderItemImageColumn.length === 0) {
    await database.query(
      "ALTER TABLE order_items ADD COLUMN product_image_url TEXT NULL AFTER product_name",
    );
  }
  const [customerPhoneIndex] = await database.query(
    "SHOW INDEX FROM customer_profiles WHERE Key_name = 'customer_profiles_phone_unique'",
  );
  if (Array.isArray(customerPhoneIndex) && customerPhoneIndex.length === 0) {
    try {
      await database.query(
        "ALTER TABLE customer_profiles ADD UNIQUE KEY customer_profiles_phone_unique (phone)",
      );
    } catch (error) {
      // Separate requests can initialize the schema at the same time in development.
      // If another request created this index after the check above, it is safe to continue.
      if (
        !(error instanceof Error) ||
        !error.message.includes("Duplicate key name 'customer_profiles_phone_unique'")
      ) {
        throw error;
      }
    }
  }
}
