# Production runbook

## Safe rollout order

1. Keep `VIDEO_FEATURE_ENABLED=false`.
2. Follow `docs/PRODUCTION_LAUNCH.md` and configure every Production variable listed there. Production builds fail closed when a required value is missing.
3. In Supabase Vault, create:
   - `app_url`: `https://memoriestomelody.com`
   - `job_worker_secret`: the exact Vercel `JOB_WORKER_SECRET`
4. Apply `supabase/migrations/003_job_scheduler.sql`, `supabase/migrations/004_audio_only_launch.sql`, `supabase/migrations/005_job_scheduler_repair.sql`, and `supabase/migrations/006_release_gift_delivery.sql` in order. A database that already has migrations `001`–`005` only needs the new `006` migration.
5. Deploy the application and confirm `GET /api/health` returns HTTP 200.
6. Use **Admin → Generation jobs → Process queue** once to reclaim existing stale jobs. Supabase Cron continues every minute after that.

The Vercel cron remains a daily fallback. Atomic database claiming makes overlapping Vercel and Supabase worker invocations safe.

## Scheduler repair and verification

Migration `005_job_scheduler_repair.sql` repairs the incomplete `pg_net` helper seen in affected Supabase projects and reschedules the one-minute worker through `public.dispatch_generation_worker()`. Run the whole migration in the Supabase SQL Editor, then run these checks without exposing either Vault secret:

```sql
select
  to_regprocedure('net._encode_url_with_params_array(text,text[])') is not null
    as pg_net_helper_ready,
  to_regprocedure('public.claim_generation_job(uuid,timestamptz)') is not null
    as job_claim_ready,
  to_regprocedure('public.dispatch_generation_worker()') is not null
    as dispatcher_ready,
  exists (
    select 1 from vault.decrypted_secrets
    where name = 'app_url' and nullif(btrim(decrypted_secret), '') is not null
  ) as app_url_ready,
  exists (
    select 1 from vault.decrypted_secrets
    where name = 'job_worker_secret' and nullif(btrim(decrypted_secret), '') is not null
  ) as worker_secret_ready;

select jobid, jobname, schedule, active, command
from cron.job
where jobname = 'melora-process-generation-jobs';
```

All five readiness values must be `true`, and the cron row must be active. Trigger one request immediately with:

```sql
select public.dispatch_generation_worker() as request_id;
```

After a few seconds, use the returned ID to verify the HTTP result:

```sql
select id, status_code, timed_out, error_msg, content
from net._http_response
where id = <request_id>;
```

The expected status is `202`. A `401` means the Supabase Vault `job_worker_secret` does not exactly match Vercel Production `JOB_WORKER_SECRET`; rotate both to the same new random value and redeploy. Do not copy the masked value produced by `vercel env pull` into Vault.

## Provider contracts

### Music

`MUSIC_PROVIDER=kunavo` uses the built-in Kunavo/Suno adapter and requires `MUSIC_PROVIDER_API_KEY`. `MUSIC_PROVIDER=http` sends a JSON request with a bearer token and an `Idempotency-Key`; the response must contain an HTTPS `audioUrl` or `audio_url` and may include `jobId` or `job_id`.

### Cover artwork

Use `COVER_PROVIDER=music` to keep artwork returned by the music provider and fall back to the branded built-in cover. For an external provider, use `COVER_PROVIDER=http`; its JSON response must contain an HTTPS `imageUrl` or `image_url`.

### Malware scanner

For the audio-only launch, set `MALWARE_SCANNER_URL=builtin`. Uploads are limited to JPEG/PNG/WebP, type-checked from magic bytes, and rejected over 10 MB. An HTTP scanner can replace this later: it must receive a multipart `file` field with `Authorization: Bearer <MALWARE_SCANNER_API_KEY>` and respond within 60 seconds with either `{ "clean": true }` or `{ "status": "clean" }`. Remote scanner errors, unknown responses, and detected malware reject the upload before storage.

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
