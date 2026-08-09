# 2026-08-09 - Render Free test deployment setup

- Replaced manual product image path entry with validated JPG, PNG, and WebP uploads saved beneath the local public product-uploads directory.

- Fixed product creation/editing validation so unchecked placement checkboxes are recorded as disabled instead of causing null input errors.

- Improved the product form so validation responses name the specific invalid fields and required inputs are identified before submission.

- Added a dedicated administrator sign-in page and completed the active catalog CRUD workflow with product edit/delete actions.

- Converted the current customer and admin catalogue experiences to order-only mode by removing stock inputs, quantities, badges, dashboard widgets, and stock-based add-to-cart blocking.

- Removed the homepage's placeholder customer-confidence testimonials and inactive newsletter/email sign-up section.

- Added `render.yaml` to describe a free Node web service: dependency installation, production build, and port-aware Next.js start command.
- Ensured the SQLite parent directory exists at runtime, allowing a fresh temporary demo database to initialize on Render.
- Configured Render's build environment to install Tailwind's development-only build dependency before running the production build.
- Moved Tailwind's PostCSS build packages into regular dependencies after Render's production install omitted them during the first deployment.
- Updated the Render build command to explicitly include all development dependencies required by the Next.js TypeScript build.
- Configured `sqlite3` to compile from source during Render builds because its Node 24 prebuilt binary requires GLIBC 2.38, which is unavailable in the free runtime.
- The deployment is intentionally non-persistent: the test catalog re-seeds when the free service restarts or redeploys.
