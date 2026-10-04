# IXZZY mobile app

This Expo app is being built alongside the IXZZY Next.js shop. It uses the shop's API; it does not connect directly to Supabase.

## What works in this first app slice

- Browse the same catalog as the website through `GET /api/products`.
- Sign in with the same verified email/password account through `POST /api/mobile/auth/credentials`.
- Sign in with Google through the native Google sign-in SDK and `POST /api/mobile/auth/google`.
- Keep the returned app session token in iOS Keychain / Android secure storage.
- Read and update the same signed-in cart using `GET /api/cart` and `PUT /api/cart`.
- Refresh the cart when its screen opens, every four seconds while that screen is open and the app is in the foreground, and immediately when the app returns to the foreground.
- Sign out and ask the server to revoke the app session.

## Setup before testing on a phone

1. Deploy the website code that contains `/api/products` and the mobile authentication routes. The app's default API address is `https://ixzzy.vercel.app`.
2. Confirm both Supabase migrations have been applied, including `202610040002_mobile_sessions.sql`.
3. Copy `.env.example` to `.env.local`. Use the existing **Web application** OAuth client ID as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. This is a public client identifier; do not add the Google client secret, `AUTH_SECRET`, or Supabase service-role key to the mobile app.
4. In Google Cloud Console, create a Google OAuth client of type **iOS** for the app bundle ID `com.ixzzy.store`; set it as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. The app config derives Google's iOS URL scheme from this ID.
5. For Android, create an Android OAuth client with package name `com.ixzzy.store` and the SHA-1 fingerprint for the Android build's signing certificate. The fingerprint depends on whether you build locally, with EAS, or for Play Store; use the one for the build being tested. The server already accepts the existing web-client audience; add other audiences to the server's `GOOGLE_MOBILE_CLIENT_IDS` only if Google's returned ID token uses one of those IDs.
6. Rebuild the development app after adding/changing native Google configuration. Google sign-in uses native code and does not run inside Expo Go.

For local development, set `EXPO_PUBLIC_API_BASE_URL` in `.env.local` to a server address your phone can reach. `localhost` on the phone means the phone itself, not this computer. For a deployed-phone test, use the deployed website URL and deploy the matching API code first.

## Run the JavaScript app

```powershell
npm install
npx expo start
```

Installing the native development build on a physical iPhone is a separate step. Expo's iOS device build needs Apple signing credentials and a paid Apple Developer account; this Windows computer cannot compile an iOS binary locally. EAS can build it in the cloud when those Apple credentials are available. Without that account, use a borrowed Android phone for the full native Google sign-in and cart test; the iPhone can run the screens in Expo Go, but Google sign-in won't work there.

## Current testing limitation

The app code can be type-checked and linted on this Windows computer, but this machine cannot compile or install an iOS binary locally. A physical-iPhone Google sign-in and website-to-phone cart test still require the Google OAuth setup, deployed API code, an installable iOS development build, and a real sign-in on the phone.
