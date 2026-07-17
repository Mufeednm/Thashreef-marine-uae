# Database

MySQL 8 and Sequelize are the initial persistence stack. Models and migrations will live in `src/infrastructure/database`. All schema changes require a migration, timestamps, foreign keys, appropriate indexes, and an explicit rollback plan.

Planned entities: users, roles, permissions, addresses, categories, brands, products, variants, inventory, images, orders, payments, coupons, reviews, wishlists, notifications, shipping, audit logs, and analytics.

## Local demo catalog schema

The current local SQLite runtime uses a versioned seed marker in `seed_meta` to replace the old demo catalog with a marine-only taxonomy once per seed version.

- `categories` is self-referencing via `parent_category_id`.
- Main categories have `parent_category_id = NULL`.
- Subcategories and child categories have a parent category.
- Products must be assigned to a non-main category.
- `brands` stores seeded brand records used by storefront brand rails.
- `products.category_id` points to the assigned subcategory/child category while product queries also expose the resolved main category for navigation filtering.
