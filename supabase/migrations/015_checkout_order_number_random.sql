-- Qualify the random source: security-definer functions cannot resolve pgcrypto in the extensions schema.
create or replace function public.create_paid_order(p_project uuid, p_package uuid, p_email text, p_phone text, p_user uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare p public.projects; pkg public.packages; oid uuid;
begin
  select * into strict p from public.projects where id=p_project and deleted_at is null for update;
  select id into oid from public.orders where project_id=p_project and deleted_at is null order by created_at desc limit 1;
  if oid is not null then return oid; end if;
  select * into strict pkg from public.packages where id=p_package and is_active and slug='essential-song';
  if pkg.price_cents <> 999 or pkg.currency <> 'usd' then raise exception 'Package must match the configured USD 9.99 price'; end if;
  if not exists(select 1 from recipients where project_id=p_project and length(name)>0)
    or not exists(select 1 from story_answers where project_id=p_project and length(favorite_memory)>=10 and length(what_makes_special)>=10)
    or not exists(select 1 from song_preferences where project_id=p_project and genre is not null and mood is not null)
    then raise exception 'Incomplete song customization'; end if;
  insert into orders(
    order_number,user_id,project_id,package_id,subtotal_cents,total_cents,currency,email,phone,
    revision_credits_remaining,estimated_delivery_at,idempotency_key,analytics_visitor_id,
    analytics_session_id,first_touch,last_touch,analytics_internal
  ) values (
    'MTM-'||upper(substr(replace(pg_catalog.gen_random_uuid()::text,'-',''),1,16)),p_user,p_project,p_package,999,999,'usd',p_email,p_phone,
    pkg.revision_credits,now()+make_interval(hours=>pkg.delivery_hours),'project:'||p_project,p.analytics_visitor_id,
    p.analytics_session_id,p.first_touch,p.last_touch,
    p.analytics_internal or lower(p_email) like '%@example.test' or lower(p_email) like '%+test@%'
  ) returning id into oid;
  insert into order_items(order_id,item_type,reference_id,name,quantity,unit_price_cents,total_cents)
  values(oid,'package',pkg.id,pkg.name,1,999,999);
  update projects set status='awaiting_payment',package_id=p_package where id=p_project;
  return oid;
end $$;

revoke all on function public.create_paid_order(uuid,uuid,text,text,uuid) from public;
grant execute on function public.create_paid_order(uuid,uuid,text,text,uuid) to service_role;
notify pgrst,'reload schema';
