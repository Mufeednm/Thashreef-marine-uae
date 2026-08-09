# 2026-08-09 — Customer registration, orders, and brand catalogues

- Added public brand catalogue routes linked from the homepage supplier rail.
- Added customer sign-up with name, mobile, email, and password; the account/profile is stored in local SQLite and signed in immediately.
- Added a validated order API that verifies the session, recalculates product prices from SQLite, stores orders/line items, and surfaces them through the existing admin recent-orders panel.
- Added an admin customer-record page and replaced the operational-pulse section with an accessible store-activity bar chart.
- Verified with TypeScript and ESLint. The Next production build compiled and generated all routes successfully; npm then reported a Windows global-cache permission error after the build had completed.
- Fixed checkout follow-up issues: saved carts are hydrated before persistence, registered phone numbers prefill checkout, and the order endpoint returns a JSON error instead of a broken response if persistence fails.
- Replaced the generic overview bars with three time-based mini charts for customer registrations, orders, and order value across today, seven days, and the current month.
- Diagnosed the local order failure as an attempt to write a non-existent `vat_aed_cents` column in the legacy SQLite orders table; order totals still include VAT, but the unsupported column is no longer written. Restricted checkout payment to Cash on Delivery.
- Found the remaining SQLite insert failure: the legacy orders table requires `currency`. Added `AED` on all new order records, verified insert compatibility in a rollback transaction, and added Admin → Orders with server-authorized Accept and Reject actions.
- Simplified the admin header, redesigned the overview time-period analytics into readable horizontal data cards, and made global storefront search reset category scope and scroll to results.
- Simplified product creation navigation and form structure: removed the sidebar Add Product item, removed homepage order input, and made storefront placement the final section after two clear product-setup steps.
- Replaced repeated overview graphs with distinct line, bar, and revenue-ring visualizations, and removed the Catalog readiness panel.
- Refined the activity layout, removed the overview Add product shortcut, removed the Products-page catalogue introduction, and rebuilt the product table columns for coherent product-management scanning and correctly aligned actions.
- Verified the main public routes and admin sign-in at a 360px phone viewport. Fixed the storefront header search area's missing shrink constraint, eliminating unintended horizontal page scrolling while retaining intentional scrollable product/category rails.
- Replaced the overview's visually misleading mini-trends with a larger real-total comparison for customer registrations, received orders, and AED order values across defined periods. Removed the obsolete Workbook import panel and added optional SQLite-backed Arabic catalogue fields for products, categories, and brands; Arabic product names/descriptions now render on cards and product pages when that locale is selected.
- Rebranded local customer-facing pages, the admin workspace, and metadata as Marsa Edge Marine LLC. Rendered and visually checked the supplied logo PDF, then added the logo as a responsive local public asset for the storefront header.
