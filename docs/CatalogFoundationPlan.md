# Catalog Foundation Plan

## Goal

Create the original, reusable catalog foundation for a marine spare-parts e-commerce platform. This milestone creates no storefront design and no checkout; it establishes the data model and secure admin-ready services required by later features.

## Scope

### Included

- Categories with unlimited parent/child nesting and SEO slugs
- Brands
- Products with SKU, slug, descriptions, publication status, and SEO fields
- Product variants with variant SKU, price, compare-at price, weight, and attributes
- Structured technical specifications, such as voltage, material, size, compatibility, and vessel type
- Product images with sort order and alt text
- Inventory per variant
- Sequelize models and database migrations
- Zod validation schemas and server-side catalog services
- A minimal protected foundation for future admin APIs; no admin interface in this milestone

### Not included

- Customer authentication or accounts
- Storefront catalog pages/design
- Cart, checkout, payments, coupons, shipping calculation, or delivery integrations
- Bulk import or supplier integrations

## Proposed data model

```text
Category
  └─ parentCategoryId → Category (optional)

Brand

Product
  ├─ categoryId → Category
  ├─ brandId → Brand (optional)
  ├─ ProductImage[]
  ├─ ProductSpecification[]
  └─ ProductVariant[]
       └─ InventoryItem
```

- `Category`: name, slug, description, parent category, sort order, active state, SEO metadata.
- `Brand`: name, slug, description, logo key, active state.
- `Product`: name, slug, base SKU, short/long description, category, brand, status, SEO metadata.
- `ProductVariant`: SKU, title, option values, price in minor currency units, compare-at price, weight, active state.
- `ProductSpecification`: product-level key/value/unit records for technical filtering and display.
- `ProductImage`: storage key, alt text, sort order, optional variant association.
- `InventoryItem`: available, reserved, and reorder-threshold quantities per variant.

## Engineering rules

- Monetary values use integer minor units, never floating-point values.
- SKU and slug values are unique; slugs are stable after publication.
- Database constraints and indexes enforce integrity; application validation alone is not sufficient.
- All mutations will later require administrator or catalog-manager authorization.
- Image files are stored through the existing `ImageStorage` contract; the database stores only keys and metadata.
- Migrations are forward-only and include a tested rollback path where practical.

## Delivery stages

1. Add Sequelize migration tooling and database model conventions.
2. Create catalog migrations, models, repository contracts, and indexes.
3. Create Zod DTOs and catalog application services.
4. Add secure internal route-handler foundations and automated tests.
5. Verify with linting, type checks, tests, build, documentation, commit, and push.

## Decisions still needed

- Is AED the initial and only selling currency?
- Does stock represent one warehouse or multiple locations?
- Can a product be sold without variants, or should every product have a default variant?
- Which attributes must be filterable at launch: voltage, amperage, brand, material, vessel compatibility, size, or others?

## Current status

Planned; implementation has not started yet.
