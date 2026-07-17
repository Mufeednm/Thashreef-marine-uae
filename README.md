# Thashreef-marine-uae E-Commerce

Production-oriented e-commerce platform foundation built with Next.js App Router, TypeScript, Tailwind CSS, Sequelize, MySQL, and Zod.

## Local demo

The current local testing console is branded as `Thashreef-marine-uae`. It includes:

- cookie-based local login backed by a SQLite database in `data/akbar-marine.sqlite`
- versioned SQLite catalog seeding for marine-only brands, main categories, subcategories, optional child categories, and products
- page-based admin routes at `/admin`, `/admin/products`, `/admin/products/new`, and `/admin/categories`
- admin category creation with many custom fields per category
- a public `/` storefront redesigned as a dense premium marine accessories marketplace with dynamic database-backed main-category navigation, hover mega menus for subcategories, accessory-led hero carousel, category image cards, promotional banners, six product rails, brand carousel, testimonials, gallery, newsletter, quick product views, and an interactive local cart

### Demo credentials

- Admin: `admin` / `admin123`
- Staff: `staff` / `Staff@123`
- Customer: `user` / `userpassword`

## Prerequisites

Use Node.js 22 LTS (or later supported LTS) and MySQL 8. Copy `.env.example` to `.env.local` and supply local database credentials.

## Quality checks

Run `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build` before opening a pull request. Project architecture and development rules are documented in `docs/` and `AGENTS.md`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
