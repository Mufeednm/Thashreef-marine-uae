# Decision Log

## 2026-08-20 - Administrator password and product publication controls

- **Decision:** Provide a dedicated admin-only Security page that requires the current password and a confirmed replacement password. Use a per-product Visible/Hidden switch in the admin table and filter inactive products at the public catalogue-service boundary.
- **Reason:** Password changes need proof of account ownership, and product publication must be a reversible action without deleting records. Filtering only in the UI would leave hidden products reachable through direct links.
- **Impact:** The old administrator password is replaced with a new salted hash only after verification. Administrators retain access to all products, while customers see only visible products across the homepage, shop, brand, and product pages.

## 2026-08-20 - Close create dialogs after save

- **Decision:** Close an administrator create modal only after its server action reports a successful save.
- **Reason:** Administrators should return directly to the refreshed table after creating a record, while validation and save errors must remain visible in the open dialog.
- **Impact:** Product, brand, main-category, and subcategory creation closes its modal on success and retains it on failure.

## 2026-08-19 - Marsa Edge browser-tab icon

- **Decision:** Use a square Marsa Edge ship-wheel and compass logo asset for the browser tab, bookmarks, and Apple touch icon.
- **Reason:** The default Next.js favicon does not identify the business in a browser tab.
- **Impact:** Storefront metadata now consistently points to the Marsa Edge icon without changing the full wordmark used in the page header.

## 2026-08-19 - Storefront WhatsApp destination

- **Decision:** Connect the persistent storefront WhatsApp action to the requested UAE number, 0527035250.
- **Reason:** Customer enquiries must reach the current business contact rather than the previous placeholder number.
- **Impact:** The action opens a WhatsApp chat using the internationally formatted number `971527035250`.

## 2026-08-19 - Reliable storefront subcategory navigation

- **Decision:** Render the hovered or selected main category's direct subcategories in a compact dropdown below that category button, using a portal above the page layers.
- **Reason:** The original flyout was present in the page markup but could be hidden by surrounding layout layers, while a full-width second row is too visually heavy for normal browsing.
- **Impact:** Hovering exposes a small dropdown containing only direct subcategories below its category; clicking pins it open for touch users. The portal keeps it visible above the hero and other storefront content.

## 2026-08-16 - Administrator username sign-in compatibility

- **Decision:** Accept either a username or email address at sign-in while continuing to use email-only customer registration.
- **Reason:** The seeded administrator uses the `admin` username, and the repository already performs a case-insensitive lookup across both identifiers.
- **Impact:** The administrator can sign in with the requested username and password, while password hashes and customer email validation remain unchanged.

## 2026-08-16 - Separate administrator and checkout login labels

- **Decision:** Present a Username field only on the administrator login screen and retain Email address on storefront and checkout login forms.
- **Reason:** Customer checkout must not expose administrator terminology or credentials.
- **Impact:** The shared sign-in flow retains its secure server-side identifier handling, while each audience sees only the relevant field label and prompt.

## 2026-08-16 - Email-first customer access and reliable order notifications

- **Decision:** Accept email and password only for sign-in, reject category parent assignments that create a hierarchy cycle, and send confirmation email immediately after each saved order when complete SMTP settings are configured.
- **Reason:** Email is the customer's durable account identity, category loops can make navigation recursive, and order updates must be deliverable through a real mail server rather than only shown in the browser.
- **Impact:** Login validation is email based; category edits reject self, descendant, and already-corrupt parent chains; orders remain saved if mail delivery fails and the checkout response accurately indicates whether a confirmation was sent.

## 2026-08-16 - Hidden catalogue ordering controls

- **Decision:** Remove Display Order from all administrator brand and category interfaces, and retain its existing database value only as an internal stable-sort fallback.
- **Reason:** Manual numeric ordering is not needed in the requested administration workflow.
- **Impact:** New brands and categories receive the default internal order, while edits retain their existing order and storefront navigation remains deterministic.

## 2026-08-16 - Prominent customer-facing brand imagery

- **Decision:** Use larger image-first brand cards in the storefront rail and render the same image in the public brand catalogue header. Keep display order internal to administration.
- **Reason:** Brand images must be recognisable to shoppers and consistently carried into the brand-specific page. Display order is a sorting control, not customer information.
- **Impact:** Customers see the uploaded image before selecting a brand and again while browsing that brand's products. Administrators can still control the sequence without exposing the numeric setting publicly.

## 2026-08-16 - Image-first brand identity

- **Decision:** Remove the editable logo-label field from brand administration and require an uploaded image for new brands and legacy brands that do not already have one.
- **Reason:** A brand image is the sole presentation asset requested for brands; a separate text label creates duplicate and inconsistent identity data.
- **Impact:** The system internally derives the legacy label from the brand name for database compatibility, while administrators only manage the name and image.

## 2026-08-16 - Private seeded administrator sign-in

- **Decision:** Retain the existing seeded administrator account as the local bootstrap account, but never display its credentials. Present the normal sign-in form as Username and Password, and route authenticated administrators to `/admin`.
- **Reason:** The administrator should not need to create a separate account, while visible credential hints are insecure and unprofessional.
- **Impact:** The administrator remains available after a fresh database initialization and is still stored as a secure salted hash. Customer registration continues to use email separately.

## 2026-08-16 - Print-ready parcel labels

- **Decision:** Replace the administrator's PDF-download action with an authenticated, print-focused parcel-label page sized at 100 × 150 mm.
- **Reason:** Delivery parcels need a direct label containing the recipient, address, ordered products, and date rather than a general order document.
- **Impact:** The order table and detail dialog now open a separate label tab that invokes the browser print dialog, while retaining a visible manual print control if automatic printing is blocked.

## 2026-08-15 - VAT-free order requests and clear confirmation

- **Decision:** Exclude VAT from checkout and saved order totals, retaining only the product subtotal and UAE delivery fee. Present a dedicated confirmation state that explains the availability review and forthcoming email confirmation.
- **Reason:** The customer requested the displayed and recorded order amount to exclude VAT, while a request order needs clear expectations before payment or dispatch.
- **Impact:** The checkout total and the administrator's saved total now match without VAT. Customers see the exact email address that will receive confirmation after availability is checked.

## 2026-08-15 - Unique customer contact records

- **Decision:** Use the complete normalized international phone value as a unique customer identifier alongside email, and enforce it in both registration checks and MySQL.
- **Reason:** The same country code and local mobile number must not create more than one account, including under concurrent registration attempts.
- **Impact:** Registration gives a direct mobile-number error before saving. The unique database index remains the final guard even if two requests arrive at the same time.

## 2026-08-15 - Single local administrator account

- **Decision:** Remove the visible demo-account credentials and eliminate local staff/customer demo accounts, retaining only the requested administrator account. Send an administrator to the protected admin workspace after a successful normal sign-in.
- **Reason:** Credentials must never appear in the user interface, and the local environment should begin with one clear administrator account rather than test users.
- **Impact:** The verified local database now contains only the `admin` account with a salted password hash. The corresponding password remains user-supplied rather than being rendered in the application.

## 2026-08-15 - Durable and hashed customer registration

- **Decision:** Store every password exclusively as a salted scrypt hash. Create the user account and customer profile in one database transaction, and migrate seeded local accounts to the same format on initialization.
- **Reason:** An account must not be partially recorded, and password verification must never accept plaintext values.
- **Impact:** A successful customer registration creates both database records together. Duplicate email conflicts roll back cleanly, login only verifies secure hashes, and the administrator customer list is revalidated after registration.

## 2026-08-15 - Product gallery upload request size

- **Decision:** Configure the Next.js Server Action request body limit at 16 MB.
- **Reason:** The default 1 MB limit rejects the combined multipart request for a valid three-image product gallery, which appears to the browser as a failed fetch.
- **Impact:** The administrator can submit up to three 5 MB images in a single create or edit request. Individual image validation remains limited to JPG, PNG, or WebP at 5 MB each.

## 2026-08-15 - Server-action form handling and gallery visibility

- **Decision:** Let React supply the multipart settings for server-action forms, remove the introductory product-setup panel, and show a photo count on customer product cards when a product has a gallery.
- **Reason:** React 19 warns when a form with a function action also declares `encType`; the extra introduction was not useful during product creation; customers need a clear cue that more product images are available.
- **Impact:** Product, brand, and category image uploads no longer log the form console error. Product creation opens directly on the fields, while customer cards signal the available gallery images and the product detail page provides the image selector.

## 2026-08-15 - Standardised catalogue management

- **Decision:** Remove the unused Variants metric and column from the administrator experience. Use the same table action pattern for every catalogue record: view details in an in-page modal, edit, or delete.
- **Reason:** Variants do not belong to the current catalogue workflow, and opening storefront pages from an admin table interrupts record management.
- **Impact:** The overview now reports orders instead of variants. Product, brand, and category inspection remains inside the admin workspace with consistent, touch-friendly action controls.

## 2026-08-15 - Richer catalogue and fulfilment records

- **Decision:** Store up to three administrator-uploaded product images and make the customer product page browse them. Save the complete checkout delivery address on every new order, then provide its customer, address, items, and a PDF export in the admin order view.
- **Reason:** One image was insufficient for product assessment, while fulfilment staff need the full order record in one accessible place.
- **Impact:** Administrators can preview every selected gallery image before saving. New orders retain their delivery address and line items for display and a protected, downloadable PDF.

## 2026-08-15 - Clear category navigation and resilient account registration

- **Decision:** Position every desktop category flyout relative to its own trigger. Collect the selected international dialing code separately from the local mobile number, and keep registration values in the form after server-side validation fails.
- **Reason:** A shared menu position made subcategories appear disconnected from the item being explored, while account creation required customers to re-enter valid details after correcting one field.
- **Impact:** Category options open directly beneath the active navigation item. Registration validates each field with clear inline feedback, supports the UAE and regional dialing codes, and submits a single normalized phone number to the server.

## 2026-08-15 - Premium Dubai marina hero

- **Decision:** Use a locally stored, photorealistic Dubai marina image for the primary hero slide and refine the overlay, typography, and spotlight card.
- **Reason:** The previous generic photo and large decorative treatment did not communicate the brand's marine-supply focus clearly enough.
- **Impact:** The hero now has reserved copy space, visible marine equipment, stronger contrast, and an Accessory spotlight that remains readable at smaller sizes.

## 2026-08-15 - Consistent hero carousel imagery

- **Decision:** Use three locally stored, photorealistic Dubai marine scenes for the homepage carousel and ignore additional legacy banner image artwork.
- **Reason:** The rotating legacy graphics broke the premium visual consistency of the redesigned hero.
- **Impact:** Every carousel state uses the same visual language while existing banner titles, descriptions, and call-to-action text continue to work.

## 2026-08-15 - Live new-product spotlight

- **Decision:** Replace decorative spotlight images in the hero with the latest catalogue products, their prices, and direct shopping actions.
- **Reason:** The hero secondary panel should help customers shop instead of repeating generic marine imagery.
- **Impact:** Newly added products receive a useful, data-driven storefront placement without additional administrator work.

## 2026-08-15 - Clear contact affordance

- **Decision:** Remove the desktop Quick quote header link and retain one visible WhatsApp icon button in the lower-left corner.
- **Reason:** A single labelled contact affordance is clearer and avoids duplicating the same external action in the header.
- **Impact:** The header has more room for search and account controls while WhatsApp remains readily accessible with a 56 px touch target.

## 2026-08-15 - Uncluttered local storefront preview

- **Decision:** Disable the Next.js development route indicator in the application configuration.
- **Reason:** Its lower-left badge overlaps the storefront's intended WhatsApp contact control during local review.
- **Impact:** Development errors remain visible, while the page preview accurately reflects the production contact layout.

## 2026-08-15 - Product-led storefront content order

- **Decision:** Keep the hero's Accessory spotlight with three photorealistic marine-item images, position the brand rail before Shop by Category, and remove the bulk-order promotion block.
- **Reason:** The storefront should lead with relevant products and brand discovery without an extra sales message competing for attention.
- **Impact:** Customers encounter marine safety, anchoring, and pump imagery in the hero, then can browse brands before categories.

## 2026-08-15 - Simplified storefront promotions

- **Decision:** Remove the Safety bundle and Mooring essentials promotional cards from the homepage.
- **Reason:** These duplicate categories already available through the primary browsing paths.
- **Impact:** The product carousel follows the category discovery content without redundant promotional detours.

## 2026-08-15 - Direct catalogue browsing

- **Decision:** Remove the Latest projects gallery, rail scrolling hints, and visible Featured badges from customer product views.
- **Reason:** They add repeated visual messages without helping customers find or assess products.
- **Impact:** Product browsing is less cluttered; the internal featured flag can still support administration without being shown to customers.

## 2026-08-15 - Simplified hero carousel panel

- **Decision:** Remove the homepage hero's catalog CTA and numeric product, rail, and dispatch counters, replacing the panel with three relevant marine-item images.
- **Reason:** The carousel should remain product-focused without redundant operational counters.
- **Impact:** The hero continues to support its primary category action while presenting safety, anchoring, and pump imagery.

## 2026-08-15 - Table-first catalog administration

- **Decision:** Present products, brands, and categories as management tables, with creation and editing performed in focused modal forms. Hide SKU from all user-facing workflows and generate it internally.
- **Reason:** Administrators requested a faster, more familiar catalogue workflow without maintaining technical product references.
- **Impact:** Actions retain accessible labels and 44 px touch targets; the database SKU remains unique without being an administrator input.

## 2026-08-15 - Admin-managed catalog imagery and UAE delivery rule

- **Decision:** Require uploads for new products, categories, and brands; allow an administrator to replace existing imagery. Store files under the server's public uploads directory and persist their paths in MySQL.
- **Reason:** The catalogue needs administrator-owned imagery instead of manual path entry.
- **Impact:** Supported images are JPG, PNG, and WebP up to 5 MB. The checkout and its API calculate AED 20 delivery below AED 700 and free UAE delivery from AED 700.

## 2026-08-15 - Use MySQL for Hostinger production deployments

- **Decision:** Replace the SQLite runtime with MySQL through Sequelize.
- **Reason:** Hostinger's Node runtime cannot load the `sqlite3` native binary because it requires GLIBC 2.38; MySQL is managed and durable on the hosting plan.
- **Impact:** Database configuration is supplied only through server-side environment variables, schema initialization is MySQL-compatible, and dynamic routes defer database access until runtime.

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

## 2026-08-19 - Strict main-category and subcategory workflow

- **Decision:** Limit the catalogue to two levels: main category and subcategory. Administrators create a main category first, then create its subcategories from that main category; products can only be assigned to a subcategory.
- **Reason:** The customer navigation has a single submenu level. Allowing further nesting made products difficult to discover and produced categories that the menu could not display.
- **Impact:** The UI preserves English and Arabic names for both levels, server-side validation prevents crafted third-level records and invalid product assignments, and legacy deeper records are re-parented to their main category during initialization.

## 2026-08-19 - Remove category featured flag from administration

- **Decision:** Remove the Featured category toggle from category creation and editing.
- **Reason:** It has no distinct customer-facing behaviour and makes the category form harder to understand.
- **Impact:** Existing stored values are retained for compatibility, but new categories default to false and administrators only control whether a category appears on the homepage.

## 2026-08-19 - Database-backed Shop by category cards

- **Decision:** Render the storefront Shop by category cards from main categories in the database, using their uploaded category images.
- **Reason:** Hard-coded category names and stock images diverged from the categories an administrator manages.
- **Impact:** Selecting a main category filters the catalogue to all products assigned to its subcategories; an empty catalogue shows an explanatory empty state instead of static cards.

## 2026-08-20 - Persist catalogue uploads outside deployments

- **Decision:** Store administrator-uploaded product, category, and brand images in `CATALOG_UPLOADS_DIRECTORY`, outside the Git deployment directory, and serve validated files through the application’s `/uploads/*` route.
- **Reason:** Git deployments replace the application runtime and previously removed files written beneath `public/uploads`, while MySQL retained their paths.
- **Impact:** Production defaults to a directory under the server account home folder and can use `CATALOG_UPLOADS_DIRECTORY` to override that location. Existing missing files still need to be restored from an original source or backup; all new uploads persist through redeployments.

## 2026-08-19 - Disable automatic demo seeding

- **Decision:** Do not create demo users, brands, categories, products, or homepage banners when the application starts.
- **Reason:** The local database is being used for real catalogue setup, not a demo, and automatic seed records reappeared after a reset.
- **Impact:** Schema initialization remains automatic, while seed data requires the explicit `SEED_DEMO_DATA=true` environment setting.

## 2026-08-19 - Remove category custom fields from administration

- **Decision:** Remove custom-field creation and display from the category administration workflow.
- **Reason:** Product specifications do not yet consume those fields, so showing them while creating a subcategory is confusing and provides no customer-facing value.
- **Impact:** Administrators now create only the category structure and image. Existing database field records remain untouched for compatibility but are no longer shown or created.

## 2026-08-19 - Always show taxonomy in navigation

- **Decision:** Display every main category and its subcategories in customer navigation, whether or not products have been assigned yet.
- **Reason:** Administrators need to confirm newly created category structure immediately. Product-dependent filtering concealed correct new records and made the setup appear broken.
- **Impact:** The navbar and mobile category menu now reflect the database taxonomy immediately. The category admin table shows only main categories, with a modal for each category's subcategory management.

## 2026-08-19 - Separate navigation from Shop by category placement

- **Decision:** Show all categories in navigation by default, and use the category placement checkbox only for main-category cards in Shop by category.
- **Reason:** Navigation represents the complete catalogue structure, while Shop by category is a curated homepage section and needs an explicit administrator choice.
- **Impact:** The checkbox is hidden for subcategories, renamed to Show in Shop by category for main categories, and no longer affects navbar visibility.

## 2026-08-19 - Keep Shop by category cards flat

- **Decision:** Do not display a subcategory count on Shop by category cards.
- **Reason:** The cards should introduce main categories only; the navbar hover menu is the dedicated place to explore their subcategories.
- **Impact:** Homepage category cards now show only the selected main category and its product link.

## 2026-08-19 - Open subcategories on main-category click

- **Decision:** A main category with children opens its dropdown on click as well as hover.
- **Reason:** Selecting the main category previously closed the dropdown immediately, which made the expected subcategory list appear missing.
- **Impact:** Customers can use hover, click, or keyboard to open the submenu, then choose a subcategory or View all for the main category.

## 2026-08-19 - Persist the active subcategory dropdown

- **Decision:** Keep a selected main category's dropdown visible until another navigation choice is made.
- **Reason:** The active styling without a visible submenu was confusing and made it look as though subcategories were missing.
- **Impact:** After selecting a main category, its subcategories remain visibly available directly below the navbar item.

## 2026-08-19 - Prevent category-menu clipping

- **Decision:** Use a wrapping desktop category navigation row instead of a horizontal-scroll container.
- **Reason:** The scroll container clipped the absolutely positioned submenu, leaving it in the DOM but invisible on screen.
- **Impact:** Navbar subcategory menus can extend below the category row and remain visible for hover or click selection.

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
