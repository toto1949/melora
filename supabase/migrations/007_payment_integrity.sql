-- Additive payment repair. No historical payment is inferred from order status.
begin;
alter table public.orders
  add column payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded','partially_refunded','disputed')),
  add column stripe_price_id text,
  add column checkout_attempt integer not null default 1,
  add column checkout_expires_at timestamptz not null default (now() + interval '31 minutes'),
  add column customer_name text;
create unique index orders_checkout_session_unique on public.orders(stripe_checkout_session_id) where stripe_checkout_session_id is not null;
create unique index orders_payment_intent_unique on public.orders(stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create unique index payments_intent_unique on public.payments(stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create table public.stripe_events (
  id text primary key, event_type text not null, order_id uuid references public.orders(id),
  created_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;

-- One active purchase per project, serialized on the project (including simultaneous tabs).
create function public.create_paid_order(p_project uuid, p_package uuid, p_email text, p_phone text, p_user uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare p public.projects; pkg public.packages; oid uuid;
begin
  select * into strict p from public.projects where id=p_project and deleted_at is null for update;
  select id into oid from public.orders where project_id=p_project and deleted_at is null order by created_at desc limit 1;
  if oid is not null then return oid; end if;
  select * into strict pkg from public.packages where id=p_package and is_active and slug='essential-song';
  if pkg.price_cents <> 799 or pkg.currency <> 'usd' then raise exception 'Package must match the configured USD 7.99 price'; end if;
  if not exists(select 1 from recipients where project_id=p_project and length(name)>0)
    or not exists(select 1 from story_answers where project_id=p_project and length(favorite_memory)>=10 and length(what_makes_special)>=10)
    or not exists(select 1 from song_preferences where project_id=p_project and genre is not null and mood is not null)
    then raise exception 'Incomplete song customization'; end if;
  insert into orders(order_number,user_id,project_id,package_id,subtotal_cents,total_cents,currency,email,phone,revision_credits_remaining,estimated_delivery_at,idempotency_key)
  values ('MTM-'||upper(encode(gen_random_bytes(8),'hex')),p_user,p_project,p_package,799,799,'usd',p_email,p_phone,pkg.revision_credits,now()+make_interval(hours=>pkg.delivery_hours),'project:'||p_project)
  returning id into oid;
  insert into order_items(order_id,item_type,reference_id,name,quantity,unit_price_cents,total_cents)
  values(oid,'package',pkg.id,pkg.name,1,799,799);
  update projects set status='awaiting_payment',package_id=p_package where id=p_project;
  return oid;
end $$;

-- Only a server-retrieved expired Session permits a new checkout attempt.
create function public.rotate_checkout(p_order uuid, p_expired_session text)
returns void language plpgsql security definer set search_path=public as $$
begin
  update orders set stripe_checkout_session_id=null,checkout_attempt=checkout_attempt+1,
    checkout_expires_at=now()+interval '31 minutes'
  where id=p_order and stripe_checkout_session_id=p_expired_session and payment_status in ('pending','failed');
end $$;
create function public.bind_checkout(p_order uuid,p_attempt integer,p_session text,p_price text)
returns void language plpgsql security definer set search_path=public as $$
begin
  update orders set stripe_checkout_session_id=p_session,stripe_price_id=p_price
  where id=p_order and checkout_attempt=p_attempt
    and (stripe_checkout_session_id is null or stripe_checkout_session_id=p_session);
  if not found then raise exception 'Checkout binding conflict'; end if;
end $$;

-- Event deduplication, payment update and durable fulfillment enqueue are ONE transaction.
create function public.apply_stripe_event(p_event text,p_type text,p_order uuid,p_state text,p_session text,p_intent text,p_price text,p_total integer,p_tax integer,p_refunded integer,p_name text)
returns boolean language plpgsql security definer set search_path=public as $$
declare o public.orders; stage text;
begin
  -- Acquire the parent lock BEFORE inserting an event with a foreign key to it.
  -- Otherwise concurrent event inserts hold key-share locks and deadlock on lock upgrade.
  select * into strict o from orders where id=p_order for update;
  insert into stripe_events(id,event_type,order_id) values(p_event,p_type,p_order) on conflict do nothing;
  if not found then return false; end if;
  if p_intent is null then raise exception 'Missing payment intent'; end if;
  if o.stripe_payment_intent_id is not null and o.stripe_payment_intent_id<>p_intent then raise exception 'Payment intent mismatch'; end if;
  if p_state='paid' then
    if o.stripe_checkout_session_id is distinct from p_session or o.stripe_price_id is distinct from p_price
      or o.currency<>'usd' or o.subtotal_cents<>799 or p_total<799 or p_tax<0 or p_total<>799+p_tax then
      raise exception 'Payment does not match order';
    end if;
    if o.payment_status in ('refunded','partially_refunded','disputed') then return false; end if;
    update orders set payment_status='paid',stripe_payment_intent_id=p_intent,total_cents=p_total,tax_cents=p_tax,
      customer_name=p_name,status=case when payment_status<>'paid' then 'payment_confirmed'::order_status else status end where id=p_order;
    insert into payments(order_id,user_id,status,amount_cents,currency,stripe_payment_intent_id)
    values(p_order,o.user_id,'succeeded',p_total,o.currency,p_intent)
    on conflict(stripe_payment_intent_id) where stripe_payment_intent_id is not null do update set status='succeeded',amount_cents=p_total;
    foreach stage in array array['creative_brief','lyrics','music','cover_art','lyric_video','photo_video','quality_check','notify'] loop
      insert into generation_jobs(order_id,job_type,idempotency_key) values(p_order,stage::job_type,p_order||':'||stage) on conflict(idempotency_key) do nothing;
    end loop;
    update projects set status='converted' where id=o.project_id;
  elsif p_state='failed' then
    if o.payment_status in ('pending','failed') then
      update orders set payment_status='failed' where id=p_order;
    end if;
  elsif p_state in ('refunded','partially_refunded','disputed') then
    -- A refund/dispute can precede checkout delivery; metadata + server Stripe lookup binds it.
    update orders set payment_status=case when payment_status='disputed' then 'disputed' else p_state end,
      stripe_payment_intent_id=p_intent,status=case when p_state='refunded' then 'refunded'::order_status else status end where id=p_order;
    update payments set status=case when p_state='refunded' then 'refunded'::payment_status when p_state='partially_refunded' then 'partially_refunded'::payment_status else status end,
      refunded_cents=greatest(refunded_cents,p_refunded) where order_id=p_order and stripe_payment_intent_id=p_intent;
    update generation_jobs set status='cancelled' where order_id=p_order and status in ('queued','failed','running');
  else raise exception 'Unsupported payment state'; end if;
  return true;
end $$;

-- Database claims independently enforce payment eligibility and prerequisite ordering.
create or replace function public.claim_generation_job(target_job_id uuid,stale_before timestamptz)
returns public.generation_jobs language plpgsql security definer set search_path=public as $$
declare claimed public.generation_jobs; oid uuid;
begin
  select order_id into oid from generation_jobs where id=target_job_id;
  perform 1 from orders where id=oid and payment_status='paid' and deleted_at is null for update;
  if not found then return null; end if;
  update generation_jobs j set status='running',attempt=attempt+1,error=null,next_retry_at=null,
    started_at=now(),finished_at=null,updated_at=now()
  where j.id=target_job_id and attempt<max_attempts
    and (status in ('queued','failed') or (status='running' and updated_at<stale_before))
    and (next_retry_at is null or next_retry_at<=now())
    and not exists(select 1 from generation_jobs earlier where earlier.order_id=j.order_id
      and earlier.job_type<j.job_type and earlier.status<>'succeeded')
  returning * into claimed;
  return claimed;
end $$;

-- Stop role escalation and direct browser mutations of checkout customization.
revoke update on public.profiles from authenticated;
grant update(full_name,phone,avatar_url,locale,currency,country,marketing_opt_in,training_opt_in) on public.profiles to authenticated;
drop policy if exists projects_update_own_or_staff on public.projects;
drop policy if exists melora_authenticated_uploads on storage.objects;

revoke all on function public.create_paid_order(uuid,uuid,text,text,uuid) from public;
revoke all on function public.rotate_checkout(uuid,text) from public;
revoke all on function public.bind_checkout(uuid,integer,text,text) from public;
revoke all on function public.apply_stripe_event(text,text,uuid,text,text,text,text,integer,integer,integer,text) from public;
grant execute on function public.create_paid_order(uuid,uuid,text,text,uuid),public.rotate_checkout(uuid,text),public.bind_checkout(uuid,integer,text,text),public.apply_stripe_event(text,text,uuid,text,text,text,text,integer,integer,integer,text) to service_role;
commit;
notify pgrst,'reload schema';
