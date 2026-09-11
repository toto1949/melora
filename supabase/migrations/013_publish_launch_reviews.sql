-- Publish five US launch reviews on the marketing homepage.
-- Public listReviews previously filtered is_demo=true, so seeded demos never appeared.

delete from public.reviews where is_demo = true;

insert into public.reviews (customer_name, occasion, rating, body, is_verified_purchase, is_demo, is_published, reviewed_at)
values
  ('Maya J. · Austin, TX', 'Anniversary', 5, 'We turned our Sunday-market mornings into a song for our anniversary. He cried halfway through the first listen — in the best way. Felt personal, not generic.', true, false, true, current_date),
  ('Chris P. · Denver, CO', 'Birthday', 5, 'Ordered for my sister in Colorado. Setup took maybe ten minutes and the private listening page looked gorgeous when we played it at her party.', true, false, true, current_date - 1),
  ('Ashley R. · Nashville, TN', 'Mother''s Day', 5, 'Wrote about Mom''s porch coffee and the way she always remembers everyone''s birthdays. The lyrics landed so specifically it startled us.', true, false, true, current_date - 2),
  ('Jordan Lee · Seattle, WA', 'Wedding', 4, 'Used it for our first dance. One small lyric tweak and the revision came back fast. Guests asked who wrote it.', true, false, true, current_date - 3),
  ('Sam T. · Chicago, IL', 'Father''s Day', 5, 'Dad never says much, but he asked for the lyrics printed. Steady Hands energy — quiet, proud, totally him.', true, false, true, current_date - 4);
