-- Single-product launch for Memories to Melody.
-- Keep one personalized audio song at $19.99 and retire all other packages/add-ons for now.

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
  is_active = true,
  updated_at = now()
where slug = 'essential-song';

update public.packages
set
  is_active = false,
  updated_at = now()
where slug in ('premium-story', 'cinematic-memory');

update public.add_ons
set is_active = false
where is_active = true;

update public.coupons
set is_active = false
where is_active = true;
