# Bazaarly

A full-stack, multi-category ecommerce storefront and admin panel built with Next.js 16 (App Router), MongoDB, Clerk, Razorpay, Tailwind v4 and shadcn/ui.

## What's inside

**Storefront**

- Home with hero, category mosaic, deals, featured, new arrivals and bestsellers
- Category pages with faceted filters (brand, price, rating, stock, attributes), sorting and pagination — all URL-driven via `nuqs`
- Full-text search with live suggestions
- Product pages with gallery zoom, variant picker, pincode delivery check, specs, reviews and related products
- Guest cart (cookie) that merges into the account cart on sign-in; cart drawer, save for later, coupons
- Wishlist
- Four-step checkout (address → delivery → payment → review) with saved addresses, express/standard delivery, Razorpay or cash on delivery
- Stock reservation while paying, automatic release on failure/expiry, signature-verified Razorpay callbacks and webhooks
- Account area: orders with live timeline, cancel/return, address book, Clerk-powered profile

**Admin (`/admin`, role-gated)**

- Dashboard: revenue/orders/AOV/low-stock KPIs, 30-day revenue chart, top products, recent orders
- Products: searchable table, publish/unpublish, bulk stock update, full create/edit form with variants builder, Cloudinary image uploads, specs editor
- Categories (two-level tree), coupons, orders (status transitions with timeline notes and automatic Razorpay refunds), customers

**Platform**

- Server actions via `next-safe-action` with public / signed-in / admin clients; only two API routes (the Razorpay and Clerk webhooks)
- Per-policy rate limiting (Upstash Redis, in-memory fallback) at the edge and inside every action
- Strict CSP and security headers, Zod validation on every input before it reaches a query
- Loading skeletons, error boundaries, empty states, sitemap/robots/OG image, optional Resend order-confirmation emails

## Getting started

### 1. Install

```bash
pnpm install
cp .env.example .env.local
```

### 2. Database

Either point `MONGODB_URI` at an Atlas cluster, or run a throwaway local MongoDB (uses `mongodb-memory-server`, persists to `.mongo-data`):

```bash
pnpm db:local        # keep this running in its own terminal
pnpm seed            # 34 categories, 73 products, ~290 SKUs, reviews, coupons
pnpm seed:verify     # sanity-check counts and indexes
```

### 3. Clerk (authentication)

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com) and copy the publishable + secret keys into `.env.local`.
2. Add a webhook endpoint pointing at `https://<your-host>/api/webhooks/clerk` subscribed to `user.created`, `user.updated`, `user.deleted`. Paste its signing secret into `CLERK_WEBHOOK_SIGNING_SECRET`.
3. For local development, tunnel with `ngrok http 3000` (or Clerk's dashboard "test" button) so webhooks reach you. Users are also synced lazily on first sign-in, so the webhook is not required to get going.

### 4. Razorpay (payments)

1. Grab test-mode `Key Id` / `Key Secret` from [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys.
2. Under Settings → Webhooks add `https://<your-host>/api/webhooks/razorpay` with events `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, and put the secret in `RAZORPAY_WEBHOOK_SECRET`.
3. Test cards: `4111 1111 1111 1111`, any future expiry, any CVV. UPI: `success@razorpay`.

If Razorpay keys are missing, checkout still works with cash on delivery.

### 5. Admin access

Add your sign-in email to `ADMIN_EMAILS` (comma-separated). On the next request that user is promoted to `admin` and `/admin` unlocks. Alternatively set `role: "admin"` on the user document.

### 6. Optional services

| Service     | Env                                                    | Used for                                   |
| ----------- | ------------------------------------------------------ | ------------------------------------------ |
| Cloudinary  | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Signed image uploads in the admin product form (URL paste works without it) |
| Upstash     | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`   | Shared rate-limit store across instances (falls back to in-memory) |
| Resend      | `RESEND_API_KEY`, `EMAIL_FROM`                         | Order confirmation emails                  |

### 7. Run

```bash
pnpm dev
```

Open http://localhost:3000. Useful checks before shipping:

```bash
pnpm typecheck && pnpm lint && pnpm build
```

## Project layout

```
src/
  app/                 routes only – thin pages that call feature queries/components
    (shop)/            storefront: home, c/[slug], p/[slug], search, deals, cart, wishlist
    (checkout)/        checkout steps + order success
    (account)/         orders, addresses, profile
    (auth)/            Clerk sign-in / sign-up
    admin/             dashboard, products, categories, orders, coupons, customers
    api/webhooks/      razorpay, clerk
  features/<domain>/   schemas.ts (zod) · actions.ts (server actions) · queries.ts · components/
  components/          ui (shadcn), layout, motion primitives, feedback (skeletons/empty/error)
  lib/                 db (mongoose + one model per file), auth, ratelimit, razorpay, cloudinary, email, security-headers
scripts/               seed data, seed verification, local Mongo runner
```

Conventions: pages never talk to Mongoose directly; every mutation is a `next-safe-action` action with a Zod `inputSchema` and a rate-limit policy in its metadata; runtime enums live in `src/lib/db/enums.ts` so client bundles never import Mongoose.

## Security notes

- Proxy (`src/proxy.ts`) rate-limits sensitive paths and all server-action POSTs per IP before they hit application code; actions apply a second, per-user limit.
- Razorpay payment signatures are verified with a constant-time HMAC compare; webhooks are verified against the raw body and deduplicated by event id.
- Stock is reserved atomically per SKU while a payment is in flight and released after 30 minutes if it never completes.
- Product/category image URLs must come from an allow-listed host (Cloudinary, Unsplash) so the image optimizer can't be pointed at arbitrary origins.
- CSP allows only Clerk, Razorpay, Cloudinary and Cloudflare Turnstile origins; `frame-ancestors 'none'`, HSTS in production.

## Notes on components

The layout primitives (marquee, staggered reveals, counters, mega-nav, cart drawer) are hand-built on `motion/react` and shadcn in the style of 21st.dev components; the 21st.dev CLI requires an API key (`API_KEY_21ST`) and was not used to pull code.
