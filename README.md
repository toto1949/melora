# Memories to Melody

Premium AI-powered personalized music platform. Customers share a story, choose a sound, and receive a studio-quality song with a private listening page.

Memories to Melody (formerly "Melora") is an original product experience. ForeverSongs was used only as high-level product-flow inspiration — branding, copy, layout, and assets are entirely original.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Framer Motion, React Hook Form, Zod, TanStack Query-ready architecture
- Supabase Auth, PostgreSQL, and Storage (local JSON store when credentials are absent)
- Stripe Checkout + webhooks (mock checkout in local mode)
- Resend transactional emails (console transport in local mode)
- Pluggable lyrics / music / video provider adapters (mock + OpenAI + HTTP)
- Background generation jobs with retries, Vercel cron, and dead-letter handling

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (mock mode)

- Any email + password (8+ chars) creates a customer session
- `admin@melora.app` + any 8+ char password → Super Admin

### Local mock mode

When `USE_MOCK_PROVIDERS=true` or Stripe/Supabase keys are missing:

- Projects/orders persist under `.data/melora-store.json`
- Checkout redirects through `/api/stripe/mock-complete`
- Lyrics/music/video use mock providers
- Emails log to the server console

## Production deployment

Set `USE_MOCK_PROVIDERS=false` and configure all required services:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Auth, database, storage |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payments |
| `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email |
| `OPENAI_API_KEY` | Lyrics generation (`LYRICS_PROVIDER=openai`) |
| `MUSIC_PROVIDER=http`, `MUSIC_PROVIDER_URL`, `MUSIC_PROVIDER_API_KEY` | External music API |
| `VIDEO_PROVIDER=http`, `VIDEO_PROVIDER_URL`, `VIDEO_PROVIDER_API_KEY` | External video API |
| `JOB_WORKER_SECRET`, `CRON_SECRET` | Job worker + Vercel cron auth |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | API rate limiting (optional) |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL for emails and Stripe redirects |

### Supabase setup

1. Create a Supabase project
2. Run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_production_setup.sql`
3. Seed reference data: `supabase/seed/seed.sql`
4. Configure Auth redirect URL: `https://<domain>/auth/callback`

### Vercel setup

1. Import the repo and set environment variables from `.env.example`
2. Configure Stripe webhook → `https://<domain>/api/stripe/webhook`
3. Set `CRON_SECRET` — Vercel cron calls `GET /api/jobs/process` with `Authorization: Bearer <CRON_SECRET>` every 5 minutes (see `vercel.json`)
4. Manual job trigger: `POST /api/jobs/process` with header `x-job-worker-secret`

## Product surfaces

| Area | Path |
|------|------|
| Marketing site | `/` |
| Creation studio | `/studio` |
| Customer dashboard | `/dashboard` |
| Private listening page | `/listen/[token]` |
| Admin dashboard | `/admin` |

Architecture notes live in `docs/ARCHITECTURE.md`, route map in `docs/ROUTE_MAP.md`, and design system in `docs/DESIGN_SYSTEM.md`.

## Scripts

```bash
pnpm dev          # local development
pnpm build        # production build
pnpm start        # start production server
pnpm lint         # eslint
pnpm test         # vitest
pnpm jobs:process # process queued generation jobs (mock/local)
```

## Security & privacy

- Provider API keys never ship to the browser
- Secure headers + optional Upstash rate limiting via middleware
- Private media stored in Supabase Storage with signed URLs
- Password-protected share links with scrypt hashing
- Account data export (`/api/account/export`) and soft-delete
- Explicit training opt-in (default off)
- Guest projects claimable after authentication

## Testing

```bash
pnpm test
```

Coverage includes validation schemas, mock lyrics provider, and currency helpers.

## License

Private / all rights reserved unless otherwise noted.
