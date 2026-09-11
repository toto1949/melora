-- Memories to Melody seed / demo content
-- Safe for local/staging. Reviews are marked is_demo = true.

insert into public.site_settings (key, value) values
  ('stats', '{"songsCreated":0,"averageRating":4.9,"genresSupported":16,"countriesServed":42}'::jsonb),
  ('hero', '{"headline":"Turn your memories into a song they''ll keep forever.","supporting":"Share your story, choose your sound, and let our creative technology transform your favorite moments into a deeply personal song.","trustBadge":"Personalized music made from your memories"}'::jsonb)
on conflict (key) do update set value = excluded.value;

insert into public.packages (id, slug, name, description, price_cents, features, revision_credits, includes_video, includes_wav, includes_lyric_video, song_variations, delivery_hours, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'essential-song', 'Personalized Audio Song', 'A complete personalized audio song created from your memories, with private listening, MP3 download, and one guided revision.', 1999, '["Personalized lyrics built from your memories","One complete personalized audio song","Choice of genre, mood, vocal style, and language","Private listening page","MP3 download","One guided revision","Standard delivery"]', 1, false, false, false, 1, 48, 1),
  ('22222222-2222-2222-2222-222222222222', 'premium-story', 'Premium Story', 'Reserved for a future release.', 7900, '["Future release"]', 3, false, false, false, 1, 24, 2),
  ('33333333-3333-3333-3333-333333333333', 'cinematic-memory', 'Cinematic Memory', 'Reserved for a future release.', 14900, '["Future release"]', 5, true, true, true, 3, 18, 3)
on conflict (slug) do nothing;

update public.packages
set
  name = 'Personalized Audio Song',
  description = 'A complete personalized audio song created from your memories, with private listening, MP3 download, and one guided revision.',
  price_cents = 1999,
  features = '["Personalized lyrics built from your memories","One complete personalized audio song","Choice of genre, mood, vocal style, and language","Private listening page","MP3 download","One guided revision","Standard delivery"]'::jsonb,
  revision_credits = 1,
  includes_video = false,
  includes_wav = false,
  includes_lyric_video = false,
  song_variations = 1,
  delivery_hours = 48,
  is_active = true
where slug = 'essential-song';

update public.packages
set is_active = false
where slug in ('premium-story', 'cinematic-memory');

update public.add_ons
set is_active = false
where is_active = true;

insert into public.coupons (code, description, percent_off, is_active)
values ('WELCOME10', '10% off your first Memories to Melody song', 10, false)
on conflict (code) do update set is_active = false;

insert into public.faq_items (question, answer, category, sort_order) values
  ('How are Memories to Melody songs generated?', 'You share your story and preferences. We build a creative brief, draft lyrics, then generate audio through configured providers.', 'product', 1),
  ('How long does delivery take?', 'Personalized audio songs typically arrive within 48 hours.', 'delivery', 2),
  ('Who owns the music?', 'You receive a personal-use license. Commercial use requires a separate license.', 'licensing', 3);

insert into public.reviews (customer_name, occasion, rating, body, is_verified_purchase, is_demo, is_published, reviewed_at)
values
  ('Elena M.', 'Anniversary', 5, 'Demo review: Intimate, not generic.', true, true, true, current_date),
  ('Noah K.', 'Birthday', 5, 'Demo review: Setup was quick and the page looked beautiful.', true, true, true, current_date);
