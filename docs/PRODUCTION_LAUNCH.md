# Production launch (audio-only)

This is the operator checklist for the first public release. Video stays off until a later release.

Keep these values in Vercel Production:

- `VIDEO_FEATURE_ENABLED=false`
- `USE_MOCK_PROVIDERS=false`

Customers can buy **Essential Song** and **Premium Story** (WAV, artwork, extra revisions). **Cinematic Memory** and lyric/photo video stay hidden.

## 1. Domain and GitHub

1. Confirm `memoriestomelody.com` (or the launch domain) is attached to the Vercel Production environment.
2. Connect the GitHub repo so `main` deploys to Production.
3. Set `NEXT_PUBLIC_APP_URL=https://memoriestomelody.com` (no trailing slash).

## 2. Vercel environment variables

Set every Production variable below. Preview can stay on mock providers.

| Variable | Production value |
| --- | --- |
| `USE_MOCK_PROVIDERS` | `false` |
| `VIDEO_FEATURE_ENABLED` | `false` |
| `NEXT_PUBLIC_APP_URL` | `https://memoriestomelody.com` |
| `NEXT_PUBLIC_BRAND_NAME` | `Memories to Melody` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role |
| `STORAGE_BUCKET` | `melora-media` |
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `RESEND_API_KEY` | Resend key |
| `EMAIL_FROM` | `Memories to Melody <hello@memoriestomelody.com>` |
| `LYRICS_PROVIDER` | `openai` |
| `OPENAI_API_KEY` | OpenAI key |
| `OPENAI_MODEL` | `gpt-4o-mini` (or the approved model) |
| `MUSIC_PROVIDER` | `kunavo` or `http` |
| `MUSIC_PROVIDER_API_KEY` | Music provider key |
| `MUSIC_PROVIDER_URL` | Required only when `MUSIC_PROVIDER=http` |
| `COVER_PROVIDER` | `music` |
| `VIDEO_PROVIDER` | `mock` |
| `JOB_WORKER_SECRET` | 24+ random characters |
| `CRON_SECRET` | 24+ random characters, **different** from the worker secret |
| `LISTEN_TOKEN_SECRET` | 24+ random characters, **different** from both above |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |
| `MALWARE_SCAN_REQUIRED` | `true` |
| `MALWARE_SCANNER_URL` | `builtin` for this release |
| `MALWARE_SCANNER_API_KEY` | leave empty while using `builtin` |

Do not set video provider URL/key yet. Production builds fail closed if a required value is missing.

## 3. Supabase

1. Run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_production_setup.sql`
   - `supabase/migrations/003_job_scheduler.sql`
   - `supabase/migrations/004_audio_only_launch.sql`
2. Seed reference data: `supabase/seed/seed.sql`
3. Auth URL configuration:
   - Site URL: `https://memoriestomelody.com`
   - Redirect: `https://memoriestomelody.com/auth/callback`
4. Storage bucket `melora-media` (private)
5. Vault secrets before enabling the scheduler:
   - `app_url` = `https://memoriestomelody.com`
   - `job_worker_secret` = the same value as Vercel `JOB_WORKER_SECRET`

## 4. Stripe

1. Use live keys in Production.
2. Webhook endpoint: `https://memoriestomelody.com/api/stripe/webhook`
3. Subscribe at least to `checkout.session.completed` and refund events already handled by the app.
4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

Checkout creates Stripe prices at session time, so catalog Price IDs are not required for launch.

## 5. Email

1. Verify the sending domain in Resend.
2. Confirm `EMAIL_FROM` uses that domain.
3. Send one test after deploy (order confirmation / song-ready).

## 6. Deploy and verify

1. Deploy `main` to Vercel Production.
2. `GET https://memoriestomelody.com/api/health` must return HTTP 200 with `videoEnabled: false` and `mockMode: false`.
3. Open **Admin → Providers** and confirm every required row is Configured. Video should read Disabled.
4. Open **Admin → Generation jobs → Process queue** once.
5. Place one live test order for Essential and one for Premium:
   - checkout succeeds
   - generation reaches 100%
   - song-ready email arrives
   - listening page plays audio
6. Confirm `/pricing` shows only Essential and Premium.

## 7. Not this release

Leave these until the video release:

- `VIDEO_FEATURE_ENABLED=true`
- `VIDEO_PROVIDER=http` plus URL and API key
- re-activating the `cinematic-memory` package
- restoring lyric video on Premium

See `docs/PRODUCTION_RUNBOOK.md` for provider contracts and job operations.
