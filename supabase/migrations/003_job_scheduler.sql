-- Durable job claiming and a one-minute Supabase Cron worker.
-- Before applying, create these Vault secrets in Supabase:
--   app_url            = https://memoriestomelody.com
--   job_worker_secret  = the same value as Vercel JOB_WORKER_SECRET

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

create or replace function public.claim_generation_job(
  target_job_id uuid,
  stale_before timestamptz
)
returns public.generation_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed public.generation_jobs;
begin
  update public.generation_jobs
  set status = 'running',
      attempt = attempt + 1,
      error = null,
      next_retry_at = null,
      started_at = now(),
      finished_at = null,
      updated_at = now()
  where id = target_job_id
    and attempt < max_attempts
    and (
      status in ('queued', 'failed')
      or (status = 'running' and updated_at < stale_before)
    )
    and (next_retry_at is null or next_retry_at <= now())
  returning * into claimed;

  return claimed;
end;
$$;

revoke all on function public.claim_generation_job(uuid, timestamptz) from public;
grant execute on function public.claim_generation_job(uuid, timestamptz) to service_role;

do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'melora-process-generation-jobs';

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
end;
$$;

select cron.schedule(
  'melora-process-generation-jobs',
  '* * * * *',
  $cron$
  select net.http_post(
    url := (
      select rtrim(decrypted_secret, '/') || '/api/jobs/process'
      from vault.decrypted_secrets
      where name = 'app_url'
      limit 1
    ),
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-job-worker-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'job_worker_secret'
        limit 1
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $cron$
);
