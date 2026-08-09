# 2026-08-09 - Render Free test deployment setup

- Added `render.yaml` to describe a free Node web service: dependency installation, production build, and port-aware Next.js start command.
- Ensured the SQLite parent directory exists at runtime, allowing a fresh temporary demo database to initialize on Render.
- The deployment is intentionally non-persistent: the test catalog re-seeds when the free service restarts or redeploys.
