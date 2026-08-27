# 2026-08-26 - Email OTP customer authentication

## Request

Replace the normal customer password flow with email OTP registration and sign-in, while keeping `/admin/login` as username and password only.

## Implementation

- Added email OTP request and verification server actions for customer registration and sign-in.
- Added an `email_otp_challenges` MySQL table for hashed codes, expiration, attempt tracking, one-time use, and resend throttling.
- Added SMTP OTP email delivery using the existing server SMTP configuration.
- Removed customer password and mobile-number requirements from the current customer form. Customer profiles created through email verification leave phone empty until the requested future SMS flow is added.
- Kept administrator sign-in on its existing username/password route.

## Production setup

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in Hostinger before deployment. The sender domain must have SPF and DKIM configured. Hostinger's current mailbox limit is 100 emails per day, so move OTP delivery to a transactional provider before regular customer volume exceeds that limit.
