<!-- BEGIN:nextjs-agent-rules -->

# Project Development Rules

- Before starting or diagnosing the local application, read `docs/LocalDevelopment.md`. It contains the non-secret local database convention and the required SMTP setup for customer OTPs.

- TypeScript stays strict; do not introduce `any` without a documented exception.
- UI components do not contain business logic. Use `src/application`, `src/domain`, and `src/infrastructure` boundaries.
- Organize future features in `src/features/<feature>` and validate all external input with Zod.
- Use parameterized database access, server-side authorization, and no secrets in Git.
- Update documentation, CHANGELOG.md, the decision log, and AI history with each meaningful task.
- Run linting, type checking, and production build checks before conventional commits.

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
