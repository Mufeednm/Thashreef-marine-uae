# 2026-08-20 - Persistent catalogue uploads

## Request

Keep administrator-uploaded product, category, and brand images available after Git deployments.

## Outcome

Catalog images now write outside the deployment folder. Production uses a directory under the server account home folder by default, with `CATALOG_UPLOADS_DIRECTORY` available as an explicit override. The new dynamic `/uploads/[...segments]` route validates the two permitted URL segments before reading an image, prevents path traversal, emits the correct image content type, and applies immutable caching because each filename is a UUID.

## Follow-up

Existing broken image references remain unrecoverable until their original files are restored or re-uploaded.
