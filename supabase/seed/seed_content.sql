-- Supplemental content seed: add-ons, sample songs, reaction videos
-- Idempotent: safe to run multiple times.

insert into public.add_ons (slug, name, description, price_cents, currency, is_active, sort_order)
values
  ('rush-delivery', 'Rush delivery', 'Move to the front of the creative queue.', 1900, 'usd', true, 1),
  ('extra-revision', 'Extra revision credit', 'One additional guided revision pass.', 1500, 'usd', true, 2),
  ('printed-lyrics-card', 'Printable lyric card', 'A beautifully designed PDF of the final lyrics.', 900, 'usd', true, 3)
on conflict (slug) do nothing;

insert into public.sample_songs
  (slug, title, recipient_type, occasion, genre, mood, vocal_type, language, duration_seconds, cover_url, audio_url, lyrics_preview, sort_order)
values
  ('golden-hour-anniversary', 'Golden Hour With You', 'Partner', 'anniversary', 'acoustic', 'Romantic', 'Soft female', 'en', 178,
   '/samples/covers/golden-hour.svg', '/samples/audio/placeholder-tone.wav',
   'In the golden hour we found our quiet place / Every glance a promise written on your face...', 1),
  ('birthday-spark', 'Another Lap Around the Sun', 'Best friend', 'birthday', 'pop', 'Celebratory', 'Female', 'en', 165,
   '/samples/covers/birthday-spark.svg', '/samples/audio/placeholder-tone.wav',
   'Candles catch the laughter in the room / Here''s to every chapter still in bloom...', 2),
  ('fathers-steady-hands', 'Steady Hands', 'Father', 'fathers-day', 'country', 'Nostalgic', 'Warm male', 'en', 192,
   '/samples/covers/steady-hands.svg', '/samples/audio/placeholder-tone.wav',
   'You taught me how to stand when winds get loud / Your steady hands still make me proud...', 3),
  ('new-baby-lullaby', 'Little Light', 'Newborn', 'new-baby', 'soul', 'Tender', 'Soft female', 'en', 154,
   '/samples/covers/little-light.svg', '/samples/audio/placeholder-tone.wav',
   'Welcome, little light, into our open arms / The world grows softer with your calm...', 4),
  ('wedding-vows-in-melody', 'All Our Tomorrows', 'Spouse', 'wedding', 'rnb', 'Romantic', 'Duet', 'en', 201,
   '/samples/covers/tomorrows.svg', '/samples/audio/placeholder-tone.wav',
   'I take your hand through every unknown sky / All our tomorrows start tonight...', 5),
  ('gracias-mama', 'Gracias, Mamá', 'Mother', 'mothers-day', 'latin', 'Emotional', 'Male', 'es', 188,
   '/samples/covers/gracias-mama.svg', '/samples/audio/placeholder-tone.wav',
   'Por cada noche que velaste por mí / Esta canción te abraza sin fin...', 6)
on conflict (slug) do nothing;

insert into public.reaction_videos (customer_first_name, occasion, quote, thumbnail_url, video_url, is_demo, sort_order)
select v.* from (
  values
    ('Amelia', 'Anniversary', 'I couldn''t stop crying—in the best way.', '/samples/reactions/amelia.svg', '/samples/reactions/demo-reaction.mp4', true, 1),
    ('Jordan', 'Birthday', 'He played it three times before dinner.', '/samples/reactions/jordan.svg', '/samples/reactions/demo-reaction.mp4', true, 2),
    ('Priya', 'Wedding', 'Our whole table went quiet, then cheered.', '/samples/reactions/priya.svg', '/samples/reactions/demo-reaction.mp4', true, 3),
    ('Marcus', 'Father''s Day', 'Dad asked for the lyrics on paper.', '/samples/reactions/marcus.svg', '/samples/reactions/demo-reaction.mp4', true, 4)
) as v(customer_first_name, occasion, quote, thumbnail_url, video_url, is_demo, sort_order)
where not exists (
  select 1 from public.reaction_videos r
  where r.customer_first_name = v.customer_first_name and r.occasion = v.occasion
);
