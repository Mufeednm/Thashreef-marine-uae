# 2026-08-20 - Admin security and product publication controls

## Request

Add an administrator password-change option requiring the existing password, a visible/hidden product control in the admin product table, and product search plus brand and subcategory filters.

## Implementation

- Added a Security entry to administrator navigation with an admin-only password-change form.
- Validated current, new, and confirmation passwords with Zod; the application service confirms the current salted hash before saving a new salted hash.
- Added the repository and application boundaries needed for password and product-publication updates.
- Added an accessible Visible/Hidden switch to each product row and excluded hidden products from every public catalogue route while retaining them for administrators.
- Added client-side table filtering by product name (English or Arabic), brand, and subcategory.
- Close each administrator create dialog only after the relevant server action succeeds, returning the user to the refreshed table while preserving validation errors in the dialog.

## Verification

- `eslint .` passed.
- `tsc --noEmit` passed.
- `next build` passed, including `/admin/settings`.
