# 2026-08-09 - Render Free test deployment setup

- Added `render.yaml` to describe a free Node web service: dependency installation, production build, and port-aware Next.js start command.
- Ensured the SQLite parent directory exists at runtime, allowing a fresh temporary demo database to initialize on Render.
- Configured Render's build environment to install Tailwind's development-only build dependency before running the production build.
- Moved Tailwind's PostCSS build packages into regular dependencies after Render's production install omitted them during the first deployment.
- Updated the Render build command to explicitly include all development dependencies required by the Next.js TypeScript build.
- Configured `sqlite3` to compile from source during Render builds because its Node 24 prebuilt binary requires GLIBC 2.38, which is unavailable in the free runtime.
- The deployment is intentionally non-persistent: the test catalog re-seeds when the free service restarts or redeploys.
