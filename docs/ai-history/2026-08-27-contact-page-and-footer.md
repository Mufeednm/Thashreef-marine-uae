# 2026-08-27 - Contact page and footer

## Request

Add a Contact Us experience inspired by the provided Rimal Marine reference page and improve the storefront footer with the supplied WhatsApp and Instagram details.

## Implementation

- Added `/contact` with a validated enquiry form that emails the configured sales mailbox through SMTP, plus prominent WhatsApp support, phone, email, Dubai address, and Instagram details.
- Reworked the storefront footer into a support hub with clear Contact Us, WhatsApp quote, order-help, return/refund, phone, email, address, and social links.
- Uses the same SMTP configuration as customer OTPs and order confirmations; the customer email is set as Reply-To and WhatsApp remains available if delivery is unavailable.
- Replaced the footer Contact our team button with compact, labelled WhatsApp and Instagram SVG links.
- Removed the duplicate Instagram text link from the footer contact column and reused the shared footer on the redesigned Return & Refund page.
- Added customer-only order history with each order’s items, total, delivery details, and status. Checkout now blocks incomplete mobile and address information before moving ahead, and confirmation emails say that later updates will follow.
- Redesigned `/account` as the customer profile and order centre rather than a plain order list.
- Removed the unused subcategory image upload, keeping imagery only for customer-facing main-category cards.
- Added main-category image thumbnails to the Categories administration table, matching the Brand list.
- Saved the product image URL with each new order item and display it beside the product in My Orders. Older records fall back to a matching current catalogue image or a neutral placeholder.
- Added a Stripe test-mode card-payment path using Stripe-hosted Checkout. New card orders are saved as pending, while the signed Stripe webhook is responsible for marking payment paid and sending the confirmation email.
- Corrected test-mode completion so unpaid attempts are not shown to the customer, while a server-verified successful return marks the order paid and sends the email before a public webhook is available locally.
- Added browser-local checkout-detail saving after a customer continues through validated checkout steps, so their phone and delivery address are prefilled for the next checkout in the same browser.
- Added an accessible country calling-code selector next to the checkout mobile-number input. The selected code and number are saved together and sent as one formatted international phone number with the order.
- Fixed Stripe Checkout return links for Hostinger by using the configured public site address instead of its internal proxy address.
