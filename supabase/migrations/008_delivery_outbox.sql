begin;
create table public.email_outbox (
  key text primary key, order_id uuid references orders(id), to_email text not null,
  template text not null, data jsonb not null default '{}', payload jsonb,
  status text not null default 'pending' check(status in ('pending','sending','sent','failed','review')),
  attempt integer not null default 0, first_attempt_at timestamptz, leased_until timestamptz,
  provider_id text, created_at timestamptz not null default now()
);
alter table public.email_outbox enable row level security;
create function public.enqueue_confirmation() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.payment_status='paid' and old.payment_status<>'paid' then
  insert into email_outbox(key,order_id,to_email,template,data)
  values('order-confirmation-'||new.id,new.id,new.email,'order-confirmation',jsonb_build_object('orderNumber',new.order_number,'estimatedDelivery',new.estimated_delivery_at))
  on conflict do nothing;
 end if;
 return new;
end $$;
create trigger order_confirmation_outbox after update on public.orders for each row execute function public.enqueue_confirmation();
create function public.claim_email(p_key text,p_payload jsonb)
returns public.email_outbox language plpgsql security definer set search_path=public as $$
declare item public.email_outbox;
begin
 select * into strict item from email_outbox where key=p_key for update;
 if item.order_id is not null and not exists(select 1 from orders where id=item.order_id and payment_status='paid') then
   update email_outbox set status='review' where key=p_key; return null;
 end if;
 if item.status in ('sent','review') or item.leased_until>now() then return null; end if;
 -- Resend keys expire after 24h. Never blindly send an ambiguous message beyond that boundary.
 if item.first_attempt_at<now()-interval '23 hours' or item.attempt>=5 then
   update email_outbox set status='review' where key=p_key; return null;
 end if;
 update email_outbox set status='sending',attempt=attempt+1,
   payload=coalesce(payload,p_payload),first_attempt_at=coalesce(first_attempt_at,now()),leased_until=now()+interval '5 minutes'
 where key=p_key returning * into item;
 return item;
end $$;
revoke all on function public.claim_email(text,jsonb),public.enqueue_confirmation() from public;
grant execute on function public.claim_email(text,jsonb) to service_role;
commit;
notify pgrst,'reload schema';
