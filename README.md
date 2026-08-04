# Melora

Premium AI-powered personalized music platform. Customers share a story, choose a sound, and receive a studio-quality song with a private listening page.

Melora is an original product experience. ForeverSongs was used only as high-level product-flow inspiration — branding, copy, layout, and assets are entirely original.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Framer Motion, React Hook Form, Zod, TanStack Query-ready architecture
- Supabase-ready auth/db/storage (local JSON store when credentials are absent)
- Stripe Checkout + webhooks (mock checkout in local mode)
- Resend transactional emails (console transport in local mode)
- Pluggable lyrics / music / video provider adapters
- Background generation jobs with retries and dead-letter handling

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts

- Any email + password (8+ chars) creates a customer session
- `admin@melora.app` + any 8+ char password → Super Admin

### Local mock mode

When `USE_MOCK_PROVIDERS=true` or Stripe/Supabase keys are missing:

- Projects/orders persist under `.data/melora-store.json`
- Checkout redirects through `/api/stripe/mock-complete`
- Lyrics/music/video use mock providers
- Emails log to the server console

## Product surfaces

| Area | Path |
|------|------|
| Marketing site | `/` |
| Creation studio | `/studio` |
| Customer dashboard | `/dashboard` |
| Private listening page | `/listen/[token]` |
| Admin dashboard | `/admin` |

Architecture notes live in `docs/ARCHITECTURE.md`, route map in `docs/ROUTE_MAP.md`, and design system in `docs/DESIGN_SYSTEM.md`.

## Database

PostgreSQL schema + RLS policies:

- `supabase/migrations/001_initial_schema.sql`
- Seed reference: `supabase/seed/seed.sql`

Apply with the Supabase CLI or your preferred migrator when connecting a real project.

## Scripts

```bash
pnpm dev          # local development
pnpm build        # production build
pnpm start        # start production server
pnpm lint         # eslint
pnpm test         # vitest
pnpm jobs:process # process queued generation jobs (mock/local)
```

## Environment

See `.env.example` for all variables. Important groups:

- App URL + brand
- Supabase URL/keys + storage bucket
- Stripe secret/publishable/webhook
- Resend + from address
- Lyrics/music/video provider selection
- Job worker secret

## Deployment (Vercel)

1. Create a Vercel project from this repo
2. Set environment variables from `.env.example`
3. Provision Supabase (Auth, DB, Storage) and run migrations
4. Configure Stripe webhook → `https://<domain>/api/stripe/webhook`
5. Set Resend domain/sender
6. Configure provider API keys or keep mocks for staging
7. Optionally schedule `POST /api/jobs/process` with `x-job-worker-secret`

## Security & privacy

- Provider API keys never ship to the browser
- Secure headers via middleware
- Private media + signed URL hooks
- Explicit training opt-in (default off)
- GDPR-style cookie preferences
- Guest projects claimable after authentication

## Testing

```bash
pnpm test
```

Coverage includes validation schemas, mock lyrics provider, and currency helpers.

## License

Private / all rights reserved unless otherwise noted.
