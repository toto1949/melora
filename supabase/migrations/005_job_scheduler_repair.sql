-- Repair the production Supabase Cron -> pg_net -> Vercel worker path.
--
-- Some pg_net installations can have net.http_post() while the internal
-- net._encode_url_with_params_array(text, text[]) helper is missing. In that
-- state every HTTP request fails before it is added to pg_net's request queue.
-- This migration restores a compatible helper only when it is absent, then
-- replaces the inline cron command with a validated dispatcher function.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

do $repair$
begin
  if to_regprocedure('net._encode_url_with_params_array(text,text[])') is null then
    execute $create_helper$
      create function net._encode_url_with_params_array(url text, params_array text[])
      returns text
      language sql
      immutable
      strict
      parallel safe
      as $function$
        select case
          when cardinality(params_array) = 0 then url
          when strpos(url, '?') = 0 then url || '?' || array_to_string(params_array, '&')
          when right(url, 1) in ('?', '&') then url || array_to_string(params_array, '&')
          else url || '&' || array_to_string(params_array, '&')
        end
      $function$
    $create_helper$;
  end if;
end;
$repair$;

-- Recreate the atomic job claim RPC as part of the standalone repair. This is
-- safe to run even when migration 003 already created the function.
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

create or replace function public.dispatch_generation_worker()
returns bigint
language plpgsql
security definer
set search_path = public, extensions, net, vault, pg_temp
as $$
declare
  app_url text;
  worker_secret text;
  request_id bigint;
begin
  select nullif(btrim(decrypted_secret), '')
  into app_url
  from vault.decrypted_secrets
  where name = 'app_url'
  order by created_at desc
  limit 1;

  select nullif(btrim(decrypted_secret), '')
  into worker_secret
  from vault.decrypted_secrets
  where name = 'job_worker_secret'
  order by created_at desc
  limit 1;

  if app_url is null then
    raise exception 'Supabase Vault secret "app_url" is missing or empty';
  end if;

  if app_url !~* '^https://[^/[:space:]]+' then
    raise exception 'Supabase Vault secret "app_url" must be an HTTPS origin';
  end if;

  if worker_secret is null then
    raise exception 'Supabase Vault secret "job_worker_secret" is missing or empty';
  end if;

  select net.http_post(
    url := rtrim(app_url, '/') || '/api/jobs/process',
    body := '{}'::jsonb,
    params := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-job-worker-secret', worker_secret
    ),
    timeout_milliseconds := 10000
  )
  into request_id;

  return request_id;
end;
$$;

revoke all on function public.dispatch_generation_worker() from public;
grant execute on function public.dispatch_generation_worker() to service_role;

do $unschedule$
declare
  existing_job record;
begin
  for existing_job in
    select jobid
    from cron.job
    where jobname = 'melora-process-generation-jobs'
  loop
    perform cron.unschedule(existing_job.jobid);
  end loop;
end;
$unschedule$;

select cron.schedule(
  'melora-process-generation-jobs',
  '* * * * *',
  $cron$select public.dispatch_generation_worker();$cron$
);

notify pgrst, 'reload schema';
