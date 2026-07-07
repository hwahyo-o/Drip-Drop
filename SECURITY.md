# Security

## Secrets

- `.env` and `.env.*` are local-only files and must not be committed.
- Do not expose IPstack keys directly in browser JavaScript.
- Do not commit live Google API keys or Firebase config values. `js/firebaseConfig.js` is a safe template in the repository, and GitHub Actions overwrites it from repository secrets during Pages deployment.
- Firebase Web API keys are not sufficient authorization by themselves, but exposed keys can still be abused if Google Cloud API restrictions, Firebase Auth authorized domains, or Firestore Rules are weak.

## Secret Scanning Response

If GitHub reports a Google API Key leak:

1. Rotate the exposed key in Google Cloud Console or Firebase Console.
2. Restrict the replacement key to the required HTTP referrers, such as the GitHub Pages domain and local development origin.
3. Restrict the key to the APIs actually used by Drip Drop.
4. Store the replacement values in GitHub repository secrets, not in source files.
5. Redeploy and confirm `js/firebase.js` no longer contains literal key values.

Required GitHub Actions secrets for deployment:

```text
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID
```

## Firebase Rules Principles

- Public users may read approved cafe documents and public community posts.
- Signed-in users may create and update only their own profile, favorites, reviews, posts, comments, and reactions.
- Only admins may create, update, or delete cafe records and moderation fields.
- Admin status must be checked from trusted Firestore user records or custom claims, not by UI-only checks.

## Privacy

- Store only profile data needed for recommendations.
- Avoid storing precise user location history unless the user explicitly saves it.
- Annual reports should be generated from user-owned activity data.
