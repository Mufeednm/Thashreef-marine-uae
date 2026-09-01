# Local development setup

Read this guide before starting the application locally. It records the project-specific setup that is not stored in source control.

## Required software

- Node.js 22 LTS or a supported LTS release
- MySQL 8 with phpMyAdmin (or another MySQL client)

## Database

The existing local database is named `akbar_ecommerce`. The current local MySQL setup uses:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=akbar_ecommerce
DB_USER=root
DB_PASSWORD=
DB_SSL=false
```

The empty password is intentional for this local root-account setup. Use a dedicated least-privilege account in production.

## Environment file

1. Copy `.env.example` to `.env.local`.
2. Keep `.env.local` private; it is ignored by Git.
3. Enter SMTP values if you need customer registration, customer sign-in, order emails, or Contact Us email delivery.

Customer authentication uses a six-digit code sent by email. Therefore, leaving SMTP unset makes registration and customer sign-in fail with “We could not send the verification email.” This is expected, not a database issue.

Required SMTP variables:

```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-mailbox@example.com
SMTP_PASSWORD=your-mailbox-password-or-app-password
SMTP_FROM=your-mailbox@example.com
```

Never commit or paste real SMTP credentials into source code, documentation, or chat.

## N-Genius Online sandbox payments

Card checkout uses N-Genius Online's hosted payment page. Add the sandbox values from the N-Genius portal to your private `.env.local` file:

```env
NGENIUS_ENVIRONMENT=sandbox
NGENIUS_API_KEY=your-service-account-api-key
NGENIUS_OUTLET_REFERENCE=your-outlet-reference
NGENIUS_WEBHOOK_HEADER_NAME=X-Webhook-Secret
NGENIUS_WEBHOOK_SECRET=your-random-webhook-secret
```

For a webhook, create an HTTPS endpoint in **Settings → Integrations → Webhooks** with the URL `https://your-public-domain/api/payments/ngenius/webhook`. Configure the same custom header name and secret in the N-Genius portal and deployment secret manager. The local `127.0.0.1` server is not publicly reachable, so N-Genius cannot deliver webhooks to it directly. The customer return page independently verifies payment with N-Genius; webhooks ensure a paid order is updated even if the customer closes the payment page.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`.

If the page says `Invalid server environment`, verify the database variables above. If registration shows an email-delivery error, verify all five SMTP variables and your provider’s host, port, and password requirements.

## Local media

The database may reference uploaded product, brand, and category images that are not present in a new worktree. Those requests can return 404 locally; the storefront now shows the marine fallback image for product images instead of a broken image.
