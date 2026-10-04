<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## IXZZY project guidance

### Project structure and architecture

- This is the IXZZY storefront, built with Next.js App Router, TypeScript, React, and Tailwind CSS.
- Keep route-level pages and handlers under `app/`, reusable UI under `components/`, and shared application logic under `lib/`.
- Authentication is handled by Auth.js in `lib/auth.ts`, with Google and credentials sign-in. Supabase is used for application data; do not reintroduce Supabase Auth unless the user explicitly requests an architecture change.
- Server-only Supabase access belongs in `lib/supabase/admin.ts` or server routes. Never import admin clients or privileged keys into client components.
- Email delivery is implemented in `lib/email/`; order creation and confirmation flow through `app/api/orders/route.ts`.
- Database schema changes belong in new, ordered SQL migrations under `supabase/migrations/`. Do not make destructive or production database changes without explicit authorization.

### Working process

1. Read the relevant existing files and understand the current behavior before editing. Check this file and any more specific `AGENTS.md` files in affected directories.
2. For Next.js changes, follow the Next.js documentation requirement above. Read the relevant guide from `node_modules/next/dist/docs/` before writing code, and follow current APIs and deprecation notes.
3. Make the smallest complete change that solves the requested problem. Preserve the existing IXZZY visual style and responsive behavior unless the user asks for a redesign.
4. Keep secrets out of source, logs, client bundles, and responses. `.env.local` is private configuration: inspect only variable names or whether required values are present unless a secret value is essential and the user has explicitly asked to inspect it. Never print secret values.
5. Treat external services as separate from local code. A local build cannot prove that Vercel, Google OAuth, Supabase, or Mailgun production configuration works; distinguish verified facts from assumptions and report which environment was checked.
6. After code changes, run the relevant existing checks when the user asks for verification or the task requires it. Available project checks are `npm run lint` and `npm run build`. Do not claim external integration success based only on compilation.
7. Report what changed, the checks run and their results, and any remaining steps that require the user or access to an external dashboard.

### Security and data handling

- Keep `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and `MAILGUN_API_KEY` server-only. Do not rename them to `NEXT_PUBLIC_*` or hard-code them.
- Public Supabase settings may use `NEXT_PUBLIC_` only when their role is explicitly publishable.
- Validate and constrain user input at server boundaries. Do not trust prices, totals, product details, account IDs, or payment state supplied by a browser.
- Avoid logging passwords, tokens, session contents, personal data, or secret values. Use safe error details that help diagnosis without exposing credentials.

### User experience

- Keep storefront interactions usable on mobile as well as desktop, with clear loading, success, and error states.
- Preserve accessible labels, keyboard operation, semantic elements, and useful image alt text when changing UI.
- Prefer concise, customer-facing error messages; keep implementation details in server logs rather than the page.
