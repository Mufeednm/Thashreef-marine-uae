# Database

MySQL 8 and Sequelize are the initial persistence stack. Models and migrations will live in `src/infrastructure/database`. All schema changes require a migration, timestamps, foreign keys, appropriate indexes, and an explicit rollback plan.

Planned entities: users, roles, permissions, addresses, categories, brands, products, variants, inventory, images, orders, payments, coupons, reviews, wishlists, notifications, shipping, audit logs, and analytics.

## Production catalog schema

The runtime uses MySQL 8 through Sequelize. On first startup it creates the current schema without adding sample data. Set `SEED_DEMO_DATA=true` only when an intentional demo-data seed is required.

- `categories` is self-referencing via `parent_category_id`.
- Main categories have `parent_category_id = NULL`.
- Subcategories can belong only to a main category; category nesting is limited to two levels.
- Products must be assigned to a subcategory.
- `brands` stores seeded brand records used by storefront brand rails.
- `brands.image_url` stores an optional administrator-uploaded logo image; category images are stored in `categories.banner_image_url` and product images in `products.image_url`.
- `products.category_id` points to the assigned subcategory/child category while product queries also expose the resolved main category for navigation filtering.
