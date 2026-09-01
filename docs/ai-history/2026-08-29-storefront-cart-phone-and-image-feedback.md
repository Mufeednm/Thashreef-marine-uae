# Storefront cart, phone, and image feedback

Updated the storefront so adding a product does not interrupt shopping by opening the cart drawer. Added a clear registration-name placeholder, digit-aware mobile-number guidance and validation at checkout, and a fallback marine-product image for unavailable product image URLs. The server-side order and Stripe checkout routes now enforce the same international-phone length requirement.

Follow-up: added practical placeholders to the admin username and password fields, plus every editable checkout detail field.

Follow-up: added a committed `.env.example` and `docs/LocalDevelopment.md` so future local runs identify the `akbar_ecommerce` database convention and the SMTP dependency for customer email OTPs without exposing credentials.

Follow-up: changed checkout delivery country to a native typed suggestion field, preserving manual typing for every other address detail.

Follow-up: made the regional address field adapt to the delivery country—Emirate for UAE, typed State / province for international delivery addresses—and updated checkout API validation accordingly.
