# MagneticICT

Phase 1 foundation for a Magnetic AI IT services SaaS platform built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, MongoDB, Auth.js, and `next-intl`.

## Included in Phase 1

- Prisma schema for platform models:
  - `User`
  - `Service`
  - `ServiceTier`
  - `Order`
  - `Review`
  - `Setting`
  - `EmailOtp`
  - Auth.js adapter models: `Account`, `Session`, `VerificationToken`
- Next.js App Router scaffold
- Tailwind CSS setup
- `next-intl` App Router middleware setup
- Auth.js setup with:
  - Google OAuth provider
  - email OTP credentials flow foundation
- OTP request API route
- Prisma seed for default platform settings

## Environment setup

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL` for the production administrator login and admin bootstrap script
- `ADMIN_PASSWORD` for production administrator sign-in
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL_FROM`
- `STRIPE_SECRET_KEY` for real Stripe Checkout session creation
- `STRIPE_WEBHOOK_SECRET` for Stripe webhook verification
- `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` for PayPal approval/capture flow
- `PAYPAL_API_BASE_URL` if you want to override the default sandbox API host

## Install and run

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

## Plesk deployment

Recommended Plesk Node.js settings:

- Node.js version: `20.x` or newer
- Application mode: `production`
- Application root: the repository root
- Application startup file: `server.js`
- Startup command: `npm run start:plesk`

Recommended deployment commands on the server:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run build
```

If you want to seed base settings on a brand-new database:

```bash
npm run prisma:seed
```

If you want to force-promote the configured admin email in the database:

```bash
npm run admin:grant -- your-admin@email.com
```

Required production environment variables for Plesk custom environment:

- `NODE_ENV=production`
- `PORT` provided by Plesk
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST=true`
- `NEXT_PUBLIC_APP_URL=https://your-domain.com`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Optional variables depending on features you want enabled:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTH_RESEND_KEY`
- `AUTH_EMAIL_FROM`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_API_BASE_URL`

## Notes

- Google sign-in is enabled only when both Google env vars are configured.
- OTP emails use Resend in this Phase 1 scaffold.
- Prisma is configured for MongoDB and uses `db push` instead of SQL migrations.
- Admin email/password sign-in is enabled only when both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured.
- Active frontend languages are intended to be driven from the `Setting` row with key `active_languages`.
- Stripe Checkout is enabled only when `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_APP_URL` are configured.
- Stripe webhook reconciliation is enabled only when `STRIPE_WEBHOOK_SECRET` is configured and the webhook points to `/api/payments/stripe/webhook`.
- PayPal now supports approval and server-side capture through the success flow when credentials are configured.
- Additional premium UI, services pages, cart flow, dashboard, and admin panel belong to later phases.
