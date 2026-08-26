-- Final audio-release product alignment.
-- Adds opt-in recipient delivery and removes package promises that require
-- provider capabilities not enabled in the audio-only release.

alter table public.recipients
  add column if not exists email text,
  add column if not exists send_gift_email boolean not null default false;

alter table public.recipients
  drop constraint if exists recipients_email_length_check;

alter table public.recipients
  add constraint recipients_email_length_check
  check (
    (email is null or char_length(email) <= 254)
    and (not send_gift_email or nullif(btrim(email), '') is not null)
  );

update public.packages
set
  description = 'Custom artwork, priority delivery, and extra revision support.',
  features = '["Everything in Essential","Custom cover artwork","Priority 24-hour delivery","Three guided revision credits","Recipient gift email delivery"]'::jsonb,
  includes_video = false,
  includes_wav = false,
  includes_lyric_video = false,
  song_variations = 1,
  updated_at = now()
where slug = 'premium-story';

update public.packages
set
  is_active = false,
  updated_at = now()
where slug = 'cinematic-memory';

notify pgrst, 'reload schema';
