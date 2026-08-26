-- Audio-only production launch: sell Essential + Premium, hide video packages.
-- Re-enable video/WAV/variation promises only after their production pipelines are approved.

update public.packages
set
  description = 'Custom artwork, priority delivery, and extra revision support.',
  features = '["Everything in Essential","Custom cover artwork","Priority 24-hour delivery","Three guided revision credits","Recipient gift email delivery"]'::jsonb,
  includes_video = false,
  includes_wav = false,
  includes_lyric_video = false,
  song_variations = 1,
  is_active = true,
  updated_at = now()
where slug = 'premium-story';

update public.packages
set
  is_active = false,
  updated_at = now()
where slug = 'cinematic-memory';
