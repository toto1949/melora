# Production runbook

## Safe rollout order

1. Keep `VIDEO_FEATURE_ENABLED=false`.
2. Configure every variable in `.env.example` for the Vercel Production environment. Production builds fail closed when a required value is missing.
3. In Supabase Vault, create:
   - `app_url`: `https://memoriestomelody.com`
   - `job_worker_secret`: the exact Vercel `JOB_WORKER_SECRET`
4. Apply `supabase/migrations/003_job_scheduler.sql`.
5. Deploy the application and confirm `GET /api/health` returns HTTP 200.
6. Use **Admin → Generation jobs → Process queue** once to reclaim existing stale jobs. Supabase Cron continues every minute after that.

The Vercel cron remains a daily fallback. Atomic database claiming makes overlapping Vercel and Supabase worker invocations safe.

## Provider contracts

### Music

`MUSIC_PROVIDER=kunavo` uses the built-in Kunavo/Suno adapter and requires `MUSIC_PROVIDER_API_KEY`. `MUSIC_PROVIDER=http` sends a JSON request with a bearer token and an `Idempotency-Key`; the response must contain an HTTPS `audioUrl` or `audio_url` and may include `jobId` or `job_id`.

### Cover artwork

Use `COVER_PROVIDER=music` to keep artwork returned by the music provider and fall back to the branded built-in cover. For an external provider, use `COVER_PROVIDER=http`; its JSON response must contain an HTTPS `imageUrl` or `image_url`.

### Malware scanner

The scanner receives a multipart `file` field with `Authorization: Bearer <MALWARE_SCANNER_API_KEY>`. It must respond within 60 seconds with either `{ "clean": true }` or `{ "status": "clean" }`. In production, scanner errors, unknown responses, and detected malware reject the upload before storage.

### Video (next release)

Leave `VIDEO_FEATURE_ENABLED=false` until the provider and playback flow are approved. The HTTP video provider receives:

```json
{
  "title": "Song title",
  "audio_url": "https://...",
  "style": "Cinematic",
  "photo_urls": ["https://..."],
  "lyrics": "..."
}
```

It must return an HTTPS `videoUrl` or `video_url` within 210 seconds. Before switching the flag to `true`, configure `VIDEO_PROVIDER=http`, `VIDEO_PROVIDER_URL`, and `VIDEO_PROVIDER_API_KEY`, then test one lyric-video and one photo-video package in Preview. Enabling the flag restores video packages, uploads, generation, and the listening-page player together.

## Operational checks

- `/api/health`: readiness, database connectivity, and feature state
- `/admin/providers`: required provider configuration without secret values
- `/admin/jobs`: attempts, progress, provider job IDs, retry errors, and manual retries
- Vercel logs: search for `generation_worker`, `generation_job`, `malware_scan`, and `rate_limit`

Never manually mark an order ready. Retry its earliest failed or stale pipeline job so all later stages remain ordered.
