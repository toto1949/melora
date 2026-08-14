-- Audio-only production launch: sell Essential + Premium, hide video packages.
-- Re-enable cinematic-memory and restore Premium lyric video when VIDEO_FEATURE_ENABLED=true.

update public.packages
set
  description = 'More variations, artwork, WAV, and faster delivery.',
  features = '["Everything in Essential","Multiple song variations","High-quality WAV","Custom cover artwork","Priority delivery","Revision credits"]'::jsonb,
  includes_lyric_video = false,
  is_active = true,
  updated_at = now()
where slug = 'premium-story';

update public.packages
set
  is_active = false,
  updated_at = now()
where slug = 'cinematic-memory';
