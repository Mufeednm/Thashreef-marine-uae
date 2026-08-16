# 2026-08-15 - Catalog uploads, return policy, and delivery rule

## Request

Allow administrators to upload images for products, categories, and brands; remove the four storefront trust statements; make the customer navbar more compact on phones; add the Marsa Edge Marine return/refund policy; and calculate UAE delivery by order value.

## Outcome

New catalog records require a validated JPG, PNG, or WebP upload up to 5 MB. Existing records can have their images replaced by an administrator. Brand image paths are persisted in MySQL and rendered in the storefront brand rail. The trust strip has been removed, the footer now opens a dedicated Return & Refund policy page, and mobile header navigation prioritizes the category drawer.

Checkout now charges AED 20 below AED 700 and provides free UAE delivery at AED 700 or above. The same calculation is enforced by the order API, so the stored order total cannot be modified by the browser.

## Follow-up

The catalog administration experience was changed to table-first Products, Brands, and Categories screens. Each screen offers a Create action that opens a modal and compact View, Edit, and Delete icon actions. SKU entry and display were removed; new products receive an internal UUID-derived reference to preserve the database uniqueness constraint. Footer location details now show Marsa Edge Marine, Dubai, Al Jaddaf, Drydocks.

The hero carousel's Shop essentials/counter panel was simplified to three labelled marine-item images: safety gear, anchoring, and pumps.

## Storefront content follow-up

The Accessory spotlight heading was restored and its imagery was replaced with three locally stored, photorealistic images of a marine life jacket, anchor and rope, and bilge pump. The Brand rail now appears before Shop by Category. The bulk-order promotional copy and call to action were removed from the customer storefront.

The separate Safety bundle and Mooring essentials promotional cards were also removed, leaving the storefront focused on the hero, brand/category discovery, and product browsing.

The Latest projects gallery and all Swipe or scroll rail hints were removed. Customer-facing Featured badges were removed from product cards and detail pages; the corresponding product rail is now titled Recommended Products.

## Hero quality follow-up

The primary hero slide now uses a locally stored photorealistic Dubai marina scene. The hero was shortened, the headline scale and overlay were refined for legibility, and the Accessory spotlight panel was strengthened with clearer supporting copy and card contrast.

The carousel was limited to three slides and all of its old banner artwork was replaced with matching locally stored photorealistic Dubai marina, marine safety, and maintenance scenes.

The hero secondary panel now presents real newly added products from the catalogue with each product image, price, detail link, and Add to cart action instead of decorative category imagery.

The header Quick quote action was removed. The persistent lower-left contact control is now a high-contrast WhatsApp icon button with an accessible label and touch-friendly target.

The Next.js development route indicator was disabled so the local preview does not place a separate badge beside the WhatsApp control.

## Navigation and registration follow-up

Desktop category submenus now use the hovered category as their positioning anchor, so their panels open directly below the relevant item. Customer account creation includes a country-code selector alongside the local mobile number. Validation responses provide field-specific inline messages, and the registration form retains the customer's entered details while they correct an error.

## Catalogue and order-administration follow-up

Product setup now supports a primary image and two optional gallery images. The administrator sees image previews before saving, and the customer product page lets shoppers switch between all saved images. Checkout now persists the entered delivery address with each new order. The admin Orders page opens customer contact information, delivery address, and ordered item details in a dialog, with an authenticated PDF download for each order.

## Admin workspace standardisation follow-up

The admin dashboard and product table no longer surface Variants. The product, brand, and category View actions now keep the administrator on the relevant management screen and show a focused detail modal. Product detail modals include image gallery, pricing, category, status, and creation details; brand and category modals present their record information without navigating to the public storefront.

## Form and gallery follow-up

Manual multipart form attributes were removed from all server-action upload forms, resolving the React console error during create and edit actions. The product creation flow now starts immediately with Product details. Customer product cards show a photo count for products with two or three images, and customers can select those images from the product detail gallery.

## Gallery upload size follow-up

The Next.js Server Action body limit is now 16 MB, which accommodates a multipart request containing the maximum three 5 MB product images. This prevents the browser's generic Failed to fetch error while preserving per-file validation limits.

## Customer account security follow-up

Customer registration now hashes passwords using salted scrypt before they reach the repository. User and customer-profile inserts run in a single MySQL transaction so a registration cannot leave incomplete records behind. Login only accepts the hashed password format, and seeded local accounts are converted to scrypt hashes when the application initializes.

## Local-account cleanup follow-up

The demo staff/customer records and visible credential list were removed. The local database was verified and cleaned so only the administrator record remains, then its requested password was saved as a new scrypt hash. Successful administrator sign-in now routes directly to the protected admin workspace.

## Contact uniqueness follow-up

Customer email remains unique in the users table, and the full stored international phone number is now unique in customer profiles. Registration checks the selected country code plus mobile number before creating an account, while a MySQL unique index provides a race-safe final safeguard.

## Checkout confirmation follow-up

VAT was removed from both the client checkout calculation and server-side order total, leaving product subtotal plus the applicable UAE delivery fee. The completion page now confirms that the request was received, shows the total, explains the availability review, and identifies the email address that will receive the confirmation and next steps.

## Parcel-label printing follow-up

Order actions now open an authenticated print view rather than downloading a PDF. The rectangular 100 × 150 mm parcel label includes Marsa Edge Marine LLC, the order number and date, recipient name, delivery address, saved mobile number, and every product with its quantity. The page automatically requests printing and still provides a manual print button for browser fallback.

## Administrator sign-in follow-up

The local bootstrap administrator remains seed-backed and is re-created when a fresh database initializes, but its credentials are no longer displayed in the interface or README. The sign-in form now presents Username and Password fields, validates the username directly, and sends authenticated administrators to the protected `/admin` workspace.

## Brand identity follow-up

Brand administration no longer asks for a separate logo label. The uploaded brand image is mandatory when creating a brand and when saving any older brand record that lacks an image. A compact image thumbnail now leads the table and detail views, while the internal compatibility label is derived from the brand name.

## Storefront brand image follow-up

Storefront brand cards now give the uploaded image a larger dedicated area, making brand recognition clearer on touch devices and desktop. The public brand catalogue page also uses that image in its header.

## Catalogue ordering follow-up

Display Order was removed from every administrator-facing brand and category view, including create/edit forms, tables, and detail dialogs. The existing stored value remains only as a stable internal sort fallback, so no presentation order changes unexpectedly after the admin control is removed.

## Account, category, and email follow-up

Customer and administrator sign-in now use an email address and password; the form no longer accepts a username. Category editing rejects any parent selection that would place a category beneath itself, one of its descendants, or an already looping parent chain. Order confirmations are now sent via Nodemailer when `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` are configured in `.env.local`; the order remains recorded if that separate mail delivery fails or is not configured.

## Administrator login compatibility follow-up

The sign-in form now accepts either a username or email address. This preserves the requested seeded administrator access through `admin` and its configured password, while customer registration continues to require an email address and all stored passwords remain salted hashes.
