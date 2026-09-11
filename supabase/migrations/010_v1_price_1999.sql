begin;

-- Stripe Price amounts are immutable. Keep historical orders unchanged and align
-- only new v1 orders with the replacement one-time USD $19.99 Price.
update public.packages
set price_cents = 1999, currency = 'usd'
where slug = 'essential-song';

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
  insert into orders(order_number,user_id,project_id,package_id,subtotal_cents,total_cents,currency,email,phone,revision_credits_remaining,estimated_delivery_at,idempotency_key)
  values ('MTM-'||upper(encode(gen_random_bytes(8),'hex')),p_user,p_project,p_package,1999,1999,'usd',p_email,p_phone,pkg.revision_credits,now()+make_interval(hours=>pkg.delivery_hours),'project:'||p_project)
  returning id into oid;
  insert into order_items(order_id,item_type,reference_id,name,quantity,unit_price_cents,total_cents)
  values(oid,'package',pkg.id,pkg.name,1,1999,1999);
  update projects set status='awaiting_payment',package_id=p_package where id=p_project;
  return oid;
end $$;

create or replace function public.apply_stripe_event(p_event text,p_type text,p_order uuid,p_state text,p_session text,p_intent text,p_price text,p_total integer,p_tax integer,p_refunded integer,p_name text)
returns boolean language plpgsql security definer set search_path=public as $$
declare o public.orders; stage text;
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
