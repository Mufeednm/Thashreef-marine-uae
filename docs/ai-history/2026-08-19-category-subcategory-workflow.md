# 2026-08-19 - Main-category and subcategory workflow

## Request

Make the administration workflow match the storefront navigation: create main categories, add subcategories inside them, and assign products only to subcategories while retaining English and Arabic names.

## Changes

- Replaced the default browser-tab favicon with a square Marsa Edge Marine mark.
- Updated the persistent storefront WhatsApp button to open a chat with 0527035250.
- Reworked the category manager into a visible main-category and subcategory tree.
- Added an **Add subcategory** action on every main-category row.
- Removed arbitrary parent selection and lock a category's type and parent after creation.
- Enforced the two-level hierarchy in the application service and repository checks.
- Restricted product category selectors to direct subcategories of main categories.
- Corrected category image validation so an edit without a replacement image succeeds.
- Converted the seeded AIS & Radar entry into a Navigation subcategory and normalized legacy deeper entries on application initialization.
- Made the local seed recover when the brands, categories, and products tables have all been cleared but the catalogue seed marker remains.
- Removed the unused Featured category control; existing stored values remain unchanged and newly created categories use `false` internally.
- Replaced Shop by category static cards with database-backed main categories, their uploaded images, and a main-category product filter that includes every subcategory product.
- Fixed unchecked Show on homepage and omitted main-category custom fields so their `null` form values pass server-side validation.
- Disabled automatic demo seeding. The app now creates only the database schema unless `SEED_DEMO_DATA=true` is explicitly set.
- Removed the unused Custom fields control and custom-field displays from category administration. New categories now create with no custom fields.
- Removed the product-assignment filter from customer category navigation, so newly created categories appear immediately. Reworked the category table to show main categories only and manage each category's subcategories in a dedicated modal.
- Separated navigation from homepage placement: all categories appear in the navbar, while a main-category-only Show in Shop by category option controls the Shop by category cards.
- Removed subcategory counts from Shop by category cards; subcategories are now presented only through the navbar hover menu.
- Changed main category clicks to open their subcategory dropdown; View all remains available inside the dropdown.
- Kept the selected main category's dropdown visible so the active navbar state always exposes its subcategories.
- Replaced the full-width subcategory row with a compact, subcategory-only dropdown anchored to its main category. The dropdown is rendered above page layers, stays open after a click, and retains keyboard access.

## Verification

- Run ESLint, TypeScript validation, and a production build after implementation.
