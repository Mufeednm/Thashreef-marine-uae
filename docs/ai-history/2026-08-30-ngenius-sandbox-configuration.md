# N-Genius Online sandbox configuration

## Outcome

An existing N-Genius Online sandbox account was verified in the official portal. Its existing service account and active outlet were identified and their test-only values were saved in the ignored `.env.local` file.

## Repository convention

`.env.example` now documents the N-Genius environment variable names without containing a credential. Checkout uses the N-Genius hosted payment page; its return and webhook endpoints independently verify the remote payment before completing a local order.

## Security

Never commit or paste the API key, outlet reference, login password, or production payment secrets into source files, documentation, chat, or Git history.
