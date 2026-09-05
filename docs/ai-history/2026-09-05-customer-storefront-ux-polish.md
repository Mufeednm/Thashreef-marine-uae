# Customer storefront UX polish — 2026-09-05

## Request

Review the customer storefront as a first-time shopper and make focused, production-oriented UI improvements without a wholesale redesign.

## Changes

- Removed the requested redundant header status strip.
- Reduced repeated homepage rails so a small catalogue is not shown over and over.
- Added accessible product sorting to the main catalogue.
- Added a mobile search field and clear add-to-cart feedback.
- Made sale status visible on product cards and clarified delivery-pricing messaging in the cart.
- Keep the in-cart quantity visible on product cards and product detail pages; hide the related-products section when it has no results.
- Use the shared storefront footer on product-detail pages so customer support and policy links remain available throughout browsing.
- Redirect incomplete or unverified N-Genius returns back to checkout with a customer-facing recovery message instead of returning a 404 page.
- Send one SMTP customer email after an administrator accepts or rejects a new order; prevent repeat status actions from generating duplicate email.

## Verification

- Reviewed the local customer journey at `http://127.0.0.1:3000`: landing, mobile search, catalogue filtering, product page, add to cart, cart drawer, and checkout sign-in gate.
- Confirmed the cart persists into checkout and the email-OTP sign-in gate is displayed before protected checkout details.
