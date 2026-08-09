# Decision Log

## 2026-08-09 - Use the supplied Marsa Edge brand identity

The customer storefront and protected admin workspace use Marsa Edge Marine LLC as their visible business name. The supplied Marsa Edge logo is retained as a local public asset and positioned within a fixed responsive header frame so it remains readable without introducing mobile overflow.

## 2026-08-09 - Make dashboard analytics literal, not illustrative

The overview now compares the actual stored totals for today, the last seven days, and the current month. It deliberately does not present these accumulated periods as a daily trend. The supporting text makes clear that figures update from SQLite order and customer records, not from a forecast.

## 2026-08-09 - Store catalogue copy in both English and Arabic

Product names/descriptions plus category and brand names now have optional Arabic fields. English remains required for stable SKUs, slugs, and administration; Arabic copy is persisted separately so the storefront can use it as the translated catalogue content is completed.

## 2026-08-09 - Keep the compact header within the phone viewport

The storefront search area may shrink below its placeholder's intrinsic width on narrow screens. This keeps the menu, brand mark, search, and cart accessible together without creating page-level horizontal scrolling; horizontal product and category rails remain independently scrollable by design.

## 2026-08-09 — Keep product management centred on the catalogue table

The redundant Products-page introduction panel is removed. The catalogue table now puts identity, classification, price, product options, storefront placement, status, and actions in a consistent order so routine product work requires less scanning.

## 2026-08-09 — Give each overview metric an appropriate visualization

Customer registrations use a line trend, order counts use bars, and order value uses a proportion ring. This avoids repeating the same graph treatment for unrelated measures and makes the overview easier to scan.

## 2026-08-09 — Keep product setup focused on two required steps

Product setup now groups catalog details and pricing/presentation into two numbered sections. Storefront placement remains available as the final optional section, while the manual homepage-order field is removed to avoid fragile merchandising order management.

## 2026-08-09 — Search results override the current storefront category filter

Typing in the global storefront search now resets an active category selection and takes the visitor to the catalogue results. This prevents a valid product search from appearing broken because a previous category filter excludes it.

## 2026-08-09 — Use the existing SQLite orders schema for local order management

Order records and their line items are now persisted in the existing SQLite `orders` and `order_items` tables. The schema requires `currency`, so new order inserts explicitly save `AED`. Admins manage the resulting requests from a dedicated Orders page with accepted and rejected terminal states.

## 2026-08-09 — Offer Cash on Delivery only during testing

Checkout now presents only Cash on Delivery. The former card and gateway options were placeholders with no payment-provider integration, so showing them created a misleading checkout choice.

## 2026-08-09 — Make admin analytics time-based

The overview now calculates customer registrations, order count, and order value for today, the last seven days, and the current month. Registration is used rather than login events because login auditing has not been introduced yet.

## 2026-08-09 — Hydrate the session cart before persisting it

The storefront now waits until it has restored session storage before writing the cart back. This prevents a route return from replacing an existing cart with the component's initial empty state.

## 2026-08-09 — Store customer registrations and orders in the local demo database

Customer sign-up now creates a customer account and profile in SQLite, and checkout submits a validated order plus line items to SQLite. The admin console exposes customer records and recent orders. Prices are recalculated server-side from the catalogue rather than accepted from the browser.

## 2026-08-09 — Give each managed brand a public catalogue route

The homepage brand rail links to `/brands/[slug]`, which shows only active products assigned to that managed brand. This keeps supplier browsing shareable and avoids making the homepage filter state do double duty as a public catalogue page.

## 2026-08-09 — Store admin product uploads locally

The admin product form now accepts JPG, PNG, and WebP files up to 5 MB. Valid files are written beneath `public/product-uploads` and the resulting public path is stored with the product. This supports local development; the temporary Render filesystem still requires object storage for durable production uploads.

## 2026-08-09 — Support unchecked product-placement controls

Unchecked HTML checkboxes submit `null` in this server-action form path. The product schema now accepts nullish values for all placement flags and converts them to `false`.

## 2026-08-09 — Explain product form validation failures

Product creation and editing now return the actual field-validation messages instead of a generic error summary. Required inputs also use native browser validation, making the correction path visible before submission.

## 2026-08-09 — Complete active catalog CRUD

Products now have protected edit and delete controls alongside the existing brand and category CRUD. Admin access uses a dedicated `/admin/login` entry point, while server-side authorization remains the enforcement layer.

## 2026-08-09 — Use an order-only catalogue

The storefront accepts orders without stock availability checks. Stock quantity is no longer collected or shown in the current admin and customer experiences; the legacy database field remains internal so existing seeded data stays compatible.

## 2026-08-09 — Simplify the storefront homepage

Removed placeholder customer testimonials and the inactive newsletter form to keep the homepage focused on the real product catalogue and avoid collecting email addresses before an email service is configured.

## 2026-08-09 — Compile SQLite during Render builds

Render's Node 24 build image selected a prebuilt `sqlite3` binary requiring GLIBC 2.38, while the free runtime provides an older compatible library set. The Render configuration therefore builds SQLite from source on the target platform.

## 2026-08-09 - Render Free is the temporary test host

- **Decision:** Configure the current SQLite-backed demo for deployment as a Render Free web service, without persistent storage.
- **Reason:** The goal is public testing before a production database migration; Render Free can run the complete Node application while Vercel cannot safely persist the current local SQLite writes.
- **Impact:** The hosted test service can sleep after inactivity and all catalog/admin writes can reset after a restart or redeploy. A durable Postgres/MySQL migration remains required before a production launch.

## 2026-08-09 - Product viewing uses dedicated detail pages

- **Decision:** Open storefront products on a stable `/products/[slug]` route instead of relying on the compact quick-view modal, and render related products that share the product's assigned category.
- **Reason:** Product browsing needs a shareable full-page experience with room for product information, ordering feedback, and relevant category discovery.
- **Impact:** Product cards now deep-link to detail pages; the detail page preserves the local session cart behavior and offers category-matched related products.

## 2026-08-07 - Admin catalog uses managed brands and protected taxonomy changes

- **Decision:** Add a dedicated Brands page with create, edit, and deletion flows; make product creation select from those brands; provide category editing and protect brand/category deletions when active product or taxonomy relationships exist.
- **Reason:** Free-text product brands create inconsistent storefront filters, and catalogue administrators need safe, visible controls over core taxonomy.
- **Impact:** Product assignment is now normalized at the admin workflow level while the existing lightweight SQLite schema continues storing the product brand as text for local-demo compatibility.

## 2026-07-23 - Client-side EN/AR locale switching for the local storefront

- **Decision:** Use JSON dictionaries and a client locale provider to change language, text direction, and font instantly while persisting the visitor selection in local storage.
- **Reason:** The current local-demo routes need bilingual interaction without adding external i18n dependencies or forcing a full route refresh.
- **Impact:** The translation provider is reusable across storefront, checkout, and admin work; locale-aware server routing can be added later if localized SEO URLs are required.

## 2026-07-23 - Storefront navigation exposes populated catalog branches only

- **Decision:** Filter the public category navigation to branches that contain at least one assigned product and reset the catalog search when a visitor changes category.
- **Reason:** A department selection must never lead to a blank catalog caused by an empty nested category or a search term left over from an earlier browsing context.
- **Impact:** Admins can still create future taxonomy branches; they become visible publicly once products are assigned. The admin product list provides a populated-category filter for verification.

## 2026-07-23 - Storefront merchandising and checkout remain local-demo ready

- **Decision:** Store homepage banner records and product/category merchandising flags in SQLite, and retain the basket in browser session storage during the sign-in-to-checkout transition.
- **Reason:** This makes the public storefront configurable without introducing a payment provider or customer-data service outside the existing local architecture.
- **Impact:** The checkout captures a complete UAE delivery and payment-method flow for demonstration; live payment authorization, durable order creation, and production-grade registration remain subsequent integration work.

## 2026-07-14 - Local testing uses a file-backed demo store

- **Decision:** Implement the first testable auth and catalog flow with a local JSON store and signed cookie sessions.
- **Reason:** It enables immediate admin-product and customer-catalog testing without blocking on database migrations or production identity requirements.
- **Alternatives:** Wait for MySQL-backed auth and catalog persistence before enabling any product workflow.
- **Impact:** The current login and product creation flow is suitable for local testing only and should be replaced with production-grade persistence and identity later.

## 2026-07-17 - Phase 1 admin console uses workbook-derived local seed data

- **Decision:** Seed the local demo store with the supplied marine workbook and present a role-aware administration dashboard before building the customer storefront.
- **Reason:** The project brief explicitly prioritizes catalog administration and provides representative products, categories, variants, users, and orders for local testing.
- **Impact:** The dashboard is a functional local-testing interface; it does not represent a production database, payment gateway, image pipeline, or complete order-management implementation.

## 2026-07-17 - Customer storefront is a separate public route

- **Decision:** Add the shopper-facing experience at `/shop`, using the same file-backed catalog repository as the local admin console.
- **Reason:** It demonstrates immediate catalog reflection between admin and customer contexts while keeping the public and administration UI clearly separated.
- **Impact:** Search, category filtering, quick views, and cart behavior work locally in the browser. Checkout, payment processing, real image uploads, and durable order records remain future production work.

## 2026-07-17 - Local runtime persistence uses SQLite

- **Decision:** Use a workspace-local SQLite database for the demo runtime, seeded from the supplied JSON catalog.
- **Reason:** A local MySQL server is not running, while SQLite makes data persistence testable without external configuration.
- **Impact:** Products and local user records are persisted at `data/akbar-marine.sqlite`; the JSON file remains the initial seed source.

## 2026-07-17 - Main page uses the customer storefront

- **Decision:** Make `/` the product-first customer storefront, with login available from the header and admin/staff sessions still opening the administration dashboard.
- **Reason:** The user asked for the first page to resemble the marine-parts reference storefront, where search, sign-in, cart, collections, and product cards are immediately visible.
- **Impact:** Shoppers land directly on the catalogue experience. Product images are local assets stored in `public/product-images/` and persisted through the local SQLite `image_url` field.

## 2026-07-17 - Workbook-backed SQLite includes operational entities

- **Decision:** Expand the local SQLite seed sync to import workbook categories, variants, customers, orders, order items, and coupons, not just flat products.
- **Reason:** The workbook contains richer operational data that improves both admin realism and future feature readiness.
- **Impact:** The local admin overview can summarize catalog and order information from SQLite instead of relying on placeholder figures.

## 2026-07-17 - Admin experience is route-based

- **Decision:** Replace the all-in-one admin dashboard-plus-form screen with dedicated admin pages for overview, product browsing, and product creation.
- **Reason:** The user explicitly requested a page-by-page admin flow and the single-page layout had become cramped.
- **Impact:** Admins now work through `/admin`, `/admin/products`, and `/admin/products/new`, while the storefront remains the primary public entry point.

## 2026-07-17 - Brand and category administration

- **Decision:** Use `Thashreef-marine-uae` as the single brand across customer and admin surfaces, and add a dedicated admin category page with custom category fields.
- **Reason:** The user clarified that Akbar and Thashreef should not both appear, and that category creation should be separate from product creation with many fields per category.
- **Impact:** `/` is the branded customer storefront, `/admin/categories` manages categories, and SQLite stores category fields in `category_fields`.

## 2026-07-17 - Premium storefront homepage

- **Decision:** Redesign `/` with a full-width marine photo hero carousel, visual category carousel, and multiple horizontal product rails.
- **Reason:** The user asked for a modern, premium, world-class marine e-commerce homepage with strong visual impact and conversion-focused browsing.
- **Impact:** The homepage now uses optimized remote Unsplash imagery through Next Image, reusable carousel/card sections, and smoother hover/scroll interactions.

## 2026-07-17 - Accessory-first marketplace homepage

- **Decision:** Refine the storefront into a marine accessories marketplace rather than a boat/yacht sales-style page, adding sticky mega-menu navigation, a clickable category navbar that filters and jumps to matching products, promotional banners, six product rails, brand/logo sections, testimonials, gallery, newsletter, and Framer Motion transitions.
- **Reason:** The user clarified the business sells marine equipment and accessories, and the previous homepage had too much empty space and a weaker navigation pattern.
- **Impact:** `/` now prioritizes product discovery, category density, accessory imagery, and conversion-focused shopping paths while keeping the existing catalog, cart, login, and product-detail behavior. Category navigation lives in the sticky navbar rather than a desktop sidebar.

## 2026-07-17 - Nested marine catalog taxonomy

- **Decision:** Replace the flat/demo catalog seed with a versioned marine-only taxonomy: main categories, subcategories, optional child categories, brands, and products assigned only to non-main categories.
- **Reason:** A professional marine accessories store needs scalable navigation, database-backed mega menus, and product assignment rules that prevent products from sitting directly under broad departments like Safety or Electrical.
- **Impact:** SQLite now seeds 12 main categories, 76 category records, 12 brands, and 58 products. The storefront navbar loads main categories from the database and the hover mega menu lists related subcategories dynamically.

## 2026-07-14 - Functional reference website

- **Decision:** Record `https://rimalmarine.ae/` as the project's functional reference website.
- **Reason:** It provides domain-specific catalog and storefront patterns for a marine-parts e-commerce implementation.
- **Alternatives:** Work without an external reference or add more reference sites later.
- **Impact:** The team can use the site for functional analysis only; all copy, visuals, assets, and implementation must remain original.

## 2026-07-14 - Modular Next.js monolith

- **Decision:** Use Next.js App Router with feature modules and clean dependency boundaries.
- **Reason:** It supports SEO and fast delivery while preserving a migration path to services.
- **Alternatives:** Separate frontend/backend or a microservice-first design.
- **Impact:** Server-only integrations remain behind infrastructure contracts.

## 2026-07-14 - Sequelize with MySQL

- **Decision:** Use Sequelize as the MySQL ORM.
- **Reason:** It matches the project requirement and provides model-oriented data access.
- **Alternatives:** Raw SQL, Prisma, or another ORM.
- **Impact:** Migrations and models will be maintained together.

## 2026-07-14 - Deferred authentication implementation

- **Decision:** Do not implement authentication during foundation setup; recommend Auth.js with a credentials provider plus a database adapter for the identity milestone.
- **Reason:** Social login, MFA, recovery, roles, and user-data requirements need confirmation.
- **Alternatives:** Custom JWT authentication or a hosted identity provider.
- **Impact:** The identity milestone must add secure sessions, password hashing, CSRF protections, and authorization policies.
