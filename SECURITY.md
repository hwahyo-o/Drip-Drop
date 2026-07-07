# Security

## Secrets

- `.env` and `.env.*` are local-only files and must not be committed.
- Do not expose IPstack keys directly in browser JavaScript.
- Firebase Web config can be present in client code, but access must be protected by Firebase Authentication, Firestore Rules, and authorized domains.

## Firebase Rules Principles

- Public users may read approved cafe documents and public community posts.
- Signed-in users may create and update only their own profile, favorites, reviews, posts, comments, and reactions.
- Only admins may create, update, or delete cafe records and moderation fields.
- Admin status must be checked from trusted Firestore user records or custom claims, not by UI-only checks.

## Privacy

- Store only profile data needed for recommendations.
- Avoid storing precise user location history unless the user explicitly saves it.
- Annual reports should be generated from user-owned activity data.
