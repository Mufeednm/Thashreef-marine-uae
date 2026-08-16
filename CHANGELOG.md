# Changelog

## Unreleased

- Restore username-or-email sign-in so the seeded administrator can use `admin` with its configured password.
- Keep customer and checkout sign-in email-only while the protected administrator screen uses a username field.
- Prevent category-parent loops, require email-and-password sign-in, and send order confirmation emails through configured SMTP.
- Remove Display Order from all administrator brand and category forms, tables, and detail dialogs while preserving existing sort values internally.
- Enlarge storefront brand imagery and add the uploaded brand image to the public brand catalogue header.
- Remove the administrator-facing brand logo-label field and make an uploaded brand image mandatory for every newly created brand and any legacy brand without an image.
- Use explicit Username and Password fields for sign-in, remove visible administrator credential examples, and preserve direct administrator routing to the protected workspace after authentication.
- Replace the admin order PDF download control with a print-ready 100 × 150 mm parcel label containing the Marsa Edge Marine name, customer, delivery address, order date, and ordered products.
- Remove VAT from checkout totals and order records, and replace the basic completion message with a clear order-request confirmation and email follow-up notice.
- Enforce unique customer email and normalized international mobile number, with both registration feedback and a MySQL unique phone index.
- Remove demo credential hints and all local non-admin accounts; retain only the hashed `admin` account, and route successful administrator sign-ins to `/admin`.
- Harden customer account registration: hash every password with scrypt, record the user and customer profile atomically, hash seeded sign-in accounts, and remove plaintext-password login support.
- Raise the Server Action request limit to 16 MB so three valid 5 MB product gallery uploads can be saved without a client-side fetch failure.
- Remove manual multipart form attributes from server-action forms to prevent React console errors; simplify product creation and indicate multi-image galleries on customer product cards.
- Remove Variants from the admin workspace and keep product, brand, and category inspection inside consistent in-page detail modals.
- Add a three-image product gallery with upload previews, persist full delivery addresses and order items, and add admin order-detail dialogs with per-order PDF downloads.
- Anchor desktop category flyout menus directly below their selected category and improve customer registration with country-code selection, inline field errors, and retained form values after an error.
- Restore the homepage Accessory spotlight with photorealistic marine-item images for safety gear, anchoring, and pumps; move the brand rail above Shop by Category and remove the bulk-order promotion.
- Remove the homepage Safety bundle and Mooring essentials promotional cards to keep catalogue discovery focused.
- Remove the Latest projects gallery, rail scrolling helper labels, and customer-facing Featured labels from product cards and detail pages.
- Refresh the homepage hero with a purpose-made Dubai marina image, sharper text hierarchy, and a stronger responsive Accessory spotlight panel.
- Limit the homepage carousel to three consistent, locally stored photorealistic Dubai marine scenes for marina supply, safety gear, and maintenance.
- Replace the hero spotlight imagery with live new-product cards, including catalogue images, prices, detail links, and add-to-cart controls.
- Remove the header Quick quote control and make the floating WhatsApp contact action a clear, accessible icon button.
- Hide the Next.js local-only development indicator so it does not overlap the storefront WhatsApp contact button.

- Remove SKU fields and SKU display from customer and administrator workflows; generate a private internal reference for new products.
- Redesign Products, Brands, and Categories as table-first admin screens with modal create/edit flows and labelled view, edit, and delete icon actions.
- Replace the footer service-desk contact block with the Marsa Edge Marine Dubai, Al Jaddaf, Drydocks location details.

- Add admin-only JPG, PNG, and WebP upload controls for product, category, and brand images; persist uploaded brand logos in MySQL.
- Remove the four storefront trust-strip statements and add a dedicated Return & Refund policy page linked from the footer.
- Update checkout delivery to AED 20 below AED 700 and free UAE delivery at AED 700 or above, enforced in both the summary and order API.
- Simplify the small-phone header by hiding the constrained inline search and using the touch-friendly category drawer for navigation.

- Replace the SQLite demo runtime with Hostinger-ready MySQL persistence, including MySQL schema initialization, upserts, analytics queries, and runtime database configuration.
- Bundle the MySQL driver explicitly in the Next.js server build so Sequelize can load it at runtime on Hostinger.
- Quote the MySQL `seed_meta` key identifier during runtime initialization.
- Render data-driven routes dynamically so deployment builds do not attempt to access the production database before environment variables are configured.
- Rebrand the customer storefront, admin workspace, page metadata, checkout, and support details as Marsa Edge Marine LLC, using the supplied Marsa Edge logo asset.
- Replace the misleading mini-chart treatment with larger, real record-based customer, order, and order-value comparisons; remove the obsolete Workbook import sidebar message.
- Add optional Arabic name/description fields for products and Arabic names for categories and brands, persisted in SQLite and used by product cards/detail pages when Arabic is selected.
- Fix the compact storefront header so search can shrink correctly on small phone screens, preventing page-level horizontal scrolling.

- Refine the admin overview analytics layout, remove the overview Add product shortcut, and streamline the Products page around one clearer catalogue table.
- Use distinct registration, order, and revenue visualizations on the admin overview and remove the Catalog readiness panel.
- Streamline admin navigation and product setup by removing the Add Product sidebar item and Homepage order field, while placing storefront options last.
- Simplify the admin header, redesign overview analytics as clear time-period cards, and make storefront global search clear category filters and jump to results.
- Add admin order management with persisted order requests and Accept/Reject controls.
- Fix local order saving against the existing SQLite schema and make Cash on Delivery the sole checkout payment option.
- Add time-based customer-registration, order-volume, and order-value graphs to the admin overview.
- Restore saved carts only after client hydration, retain registered phone numbers at checkout, and return safe JSON failures from order submission.
- Add clickable brand catalogue pages, customer registration, stored checkout orders, and an admin customer list.
- Replace the admin operational-pulse panel with a concise store-activity chart.
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
