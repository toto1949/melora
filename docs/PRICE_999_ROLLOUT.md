# USD 9.99 rollout

Prepared live Stripe Price: `price_1UFSq02ch11RmeHL4Bh9yb6W` for product `prod_VDuK4jYE2N7IpM`. One-time USD 999 cents, tax exclusive, active. Existing tax settings are retained.

## Required coordinated release

1. Confirm CI passes, including the payment database integration tests.
2. Apply `supabase/migrations/014_song_price_999.sql` to the production database. This changes only the active essential-song package and replaces the two payment functions. Existing orders retain their recorded amounts. The migration is transactional.
3. Set Vercel production `STRIPE_PRICE_ID` to `price_1UFSq02ch11RmeHL4Bh9yb6W`.
4. Merge and deploy this branch immediately after the configuration/database updates. Do not deploy the website price alone: the old database function still creates 1999-cent orders, so checkout would reject them.
5. Verify the displayed price and a new Stripe checkout session both show USD 9.99 before applicable tax. Do not submit a live payment for verification.

Historical USD 19.99 sessions remain valid; webhook validation matches their recorded order subtotal, price ID, session ID and payment intent. New sessions require 999 cents. Historical orders are not repriced.

If the cutover fails, restore the previous code and Stripe Price `price_1UECzf2ch11RmeHL5m7KTlB1` together with the previous create_paid_order definition and essential-song package price of 1999. Retain webhook compatibility for both amounts if any 999-cent sessions have been created.
