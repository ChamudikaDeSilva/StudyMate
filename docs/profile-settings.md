# Profile settings

Open **Profile → Edit profile** to update your name and email address. Name changes only need a valid name. Changing your email also requires your current password. The email is trimmed and lowercased and cannot already belong to another account. Double-check the address: it becomes your sign-in email immediately, without an email verification message.

Open **Profile → Change password** and enter your current password, a different new password of 8–128 characters, and the matching confirmation. Password spaces are preserved. Both forms show validation and backend errors inline and block duplicate submissions while saving. Closing an editor discards its unsaved values.

Name and email changes update the shared account state, including the Home greeting and account initials. Email and password changes revoke earlier backend sessions. This device receives a new bearer token and stays signed in. If secure storage fails after the server has saved a change, the app explains that the change succeeded and asks you to sign in again with your updated credentials. Passwords stay in the editor's memory and are not stored on the device.

These are signed-in account settings and do not require SMTP. Password recovery is not included.

Account changes require an online, validated session. The updated profile is saved with its token for offline restarts; see [offline sessions](offline-sessions.md) for reconnection behavior and verification steps.

## Backend setup

Run `alembic upgrade head` from LearnLoopBackend before restarting its API. Migration `8a74c561f903` adds or adopts `users.auth_version` while preserving existing values. The migration must run online to inspect the current schema. See the backend's `docs/profile-settings.md` for details and isolated test instructions.

## API contracts

Both endpoints require a bearer token and return `{user, access_token, token_type}` matching the login response.

| Endpoint | Request |
| --- | --- |
| `PATCH /api/v1/auth/me` | `{name, email, current_password?}`; omit the password for an unchanged email |
| `POST /api/v1/auth/change-password` | `{current_password, new_password}` |

Name-only saves preserve existing sessions. Current-password checks are rate limited; with multiple backend processes, use a shared limiter for consistent limits across instances.
