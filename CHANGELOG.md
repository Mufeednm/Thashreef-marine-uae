# Changelog

## Unreleased

- Replace the admin product image-path field with validated local image uploads.
- Accept unchecked product-placement checkboxes as disabled values during product validation.
- Make product-form validation messages explicit and add browser-level required-field guidance.
- Add protected product edit/delete controls and a dedicated admin sign-in route.
- Remove stock controls, stock badges, and stock-based order blocking from the storefront and current admin pages.
- Remove the storefront customer-review and newsletter sign-up sections.
- Configure Render to compile SQLite for its Linux runtime during the test deployment build.

## [Unreleased]

### Added

- Added a Render Free deployment blueprint for temporary public testing with resettable SQLite demo data.

- Added full-page product detail routes with category-based related product recommendations.

- Added brand CRUD in the admin catalog, protected brand/category deletion, and managed brand selection during product creation.

- Next.js, TypeScript, Tailwind CSS, ESLint, Prettier, Sequelize, MySQL, and Zod foundation.
- Initial architecture, security, SEO, deployment, and engineering documentation.
- Functional reference analysis for the marine-parts storefront scope.
- Explicitly recorded `https://rimalmarine.ae/` as the referral/reference website in project documentation.
- Added a local Thashreef Marine UAE demo with seeded users, file-backed products, admin product creation, and login-gated catalog viewing.
- Added an Akbar Marine Phase 1 admin-console experience with inventory metrics, low-stock alerts, catalog table, and staff-aware access.
- Seeded the local demo catalog with the 30 supplied workbook products and added local staff credentials.
- Added a responsive customer storefront route with searchable catalog browsing, quick product details, and a local cart drawer.
- Replaced the file-backed runtime store with SQLite-backed local persistence and seeded the requested `admin` and `user` credentials.
- Made the main `/` page a Rimal Marine-inspired Akbar Marine storefront with header login, department navigation, product imagery, and customer cart browsing.
- Synced the full workbook into SQLite-backed categories, variants, customers, orders, order items, and coupons for richer local testing.
- Split the admin experience into dedicated overview, product-list, and add-product pages with a clearer product form.
- Improved storefront product presentation with brand and sale-price context sourced from the database.
- Unified the UI brand as `Thashreef-marine-uae`, improved the customer storefront around marine accessories and shipment support, and added admin category creation with many custom fields per category.
- Redesigned the homepage into a premium Thashreef-Marine-UAE storefront with a full-width image hero carousel, image category carousel, multiple product rails, refined micro-interactions, and remote image optimization.
- Reworked the homepage into a richer marine accessories marketplace with sticky mega-menu navigation, a clickable category navbar that filters and jumps to matching products, accessory-focused hero slides, promotional banners, six product rails, brand logos, testimonials, gallery, newsletter, and Framer Motion interactions.
- Added a versioned nested marine catalog seed with 12 main categories, subcategories, a child category, 12 brands, and 58 marine-accessory products; products are assigned only to subcategory/child-category records.
- Updated the storefront navbar to load main categories from the database and show database-backed subcategories in the hover mega menu.
- Added database-backed homepage banners, category homepage placement, product merchandising flags, and a customer-only four-step UAE checkout experience.
- Prevented empty category navigation results by excluding empty storefront branches and resetting stale searches on category selection; added category filtering to the admin product list.
- Fixed catalog product cards remaining visually hidden after category changes and added a clear catalog empty state.
- Replaced the all-category mega panel with an accessible single-category dropdown navigation and added persistent EN/AR locale, RTL direction, and Arabic font foundations.
