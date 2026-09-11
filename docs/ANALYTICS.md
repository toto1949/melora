# Analytics and attribution

Memories to Melody combines consent-controlled browser analytics with first-party funnel events stored in Supabase. The database dashboard uses Stripe-webhook-confirmed orders for purchases and revenue.

## Funnel events

| Funnel step | Internal event | External event |
| --- | --- | --- |
| Public page view | `page_view` | GA4 page view, Vercel Analytics |
| Create Song click | `create_song_clicked` | GA4 `create_song_click` |
| Studio started | `studio_started` | GA4 `studio_started` |
| Studio progress | `studio_step_completed` | GA4 `studio_progress` |
| Checkout viewed | `checkout_viewed` | GA4 `view_checkout` |
| Checkout submitted | `begin_checkout` | GA4 `begin_checkout`, Meta `InitiateCheckout`, TikTok `InitiateCheckout` |
| Stripe Checkout created | `stripe_checkout_started` | Internal only |
| Paid purchase | `purchase_completed` | GA4 `purchase`, Meta `Purchase`, TikTok `CompletePayment` |

`purchase_completed` is inserted by `apply_stripe_event` in the same database transaction that accepts an idempotent, signature-verified paid Stripe event. The browser purchase events render only after the protected order-status endpoint reports `paymentStatus=paid`.

## Attribution

The client captures these URL parameters after analytics consent:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `gclid`
- `fbclid`
- `ttclid`

First-touch and last-touch values live in first-party cookies for 180 days, then copy into the Studio project and order. A 30-minute first-party session cookie supports session counts. Stripe metadata receives only `order_id`, first/last source, medium, campaign, and creative. Click IDs and all customer song content remain in the application database and never enter Stripe metadata.

Dynamic project and listening identifiers are normalized out of analytics paths. The ingestion endpoint accepts a small event allowlist, validates project ownership, enforces same-origin requests and rate limits, and discards all unexpected properties.

## Traffic exclusions

The business dashboard excludes:

- authenticated staff accounts;
- Vercel Preview and local environments;
- orders using `@example.test` or `+test@` email addresses;
- production QA sessions opened with `?analytics_test=1` for the following 24 hours;
- admin, dashboard, auth, listening, API, and payment-status page views.

Use a separate browser profile when validating paid campaign behavior. Clear the `mtm_analytics_test` cookie after intentional production QA if the same browser will later be used for real campaign testing.

## Vercel variables

Configure browser provider IDs only in Production:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_META_PIXEL_ID=...
NEXT_PUBLIC_TIKTOK_PIXEL_ID=...
```

Keep these unset in Preview and Development so those deployments cannot pollute production advertising or GA4 properties. The Supabase and Upstash variables already required by the application remain required for first-party event persistence and distributed ingestion rate limiting.

## Provider setup

1. In GA4, verify `begin_checkout` and `purchase` in DebugView, then mark `purchase` as a key event.
2. In Meta Events Manager, verify `InitiateCheckout` and `Purchase` against the production domain.
3. In TikTok Events Manager, create or select the production web pixel, put its ID in `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, and verify `InitiateCheckout` and `CompletePayment` with Test Events.
4. Keep the Stripe webhook subscribed to the payment, refund, and dispute events documented in `PAYMENT_PRODUCTION_REVIEW.md`.

The external browser pixels can miss customers who never return from Stripe. The internal dashboard remains authoritative because its purchase and revenue data comes from the webhook. GA4 Measurement Protocol, Meta Conversions API, and TikTok Events API can be added later if server-side ad-platform delivery is required.
