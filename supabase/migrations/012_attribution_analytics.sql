begin;

alter table public.projects
  add column analytics_visitor_id text,
  add column analytics_session_id text,
  add column first_touch jsonb not null default '{}'::jsonb,
  add column last_touch jsonb not null default '{}'::jsonb,
  add column analytics_internal boolean not null default false;

alter table public.orders
  add column analytics_visitor_id text,
  add column analytics_session_id text,
  add column first_touch jsonb not null default '{}'::jsonb,
  add column last_touch jsonb not null default '{}'::jsonb,
  add column analytics_internal boolean not null default false,
  add column paid_at timestamptz;

alter table public.analytics_events
  add column visitor_id text,
  add column page_path text,
  add column source text,
  add column medium text,
  add column campaign text,
  add column content text,
  add column is_internal boolean not null default false,
  add column dedupe_key text;

alter table public.projects
  add constraint projects_analytics_visitor_length check (analytics_visitor_id is null or length(analytics_visitor_id) <= 64),
  add constraint projects_analytics_session_length check (analytics_session_id is null or length(analytics_session_id) <= 64);
alter table public.orders
  add constraint orders_analytics_visitor_length check (analytics_visitor_id is null or length(analytics_visitor_id) <= 64),
  add constraint orders_analytics_session_length check (analytics_session_id is null or length(analytics_session_id) <= 64);
alter table public.analytics_events
  add constraint analytics_events_visitor_length check (visitor_id is null or length(visitor_id) <= 64),
  add constraint analytics_events_session_length check (session_id is null or length(session_id) <= 64),
  add constraint analytics_events_path_length check (page_path is null or length(page_path) <= 300),
  add constraint analytics_events_source_length check (source is null or length(source) <= 80),
  add constraint analytics_events_campaign_length check (campaign is null or length(campaign) <= 160),
  add constraint analytics_events_content_length check (content is null or length(content) <= 160),
  add constraint analytics_events_dedupe_length check (dedupe_key is null or length(dedupe_key) <= 255);

create unique index analytics_events_dedupe_unique on public.analytics_events(dedupe_key) where dedupe_key is not null;
create index analytics_events_visitor_created_idx on public.analytics_events(visitor_id, created_at desc) where not is_internal;
create index analytics_events_session_created_idx on public.analytics_events(session_id, created_at desc) where not is_internal;
create index analytics_events_source_created_idx on public.analytics_events(source, created_at desc) where not is_internal;
create index orders_analytics_visitor_idx on public.orders(analytics_visitor_id) where analytics_visitor_id is not null and not analytics_internal;
create index orders_paid_at_idx on public.orders(paid_at desc) where paid_at is not null and not analytics_internal;

-- Existing staff and obvious fixture orders are excluded from business reporting.
update public.projects p
set analytics_internal = true
where exists (
  select 1 from public.profiles profile
  where profile.id = p.user_id
    and profile.role in ('super_admin','support','producer','reviewer','content_manager')
);

update public.orders o
set analytics_internal = true
where lower(o.email) like '%@example.test'
   or lower(o.email) like '%+test@%'
   or exists (
     select 1 from public.profiles profile
     where profile.id = o.user_id
       and profile.role in ('super_admin','support','producer','reviewer','content_manager')
   );

update public.orders o
set paid_at = coalesce((
  select min(payment.created_at)
  from public.payments payment
  where payment.order_id = o.id and payment.status in ('succeeded','refunded','partially_refunded')
), o.updated_at)
where o.payment_status in ('paid','refunded','partially_refunded','disputed');

update public.analytics_events e
set is_internal = true
where exists (select 1 from public.projects p where p.id=e.project_id and p.analytics_internal)
   or exists (select 1 from public.orders o where o.id=e.order_id and o.analytics_internal)
   or exists (
     select 1 from public.profiles profile
     where profile.id=e.user_id
       and profile.role in ('super_admin','support','producer','reviewer','content_manager')
   );

alter table public.analytics_events enable row level security;
revoke all on table public.analytics_events from anon, authenticated;

create or replace function public.create_paid_order(p_project uuid, p_package uuid, p_email text, p_phone text, p_user uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare p public.projects; pkg public.packages; oid uuid;
begin
  select * into strict p from public.projects where id=p_project and deleted_at is null for update;
  select id into oid from public.orders where project_id=p_project and deleted_at is null order by created_at desc limit 1;
  if oid is not null then return oid; end if;
  select * into strict pkg from public.packages where id=p_package and is_active and slug='essential-song';
  if pkg.price_cents <> 1999 or pkg.currency <> 'usd' then raise exception 'Package must match the configured USD 19.99 price'; end if;
  if not exists(select 1 from recipients where project_id=p_project and length(name)>0)
    or not exists(select 1 from story_answers where project_id=p_project and length(favorite_memory)>=10 and length(what_makes_special)>=10)
    or not exists(select 1 from song_preferences where project_id=p_project and genre is not null and mood is not null)
    then raise exception 'Incomplete song customization'; end if;
  insert into orders(
    order_number,user_id,project_id,package_id,subtotal_cents,total_cents,currency,email,phone,
    revision_credits_remaining,estimated_delivery_at,idempotency_key,analytics_visitor_id,
    analytics_session_id,first_touch,last_touch,analytics_internal
  ) values (
    'MTM-'||upper(encode(gen_random_bytes(8),'hex')),p_user,p_project,p_package,1999,1999,'usd',p_email,p_phone,
    pkg.revision_credits,now()+make_interval(hours=>pkg.delivery_hours),'project:'||p_project,p.analytics_visitor_id,
    p.analytics_session_id,p.first_touch,p.last_touch,
    p.analytics_internal or lower(p_email) like '%@example.test' or lower(p_email) like '%+test@%'
  ) returning id into oid;
  insert into order_items(order_id,item_type,reference_id,name,quantity,unit_price_cents,total_cents)
  values(oid,'package',pkg.id,pkg.name,1,1999,1999);
  update projects set status='awaiting_payment',package_id=p_package where id=p_project;
  return oid;
end $$;

create or replace function public.apply_stripe_event(p_event text,p_type text,p_order uuid,p_state text,p_session text,p_intent text,p_price text,p_total integer,p_tax integer,p_refunded integer,p_name text)
returns boolean language plpgsql security definer set search_path=public as $$
declare o public.orders; stage text; touch jsonb;
begin
  select * into strict o from orders where id=p_order for update;
  insert into stripe_events(id,event_type,order_id) values(p_event,p_type,p_order) on conflict do nothing;
  if not found then return false; end if;
  if p_intent is null then raise exception 'Missing payment intent'; end if;
  if o.stripe_payment_intent_id is not null and o.stripe_payment_intent_id<>p_intent then raise exception 'Payment intent mismatch'; end if;
  if p_state='paid' then
    if o.stripe_checkout_session_id is distinct from p_session or o.stripe_price_id is distinct from p_price
      or o.currency<>'usd' or o.subtotal_cents<>1999 or p_total<1999 or p_tax<0 or p_total<>1999+p_tax then
      raise exception 'Payment does not match order';
    end if;
    if o.payment_status in ('refunded','partially_refunded','disputed') then return false; end if;
    update orders set payment_status='paid',stripe_payment_intent_id=p_intent,total_cents=p_total,tax_cents=p_tax,paid_at=coalesce(paid_at,now()),
      customer_name=p_name,status=case when payment_status<>'paid' then 'payment_confirmed'::order_status else status end where id=p_order;
    insert into payments(order_id,user_id,status,amount_cents,currency,stripe_payment_intent_id)
    values(p_order,o.user_id,'succeeded',p_total,o.currency,p_intent)
    on conflict(stripe_payment_intent_id) where stripe_payment_intent_id is not null do update set status='succeeded',amount_cents=p_total;
    foreach stage in array array['creative_brief','lyrics','music','cover_art','lyric_video','photo_video','quality_check','notify'] loop
      insert into generation_jobs(order_id,job_type,idempotency_key) values(p_order,stage::job_type,p_order||':'||stage) on conflict(idempotency_key) do nothing;
    end loop;
    update projects set status='converted' where id=o.project_id;

    if not o.analytics_internal then
      touch := case when o.last_touch <> '{}'::jsonb then o.last_touch else o.first_touch end;
      insert into analytics_events(
        event_name,session_id,visitor_id,user_id,project_id,order_id,properties,source,medium,campaign,content,is_internal,dedupe_key
      ) values (
        'purchase_completed',o.analytics_session_id,o.analytics_visitor_id,o.user_id,o.project_id,o.id,
        jsonb_build_object('value_cents',p_total,'currency',o.currency),
        coalesce(touch->>'source','direct'),touch->>'utm_medium',touch->>'utm_campaign',touch->>'utm_content',false,'purchase:'||o.id
      ) on conflict(dedupe_key) where dedupe_key is not null do nothing;
    end if;
  elsif p_state='failed' then
    if o.payment_status in ('pending','failed') then update orders set payment_status='failed' where id=p_order; end if;
  elsif p_state in ('refunded','partially_refunded','disputed') then
    update orders set payment_status=case when payment_status='disputed' then 'disputed' else p_state end,
      stripe_payment_intent_id=p_intent,status=case when p_state='refunded' then 'refunded'::order_status else status end where id=p_order;
    update payments set status=case when p_state='refunded' then 'refunded'::payment_status when p_state='partially_refunded' then 'partially_refunded'::payment_status else status end,
      refunded_cents=greatest(refunded_cents,p_refunded) where order_id=p_order and stripe_payment_intent_id=p_intent;
    update generation_jobs set status='cancelled' where order_id=p_order and status in ('queued','failed','running');
  else raise exception 'Unsupported payment state'; end if;
  return true;
end $$;

revoke all on function public.create_paid_order(uuid,uuid,text,text,uuid) from public;
revoke all on function public.apply_stripe_event(text,text,uuid,text,text,text,text,integer,integer,integer,text) from public;
grant execute on function public.create_paid_order(uuid,uuid,text,text,uuid),public.apply_stripe_event(text,text,uuid,text,text,text,text,integer,integer,integer,text) to service_role;

commit;
notify pgrst,'reload schema';
