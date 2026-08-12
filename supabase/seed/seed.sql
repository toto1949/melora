-- Memories to Melody seed / demo content
-- Safe for local/staging. Reviews are marked is_demo = true.

insert into public.site_settings (key, value) values
  ('stats', '{"songsCreated":12840,"averageRating":4.9,"genresSupported":16,"countriesServed":42}'::jsonb),
  ('hero', '{"headline":"Turn your memories into a song they''ll keep forever.","supporting":"Share your story, choose your sound, and let our creative technology transform your favorite moments into a deeply personal song.","trustBadge":"Personalized music made from your memories"}'::jsonb)
on conflict (key) do update set value = excluded.value;

insert into public.packages (id, slug, name, description, price_cents, features, revision_credits, includes_video, includes_wav, includes_lyric_video, song_variations, delivery_hours, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'essential-song', 'Essential Song', 'Personalized lyrics, song, listening page, MP3.', 3900, '["Personalized lyrics","One generated song","Private listening page","MP3 download","Standard delivery"]', 1, false, false, false, 1, 48, 1),
  ('22222222-2222-2222-2222-222222222222', 'premium-story', 'Premium Story', 'Variations, WAV, artwork, lyric video, priority.', 7900, '["Everything in Essential","Multiple song variations","High-quality WAV","Custom cover artwork","Lyric video","Priority delivery","Revision credits"]', 3, false, true, true, 3, 24, 2),
  ('33333333-3333-3333-3333-333333333333', 'cinematic-memory', 'Cinematic Memory', 'Full keepsake with photo music video.', 14900, '["Everything in Premium","Photo-based music video","Multiple visual styles","Full HD download","Extended song duration","Priority processing"]', 5, true, true, true, 3, 18, 3)
on conflict (slug) do nothing;

insert into public.coupons (code, description, percent_off, is_active)
values ('WELCOME10', '10% off your first Memories to Melody song', 10, true)
on conflict (code) do nothing;

insert into public.faq_items (question, answer, category, sort_order) values
  ('How are Memories to Melody songs generated?', 'You share your story and preferences. We build a creative brief, draft lyrics, then generate audio through configured providers.', 'product', 1),
  ('How long does delivery take?', 'Essential songs typically arrive within 48 hours. Priority packages are faster.', 'delivery', 2),
  ('Who owns the music?', 'You receive a personal-use license. Commercial use requires a separate license.', 'licensing', 3);

insert into public.reviews (customer_name, occasion, rating, body, is_verified_purchase, is_demo, is_published, reviewed_at)
values
  ('Elena M.', 'Anniversary', 5, 'Demo review: Intimate, not generic.', true, true, true, current_date),
  ('Noah K.', 'Birthday', 5, 'Demo review: Setup was quick and the page looked beautiful.', true, true, true, current_date);
