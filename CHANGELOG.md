# Changelog

## Unreleased

- Remove the redundant storefront status strip, reduce repeated homepage product rails, add customer-facing catalogue sorting, improve add-to-cart confirmation, provide mobile search, and clarify cart delivery messaging.
- Keep cart quantity visible on product cards and product detail pages, and omit the related-products section when no related product exists.
- Render the shared customer-support footer on product-detail pages.
- Return customers to checkout with a clear recovery message when N-Genius card payment is cancelled, incomplete, or cannot yet be verified, instead of showing a 404 page.
- Send an SMTP email when an administrator accepts or rejects a new customer order, without sending duplicate status notifications on repeat actions.
- Restore N-Genius hosted card checkout alongside Cash on Delivery now that the sandbox outlet is configured and verified.
- Use the N-Genius-supported `127.0.0.1` local return URL and allow it as a Next.js development origin so sandbox payment return and customer session cookies share one host.
- Remove the redundant merchant-workspace status strip from administrator pages.
- Temporarily hide online card payment in checkout and show it as coming soon while the N-Genius sandbox outlet is provisioned.
- Replace Stripe Checkout with N-Genius Online hosted card payment, server-side return verification, and a secret-header-protected N-Genius webhook endpoint.
- Record N-Genius Online sandbox configuration placeholders without committing test credentials.
- Stop automatically opening the cart after adding an item.
- Add registration name guidance, checkout mobile-number validation, and a product-image fallback.
- Add missing placeholders to the admin sign-in and checkout fields.
- Add a committed environment template and a project-specific local-development guide for MySQL and SMTP setup.
- Make the checkout delivery-country field searchable while keeping the remaining address details as typed inputs.
- Make the checkout regional field country-aware: Emirate for UAE and typed state/province elsewhere.

- Use the configured public website address for Stripe Checkout return links, preventing Hostinger's internal server address from appearing after successful payment.
- Add an international country calling-code selector to checkout mobile-number entry and preserve the selected code with saved delivery details.
- Save each signed-in customer's validated phone and delivery details in their current browser when they continue through checkout, then prefill them on the next checkout.
- Add Stripe test-mode hosted card checkout with server-calculated product totals, protected customer sessions, pending/paid payment states, secure return verification, and a signed webhook route for final payment confirmation and email delivery.
- Keep incomplete Stripe card-payment attempts out of the customer My Orders page; complete a server-verified successful Stripe return immediately so local testing shows a paid order and sends its confirmation email even before a public webhook is configured.
- Add a dedicated Contact Us page and improve the storefront footer with direct WhatsApp, phone, email, Instagram, address, and support links.
- Send Contact Us form enquiries to the configured sales mailbox through SMTP, with WhatsApp as the delivery fallback.
- Replace the footer Contact our team button with accessible WhatsApp and Instagram icon links.
- Add customer-only My Orders pages with recent order status, items, totals, and delivery details; add a direct My orders link after sign-in.
- Require mobile and complete delivery details before checkout can proceed, harden server-side checkout validation, and clarify order-confirmation emails that further updates are coming soon.
- Redesign the Return & Refund page to match the storefront and use the shared footer; remove the duplicate Instagram text link from the footer contact column.
- Redesign `/account` as a customer profile page with account details, navigation, order metrics, and cleaner recent-order cards.
- Save a product-image snapshot with each new order and show it beside the product in My Orders; earlier orders use the current matching catalogue image when available, otherwise a placeholder.
- Remove the unused subcategory image requirement; only main categories now collect category imagery for customer-facing cards.
- Show each main category's uploaded image as a thumbnail in the admin Categories table.
- Permit an intentionally empty `DB_PASSWORD` value for the common local WAMP/XAMPP root-account setup while continuing to require the environment variable.
- Replace customer email/password authentication with secure six-digit email OTP registration and sign-in. Keep `/admin/login` username/password-only, persist hashed OTP challenges with a 10-minute expiry, five-attempt limit, and one-minute resend cooldown, and send OTPs through the configured SMTP service.
- Store administrator-uploaded catalogue images in a configured persistent directory and serve them through a validated `/uploads/*` route, preventing Git deployments from deleting future product, brand, and category images.
- Close administrator create modals automatically after a successful product, brand, main-category, or subcategory save so the refreshed table is immediately visible.
- Add an administrator-only Security page that verifies the current password before securely replacing it with a new password.
- Add accessible per-product Visible/Hidden toggles in the admin table; hidden products are excluded from all storefront listings and product detail pages.
- Add admin product-table search by English or Arabic name, plus brand and subcategory filters.
- Replace the browser-tab icon with a square Marsa Edge Marine mark.
- Point the storefront WhatsApp contact button to the requested UAE number, 0527035250.
- Use a compact, click-pinned subcategory-only dropdown directly below the hovered main category. It is rendered above page layers so it cannot be hidden by the storefront hero.
- Remove subcategory counts from Shop by category cards; subcategories are exposed only through the navigation menu.
- Make the category visibility checkbox control only the storefront Shop by category cards. The navbar always displays the full category structure.
- Show every administrator-created main category and subcategory in the storefront navigation immediately, even before products are assigned.
- Simplify category administration to a main-category table; selecting a main category now opens a dedicated modal to list, add, edit, and delete its subcategories.
- Remove the unused custom-fields input and custom-field displays from category and subcategory administration.
- Disable automatic dummy users, catalogue records, and homepage banners. The database now starts empty unless `SEED_DEMO_DATA=true` is explicitly configured.
- Allow category creation and edits when Show on homepage is unchecked; the unchecked value now correctly saves as hidden instead of failing form validation.
- Replace the storefront Shop by category static cards and stock images with main categories and uploaded category images from the database; selecting a category shows products from its subcategories.
- Remove the unused Featured category option from the administrator category workflow while preserving existing stored values.
- Enforce a two-level category taxonomy: administrators create main categories, then add subcategories from the corresponding main-category row; products can only be assigned to those subcategories.
- Preserve English and Arabic category names in the main-category and subcategory workflows, repair legacy nested category records into the two-level hierarchy at startup, and fix category edits that previously failed when no new image was supplied.
- Restore the built-in catalogue only when all three catalogue tables have been cleared while the seed marker remains, avoiding a blank local storefront after a partial local reset.
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
