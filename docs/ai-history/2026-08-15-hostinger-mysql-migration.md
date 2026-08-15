# 2026-08-15 - Hostinger deployment and MySQL migration

## Request

Diagnose the failed Hostinger deployment for Marsa Edge Marine and migrate the runtime away from SQLite.

## Outcome

The Hostinger build log showed that `sqlite3` failed to load because the runtime lacks GLIBC 2.38. The application now uses MySQL through Sequelize, initializes MySQL-compatible tables and seed data at runtime, uses MySQL upserts/date functions, and renders database-backed routes dynamically so the build does not access production data.

## Verification

`npm run typecheck`, `npm run lint`, and `npm run build` pass locally.

## Deployment follow-up

Hostinger requires `mysql2` to be imported explicitly because Sequelize loads the driver dynamically. The connection factory supplies the imported driver to Sequelize, ensuring that Next.js includes it in the server bundle.

The first production initialization exposed a MySQL query using the reserved `key` identifier without quoting it. The seed-version lookup now quotes that identifier consistently with the schema and insert statement.
