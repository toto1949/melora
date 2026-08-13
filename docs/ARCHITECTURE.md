# Memories to Melody Product Architecture

**Memories to Melody** is an AI-powered personalized music platform. Customers turn memories into studio-quality songs for people they care about.

## Brand

- Name: Memories to Melody
- Position: Premium emotional gift experience
- Promise: Personalized music made from your memories
- Tone: Warm, trustworthy, cinematic, nontechnical

## System overview

```
┌──────────────┐   ┌────────────────┐   ┌──────────────────┐
│ Marketing /  │   │ Creation       │   │ Customer / Admin │
│ SEO pages    │──▶│ Studio (guest) │──▶│ Dashboards       │
└──────────────┘   └───────┬────────┘   └────────▲─────────┘
                           │                     │
                           ▼                     │
                   ┌───────────────┐    ┌────────┴────────┐
                   │ Stripe Checkout│───▶│ Orders + Jobs   │
                   └───────────────┘    └────────┬────────┘
                                                 │
                     ┌───────────────┬───────────┼──────────────┐
                     ▼               ▼           ▼              ▼
              Lyrics Provider  Music Provider  Video Provider  Storage
              (OpenAI-compat)  (adapter)       (adapter)       (Supabase/S3)
```

## Layers

1. **Presentation** — Next.js App Router (RSC + client islands)
2. **Application** — Server Actions / Route Handlers
3. **Domain** — orders, projects, revisions, packages, generation pipeline
4. **Infrastructure** — Supabase (auth/db/storage/realtime), Stripe, Resend, providers
5. **Jobs** — async generation with retries, backoff, dead-letter, progress

## Guest → account claim flow

1. Studio creates an anonymous `projects` row with `guest_token`
2. Autosave persists each step
3. At checkout, email/auth claims the project (`user_id` attached)
4. Stripe webhook confirms payment and enqueues generation

## Generation pipeline

1. Create order → sanitize input → creative brief
2. Lyrics → safety/quality checks
3. Music → cover art → optional video (guarded by `VIDEO_FEATURE_ENABLED`)
4. Store assets → quality checks → mark ready
5. Notify customer → publish private listening page

All providers implement stable interfaces so adapters can be swapped via env config.

Jobs are claimed atomically in PostgreSQL. A Supabase Cron task calls the worker every minute, failed jobs persist a retry timestamp with exponential backoff, and stale running jobs can be reclaimed after 15 minutes. The daily Vercel cron is only a fallback.

## Security

- Provider keys never reach the browser
- RLS on all customer data
- Signed URLs for private media
- Stripe webhook signature verification
- Zod validation on every mutation
- Rate limiting + audit logs
- Explicit opt-in required before any training use of uploads

## Local development mode

When `USE_MOCK_PROVIDERS=true` (default without keys):

- In-memory/file JSON repository
- Mock lyrics/music/video providers
- Mock Stripe checkout session redirect
- Console email transport
