# Offline sessions

After a successful sign-in or session check, LearnLoop AI stores the bearer token and the authenticated profile together in one versioned Keychain record. The profile contains only the account ID, name, email, and timestamps. Passwords are never included. Profile and password changes replace the token and profile together.

An app restart without connectivity restores that secured profile and opens the existing account's local library. A failed network request or a server error does not delete the session. Only content already cached on this device is available; new AI generation, quiz submission, and account changes require a connection.

When connectivity returns, the app checks the original token through `GET /auth/me` before replaying queued changes. A 401 or 403 response clears the session and asks the user to sign in again. A response identifying a different account is also rejected. Transport failures and server errors preserve local access while synchronization remains blocked. Validation retries on the next reconnection or when the app returns to the foreground.

Each sync run captures its account and token. A logout, account update, connection change, or another sign-in invalidates the run before its next queued operation. An operation already accepted by the server completes its cache and queue bookkeeping under the original account. JSON and file uploads keep the captured token throughout the run, so another account's token cannot be substituted.

## Boundaries

- Existing installations with a token-only Keychain record need one successful online session check or sign-in to acquire the profile snapshot. They cannot identify the previous account offline until that migration succeeds.
- An expired or remotely revoked token can still open previously cached local content while offline. The device cannot detect remote revocation without connectivity. Online validation remains mandatory before queued replay; there is no refresh-token flow.
- Signing out removes the token and profile snapshot. Per-user study caches and pending changes remain isolated by account ID and become accessible again only through that account's session.
- A secure-storage failure prevents saving a new offline snapshot. Credential changes keep the existing behavior of requesting a new sign-in if the server succeeded but the replacement session could not be stored.

## Manual verification for the report

1. Sign in online, open subjects and materials, and generate any study resources needed for the demonstration.
2. Enable airplane mode, close the app completely, then reopen it. Verify the same account, cached subjects/materials, and saved study resources are available without a login prompt.
3. Make an offline subject or material change. Reopen again and confirm it remains pending.
4. Restore connectivity. Confirm `/auth/me` succeeds before queued writes, and pending changes synchronize to the same account.
5. Repeat with a token revoked on the backend. On reconnect, confirm sign-in is requested and the queue is not replayed. Sign in as a different account and confirm the previous account's pending changes are absent.

Use a build with its JavaScript bundle included for a full airplane-mode cold-start demonstration; a development build may need Metro to load the bundle.

Automated coverage is in `OfflineSessionContext.test.tsx`, `TokenStorage.test.ts`, and the tests under `__tests__/offline`. Device steps above are a verification procedure, not a claim that they have already been performed.

Verification on 13 October 2026: 186 functional tests pass with `npx jest --runInBand --watchman=false --testPathIgnorePatterns '__tests__/App.test.tsx'`; `npx tsc --noEmit` and ESLint on the changed TypeScript files also pass. The existing app smoke test is excluded because its Jest CSS setup does not handle `global.css`.
