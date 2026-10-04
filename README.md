IXZZY is a Next.js storefront. Authentication uses Auth.js with Google OAuth and verified email/password accounts. Supabase remains the order database.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication setup

Set `AUTH_SECRET`, `AUTH_URL`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` in `.env.local`. The Google OAuth client's authorized redirect URI must be `http://localhost:3000/api/auth/callback/google` locally and the matching production URL when deployed. Set `AUTH_URL` to the public origin in production. Keep the Google client secret server-only; do not use a `NEXT_PUBLIC_` variable for it.

Set `SUPABASE_SERVICE_ROLE_KEY` alongside the Supabase URL and publishable key. It is used only by server routes to access private account records and orders. Never expose it in client code.

Apply the SQL migrations in `supabase/migrations` to the Supabase project before enabling sign-in. The account migration preserves existing Supabase user IDs and reassigns orders to the new account table. Existing password hashes cannot be transferred from Supabase Auth; customers can sign in with the same verified Google email or use password reset to set a new password. Email/password registration and recovery require the existing Mailgun configuration.

The shared-cart and guest-checkout migration (`202610040001_shared_cart_guest_checkout.sql`) adds the private `cart_items` table and allows orders without an account. Apply it in the Supabase SQL Editor before testing saved carts or guest checkout. Signed-in carts are saved to Supabase; guest carts stay in that browser and merge into the signed-in cart after login. The website must be deployed with this migration applied before the mobile app can use the same cart API.

## Mobile app authentication API

The mobile login endpoints use the same `app_users` records as website sign-in. Apply `202610040002_mobile_sessions.sql` in the Supabase SQL Editor before testing them. The API returns a random 30-day bearer token; Supabase stores only its SHA-256 hash. Keep the returned token in the app's secure storage and send it as `Authorization: Bearer <token>` when calling `/api/cart` or `/api/orders`.

- `POST /api/mobile/auth/google` accepts `{ "idToken": "..." }` after Google sign-in in the app.
- `POST /api/mobile/auth/credentials` accepts `{ "email": "...", "password": "..." }`.
- Both return `{ "token": "...", "expiresAt": "...", "user": { "id": "...", "email": "...", "name": "..." } }` on success.
- `GET /api/mobile/auth/session` validates a bearer token and returns the current user.
- `POST /api/mobile/auth/logout` revokes that bearer token.

`GOOGLE_MOBILE_CLIENT_IDS` is an optional comma-separated list for the Google client IDs created for native apps. `AUTH_GOOGLE_ID` is also accepted as an audience. These IDs are not secrets; the Google client secret and Supabase service-role key remain server-only.

## Mobile app

The Expo app lives in [`mobile/`](mobile/README.md). It uses the website's product, authentication, and saved-cart API routes. Deploy the website API changes and set up the native Google OAuth client IDs before installing the iPhone development build.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
