begin;
-- Resolve staff checks without recursive profile RLS; callers can only inspect their own auth.uid().
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from profiles where id=auth.uid() and role in ('super_admin','support','producer','reviewer','content_manager') and deleted_at is null and suspended_at is null)
$$;
-- Prevent in-flight workers from overwriting refund state, or creating new unpaid stages.
create function public.guard_order_generation() returns trigger language plpgsql set search_path=public as $$
begin
 if new.payment_status<>'paid' and new.status<>old.status and new.status in ('payment_confirmed','writing_lyrics','creating_music','creating_video','quality_review','ready','completed') then
   raise exception 'Paid payment required';
 end if;
 return new;
end $$;
create trigger orders_payment_guard before update on orders for each row execute function guard_order_generation();
create function public.guard_generation_enqueue() returns trigger language plpgsql set search_path=public as $$
begin
 perform 1 from orders where id=new.order_id and payment_status='paid' for update;
 if not found then raise exception 'Paid payment required'; end if;
 return new;
end $$;
create trigger generation_payment_guard before insert on generation_jobs for each row execute function guard_generation_enqueue();

-- Freeze stories at checkout, including races with a last form save.
create function public.guard_checkout_customization() returns trigger language plpgsql set search_path=public as $$
declare pid uuid; state project_status;
begin
 pid:=case when TG_OP='DELETE' then old.project_id else new.project_id end;
 select status into state from projects where id=pid for update;
 if state<>'draft' then raise exception 'Customization is locked after checkout'; end if;
 return case when TG_OP='DELETE' then old else new end;
end $$;
create trigger recipient_checkout_lock before insert or update or delete on recipients for each row execute function guard_checkout_customization();
create trigger story_checkout_lock before insert or update or delete on story_answers for each row execute function guard_checkout_customization();
create trigger preferences_checkout_lock before insert or update or delete on song_preferences for each row execute function guard_checkout_customization();
create trigger media_checkout_lock before insert or update or delete on media_uploads for each row execute function guard_checkout_customization();
-- Keep existing historical package/order records; align only the advertised base package.
update packages set price_cents=799,currency='usd' where slug='essential-song';
revoke all on function guard_order_generation(),guard_generation_enqueue(),guard_checkout_customization() from public;
commit;
notify pgrst,'reload schema';
