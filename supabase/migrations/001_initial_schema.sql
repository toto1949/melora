-- Melora initial schema
-- PostgreSQL + Supabase RLS

create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum (
  'customer', 'super_admin', 'support', 'producer', 'reviewer', 'content_manager'
);

create type project_status as enum (
  'draft', 'awaiting_payment', 'abandoned', 'converted'
);

create type order_status as enum (
  'draft',
  'awaiting_payment',
  'payment_confirmed',
  'writing_lyrics',
  'creating_music',
  'creating_video',
  'quality_review',
  'ready',
  'revision_requested',
  'revising',
  'completed',
  'failed',
  'refunded'
);

create type job_status as enum (
  'queued', 'running', 'succeeded', 'failed', 'dead_letter', 'cancelled'
);

create type job_type as enum (
  'creative_brief',
  'lyrics',
  'music',
  'cover_art',
  'lyric_video',
  'photo_video',
  'quality_check',
  'notify'
);

create type privacy_mode as enum ('private', 'password', 'unlisted', 'public');

create type payment_status as enum (
  'pending', 'requires_action', 'succeeded', 'failed', 'refunded', 'partially_refunded'
);

create type revision_status as enum (
  'requested', 'in_progress', 'completed', 'rejected', 'cancelled'
);

create type support_status as enum ('open', 'pending', 'resolved', 'closed');

create type media_kind as enum (
  'portrait', 'couple', 'family', 'video_clip', 'cover', 'audio', 'lyric_video', 'music_video'
);

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  locale text not null default 'en',
  currency text not null default 'usd',
  country text,
  marketing_opt_in boolean not null default false,
  training_opt_in boolean not null default false,
  suspended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd',
  features jsonb not null default '[]'::jsonb,
  revision_credits integer not null default 0,
  includes_video boolean not null default false,
  includes_wav boolean not null default false,
  includes_lyric_video boolean not null default false,
  song_variations integer not null default 1,
  delivery_hours integer not null default 48,
  stripe_price_id text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.add_ons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd',
  stripe_price_id text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  guest_token text unique,
  status project_status not null default 'draft',
  current_step integer not null default 1 check (current_step between 1 and 8),
  occasion text,
  package_id uuid references public.packages(id),
  locale text not null default 'en',
  estimated_minutes integer not null default 5,
  last_saved_at timestamptz not null default now(),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index projects_user_id_idx on public.projects(user_id);
create index projects_guest_token_idx on public.projects(guest_token);
create index projects_status_idx on public.projects(status);

create table public.recipients (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  name text not null,
  pronunciation text,
  relationship text,
  pronouns text,
  nickname text,
  from_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.story_answers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  how_they_met text,
  favorite_memory text,
  important_dates text,
  meaningful_places text,
  inside_jokes text,
  challenges_overcome text,
  what_makes_special text,
  personal_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.song_preferences (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  genre text,
  custom_style text,
  mood text,
  energy text,
  tempo text,
  vocal_type text,
  duet_preference text,
  language text default 'en',
  explicit_content boolean not null default false,
  instruments text[] default '{}',
  lyric_tone text,
  must_include text[] default '{}',
  must_exclude text[] default '{}',
  chorus_message text,
  desired_length text,
  video_style text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_uploads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  kind media_kind not null,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  duration_seconds numeric,
  sort_order integer not null default 0,
  consent_confirmed boolean not null default false,
  malware_scan_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index media_uploads_project_id_idx on public.media_uploads(project_id);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  percent_off integer check (percent_off is null or (percent_off > 0 and percent_off <= 100)),
  amount_off_cents integer check (amount_off_cents is null or amount_off_cents > 0),
  currency text default 'usd',
  max_redemptions integer,
  redemption_count integer not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  stripe_coupon_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  project_id uuid not null references public.projects(id),
  package_id uuid not null references public.packages(id),
  coupon_id uuid references public.coupons(id),
  status order_status not null default 'awaiting_payment',
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'usd',
  delivery_speed text not null default 'standard',
  estimated_delivery_at timestamptz,
  email text not null,
  phone text,
  revision_credits_remaining integer not null default 0,
  share_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  privacy_mode privacy_mode not null default 'unlisted',
  password_hash text,
  gift_reveal_enabled boolean not null default true,
  gift_reveal_message text default 'Someone created something special for you.',
  creative_brief jsonb,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  idempotency_key text unique,
  failed_reason text,
  ready_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_share_token_idx on public.orders(share_token);
create index orders_order_number_idx on public.orders(order_number);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type text not null check (item_type in ('package', 'add_on', 'credit_pack', 'subscription')),
  reference_id uuid,
  name text not null,
  quantity integer not null default 1,
  unit_price_cents integer not null,
  total_cents integer not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items(order_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  status payment_status not null default 'pending',
  amount_cents integer not null,
  currency text not null default 'usd',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  failure_message text,
  refunded_cents integer not null default 0,
  raw_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_order_id_idx on public.payments(order_id);

create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  job_type job_type not null,
  status job_status not null default 'queued',
  progress integer not null default 0 check (progress between 0 and 100),
  attempt integer not null default 0,
  max_attempts integer not null default 5,
  idempotency_key text not null unique,
  provider text,
  provider_job_id text,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,
  next_retry_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generation_jobs_order_id_idx on public.generation_jobs(order_id);
create index generation_jobs_status_idx on public.generation_jobs(status);

create table public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  song_version_id uuid,
  kind media_kind not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  duration_seconds numeric,
  metadata jsonb not null default '{}'::jsonb,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.song_versions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  version_number integer not null,
  title text not null,
  lyrics text not null,
  timed_lyrics jsonb,
  audio_asset_id uuid references public.generated_assets(id) on delete set null,
  cover_asset_id uuid references public.generated_assets(id) on delete set null,
  video_asset_id uuid references public.generated_assets(id) on delete set null,
  genre text,
  mood text,
  vocal_type text,
  language text,
  duration_seconds numeric,
  is_current boolean not null default true,
  created_by text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, version_number)
);

alter table public.generated_assets
  add constraint generated_assets_song_version_fk
  foreign key (song_version_id) references public.song_versions(id) on delete set null;

create table public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  status revision_status not null default 'requested',
  categories text[] not null default '{}',
  notes text not null,
  timestamps text[] default '{}',
  resulting_version_id uuid references public.song_versions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  customer_name text not null,
  occasion text,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  is_verified_purchase boolean not null default false,
  is_demo boolean not null default false,
  is_published boolean not null default false,
  media_url text,
  media_kind text,
  reviewed_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.sample_songs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  recipient_type text not null,
  occasion text not null,
  genre text not null,
  mood text not null,
  vocal_type text not null,
  language text not null default 'en',
  duration_seconds integer not null,
  cover_url text not null,
  audio_url text not null,
  lyrics_preview text not null,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.reaction_videos (
  id uuid primary key default gen_random_uuid(),
  customer_first_name text not null,
  occasion text not null,
  quote text,
  thumbnail_url text not null,
  video_url text not null,
  caption_url text,
  is_demo boolean not null default true,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications(user_id);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  email text not null,
  subject text not null,
  body text not null,
  status support_status not null default 'open',
  assignee_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_logs_created_at_idx on public.audit_logs(created_at desc);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  session_id text,
  user_id uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_name_idx on public.analytics_events(event_name);
create index analytics_events_created_at_idx on public.analytics_events(created_at desc);

create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'general',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, order_id)
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger packages_updated_at before update on public.packages
  for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger generation_jobs_updated_at before update on public.generation_jobs
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.recipients enable row level security;
alter table public.story_answers enable row level security;
alter table public.song_preferences enable row level security;
alter table public.media_uploads enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.generated_assets enable row level security;
alter table public.song_versions enable row level security;
alter table public.revision_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.support_tickets enable row level security;
alter table public.favorites enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('super_admin', 'support', 'producer', 'reviewer', 'content_manager')
      and p.deleted_at is null
      and p.suspended_at is null
  );
$$;

create policy "profiles_select_own_or_staff" on public.profiles
  for select using (auth.uid() = id or public.is_staff());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "projects_select_own_or_staff" on public.projects
  for select using (auth.uid() = user_id or public.is_staff());
create policy "projects_update_own_or_staff" on public.projects
  for update using (auth.uid() = user_id or public.is_staff());

create policy "orders_select_own_or_staff" on public.orders
  for select using (auth.uid() = user_id or public.is_staff());

create policy "notifications_own" on public.notifications
  for all using (auth.uid() = user_id);

create policy "reviews_public_read" on public.reviews
  for select using (is_published = true or public.is_staff());

create policy "faq_public_read" on public.faq_items
  for select using (is_published = true or public.is_staff());

create policy "samples_public_read" on public.sample_songs
  for select using (is_published = true or public.is_staff());

create policy "reactions_public_read" on public.reaction_videos
  for select using (is_published = true or public.is_staff());

create policy "packages_public_read" on public.packages
  for select using (is_active = true or public.is_staff());

create policy "settings_public_read" on public.site_settings
  for select using (true);
