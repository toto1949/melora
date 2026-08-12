-- Memories to Melody production setup: auth profile trigger, storage bucket, policies

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'melora-media',
  'melora-media',
  false,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "melora_service_role_storage" on storage.objects;
create policy "melora_service_role_storage"
on storage.objects for all
to service_role
using (bucket_id = 'melora-media')
with check (bucket_id = 'melora-media');

drop policy if exists "melora_authenticated_uploads" on storage.objects;
create policy "melora_authenticated_uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'melora-media');

drop policy if exists "melora_authenticated_read_own" on storage.objects;
create policy "melora_authenticated_read_own"
on storage.objects for select
to authenticated
using (bucket_id = 'melora-media' and (storage.foldername(name))[1] = auth.uid()::text);

create index if not exists orders_share_token_idx on public.orders(share_token);
create index if not exists generation_jobs_status_idx on public.generation_jobs(status);
