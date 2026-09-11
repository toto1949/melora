# Memories to Melody — payment and fulfillment review

ZEVYNTA LABS LLC · https://memoriestomelody.com · 2026-09-08

## Release status

The v1 payment and fulfillment implementation is deployed to Production. Production migrations 005–011 are applied, the public site and Stripe catalog use USD $19.99 for new orders, and the live webhook destination is active with all seven required events. Production health reports every required dependency configured and reachable.

The first historical live $19.00 order exposed two legacy issues: its older Checkout used camelCase metadata and predated the payment ledger, while Kunavo had returned a terminal upstream error. The payment was reconciled only after its exact live Checkout Session, PaymentIntent, charge, amount, currency, customer, and order metadata were verified in Stripe. The same paid order was retried without another charge. A fresh provider task completed, all eight pipeline stages succeeded, private audio and cover assets were archived, the 2:51 audio played from the private listening page, and song-ready delivery receipts were stored.

Preview has isolated Supabase, Upstash, Stripe sandbox Price, provider, malware-scanning, and controlled email configuration. Its separate Stripe webhook destination exists, but its signing secret still needs to be stored in Preview and its temporary deployment-protection bypass credentials must be rotated before relying on Preview webhook tests.

## 1. Architecture discovered before changes

| Area | Existing implementation |
|---|---|
| Framework | Next.js 16.3.0 App Router; React 19.1.0; TypeScript 5.9.3; Tailwind 4; pnpm lockfile |
| UI/backend | Route groups for marketing, studio, dashboard, admin; React Server Components, client forms, Server Actions, Node Route Handlers |
| Checkout | `checkoutAction` Server Action creates an order, then `stripe.checkout.sessions.create`; the code was already using Sessions, not the separately configured static Payment Link |
| Stripe SDK | stripe-node 22.4.0; browser Stripe.js dependency installed but unnecessary for hosted Checkout |
| Form | Eight-step studio; occasion, recipient/name/pronunciation/relationship, private story answers, genre/mood/vocals/language/instruments, lyric directions, uploads, review, checkout |
| Database | Supabase PostgreSQL via service-role repository; existing `projects`, customization tables, `orders`, `order_items`, `payments`, `generation_jobs`, `song_versions`, `generated_assets` |
| Auth | Supabase Auth and SSR cookies; guest projects have a random token in an HttpOnly SameSite=Lax cookie; filesystem mock repository for local development |
| Generation | Existing ordered durable stages: creative brief → lyrics → music → cover → optional videos → QA → notify; atomic job claim RPC, bounded retries |
| Providers | OpenAI-compatible lyrics; Kunavo async Suno v5 music adapter; optional generic HTTP music adapter; built-in/provider cover art; disabled video release |
| Storage | Existing private Supabase `melora-media` bucket and signed URLs; generated provider URLs were previously retained directly |
| Email | Resend 6.18.1 and existing templates; gift email opt-in already supported |
| Deployment | `vercel.json` daily fallback cron; migrations 003/005 configure a one-minute Supabase Cron → pg_net → worker endpoint using Vault secrets |
| Prior success/cancel | `/studio/[projectId]/success?orderId=...`; cancel returned to studio checkout. Requested root payment pages did not exist |
| Observability | Structured JSON console logger and analytics events; no separate error-monitoring provider found |

## 2. Problems found and repaired

- Webhook signature verification existed, but completed events did not verify successful payment, configured price, total, currency, Session/Intent association, or live/test mode.
- Payment updates and job enqueue were separate writes with no Stripe event ledger. Failed jobs could be replaced by new jobs with fresh idempotency keys.
- Stripe line items created new ad hoc price/product data. The app imposed a fixed 8% tax independent of Stripe Tax.
- Order creation was multi-step and not transactional; client-generated idempotency keys did not prevent purchases duplicated across tabs. Coupon redemption occurred before payment.
- Generation and manual retry lacked a payment-state gate. Retry reset the attempt count.
- Kunavo retries always submitted POST again, including after provider idempotency retention expired.
- Success-page UUID access exposed customer email and the song token. Missing-user/null-owner checks allowed access to guest/customer records in several routes.
- Listening-page client props included the complete order/project, including story and creative brief.
- Supabase profile update privileges could permit role escalation; customization could race with checkout.
- Resend idempotency alone expired after 24 hours; confirmation delivery was non-durable post-response work.
- Provider outputs were not copied to private application storage; lyrics failures silently fell back to mock content and logged provider response bodies.
- Redis failure fell back to per-instance limits, weakening production abuse protection.

## 3. Implementation decisions

Reuse the existing Server Action as the framework-equivalent checkout endpoint. No parallel `/api/checkout` route or duplicate order model was introduced.

The requested release supports the existing Essential Song package at **1999 cents USD**, through `STRIPE_PRICE_ID`. Other package records and historic orders are preserved. Live checkout offers this single configured purchase; premium/add-ons/coupons need explicit Stripe Price/discount mappings before being sold through this flow. Mock checkout can retain the existing local options. Tax is calculated by Stripe; the UI labels its amount as before tax.

`create_paid_order` locks the project and atomically creates the order, order item, and project transition. Repeat requests reuse that project's existing order. Story data stays in its existing tables and becomes immutable at checkout. A new story requires a new project.

Checkout creates identifier-only `metadata.order_id` on both Session and PaymentIntent, uses hosted name/address collection and automatic tax, and persists a Session binding before returning its URL. Session creation uses an order/attempt idempotency key with stable expiration parameters. An open Session is reused; only a server-retrieved expired Session can rotate to a new attempt. Complete Sessions lead to the status page. An old request with an unknown outcome stops for reconciliation rather than risking another payment.

`/payment-success?order_id=<uuid>` and `/payment-cancelled?order_id=<uuid>` fetch a minimal owner-authorized status endpoint. An order UUID is a locator, not a credential. Neither page nor status endpoint starts generation. Legacy success URLs redirect to the same safe page. Guests retain access through their original cookie; finished songs are delivered through the existing random listening link. A lost guest cookie does not expose the song through an email/order-number lookup; support must verify ownership.

## 4. Database migrations

Apply **007 → 008 → 009 → 010 → 011**, after confirming the existing 001–006 deployment state:

- `007_payment_integrity.sql`: adds explicit order payment state, Stripe price/intent/session bindings, checkout attempts/expiry and customer name; unique payment identifiers; identifier-only Stripe event ledger; transactional create/bind/rotate/fulfillment RPCs; paid/prerequisite-gated atomic job claims; restricts profile update and direct upload/project mutation privileges.
- `008_delivery_outbox.sql`: durable email ledger, confirmation trigger within the payment transaction, email claim lease, delivery receipt, retry ceiling, and an explicit review state beyond safe provider retention.
- `009_payment_guardrails.sql`: prevents unpaid generation enqueue and stale workers overwriting refunded state; freezes customization tables at checkout; fixes recursive staff checks; aligns only the Essential package's price to 799 USD.
- `010_v1_price_1999.sql`: preserves historical orders while aligning new v1 orders, items, payment validation, and the Essential catalog entry with the replacement $19.99 Price.
- `011_single_audio_launch.sql`: keeps one focused audio-song offer active at $19.99 and disables unreleased packages, add-ons, and coupons without deleting historical records.

These migrations were executed against isolated PostgreSQL 16, including real transactions and parallel connections. Tests use small Supabase auth/storage stubs; they do **not** certify the live Supabase RLS/Vault/pg_net configuration.

**Historical data:** existing order statuses are deliberately NOT interpreted as proof of payment. Added payment state defaults to pending. Before production rollout, reconcile historical paid orders against Stripe, including orders with old prices/metadata, and copy verified payment bindings/state without enqueueing new generation or sending new confirmations. In-flight historical jobs will be blocked until reconciled. Existing asset URLs also need a separately reviewed archival/backfill procedure. No customer rows are deleted. Unique index creation fails and rolls back if historical duplicate payment IDs exist; inspect and resolve duplicates without blindly deleting records.

## 5. Stripe webhook behavior

Production URL: `https://memoriestomelody.com/api/stripe/webhook`

Handled events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

The handler reads the raw body, verifies `Stripe-Signature`, then retrieves authoritative Session/PaymentIntent/charge state. Only a settled eligible payment with the bound one-item price can become paid. An unpaid completed Session is acknowledged without fulfillment. Refunds and disputes are taken from current Stripe state so delayed events cannot restore paid eligibility. Partial refunds conservatively suspend further generation. Dispute closure requires operator review before restoration, including won disputes.

Within one database transaction: lock order → deduplicate event ID → persist payment → mark order paid → enqueue existing stage keys → enqueue confirmation email. The lock order was validated with simultaneous events and fixed after the test exposed a foreign-key lock-upgrade deadlock. Invalid signatures return 400; Stripe/database processing failures return 500 for delivery retry. Other products/static links without `order_id` never authorize songs.

## 6. Generation, storage and delivery

Both application entry points and database job claims require `payment_status='paid'`. Claims enforce stage prerequisites, attempts, retry time, and a lease. Refunds cancel pending work; work already submitted to an external provider cannot be recalled, but later stages cannot start and database guards prevent a stale worker marking the refunded order completed.

Kunavo retries poll the saved `provider_job_id` after timeouts and other uncertain outcomes. When Kunavo confirms a terminal failure, the worker clears that provider ID and rotates the idempotency key so the next bounded attempt creates a fresh task instead of replaying the failed result. Support may queue at most two fresh retries for the same paid failed/dead-letter job; each retry keeps the order and payment, clears the old provider task, and never creates another Checkout. Unknown submissions beyond 23 hours stop for reconciliation. The generic HTTP adapter is preserved, but automatic retries are stopped because its provider-specific idempotency/resume contract has not been verified.

Provider audio/cover assets are copied into the private bucket under deterministic order/version paths. Downloads allow only exact configured CDN hostnames, reject redirects/credentials/custom ports, have timeouts and streaming size limits, and preserve existing Supabase paths instead of persisting expiring signed URLs. Private bucket access is signed through the existing application. This does not remove copies held by the music provider.

Order confirmation and song-ready notifications use the existing Resend templates plus durable email identity, leases and receipt persistence. Sent records prevent replay beyond a provider's deduplication window. Ambiguous sends older than 23 hours or exhausted sends move to review; they are never blindly resent. The worker processes the outbox as well as generation. No messages were actually sent during this work.

## 7. Environment variables

| Variables | Production | Preview / Development |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://memoriestomelody.com` | Exact isolated HTTPS preview origin; localhost for local work |
| `STRIPE_SECRET_KEY` | Live server secret | Test server secret only; live keys rejected outside Vercel Production |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for production endpoint | Separate test destination / Stripe CLI secret |
| `STRIPE_PRICE_ID` | New active one-time USD 19.99 Price, tax behavior exclusive | Separate matching $19.99 test Price |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Not required by hosted Checkout | Not required; existing variable may remain unused |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Existing production project | Separate migrated test project; never production credentials |
| `STORAGE_BUCKET` | Existing private bucket (`melora-media`) | Separate test bucket/project |
| `ASSET_DOWNLOAD_HOSTS` | Exact approved provider CDN hosts; default `files.kunavo.com` | Test CDN allowlist; no wildcard or localhost/private-network destinations |
| `USE_MOCK_PROVIDERS` | `false` | `false` on Vercel Preview; local unit/demo work may use `true` |
| `LYRICS_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL` | Existing OpenAI-compatible settings | Separate test provider credentials/budget |
| `OPENAI_BASE_URL` | Only when existing provider requires an alternate endpoint | Isolated equivalent if used |
| `MUSIC_PROVIDER`, `MUSIC_PROVIDER_API_KEY`, optional `MUSIC_PROVIDER_URL` | Existing Kunavo settings; verify actual selected provider | Separate test provider credentials/budget |
| `COVER_PROVIDER` | Existing `music` or `builtin`; HTTP requires its URL/key | Test equivalent |
| `VIDEO_FEATURE_ENABLED` | `false` for this release | `false` |
| `RESEND_API_KEY`, `EMAIL_FROM` | Existing verified sending domain | Resend test setup and controlled inboxes |
| `JOB_WORKER_SECRET`, `CRON_SECRET`, `LISTEN_TOKEN_SECRET` | Distinct random values, at least 24 characters | Separate test values |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Existing distributed limits; fail closed on outage | Separate test Redis for deployed Preview |
| `MALWARE_SCAN_REQUIRED`, `MALWARE_SCANNER_URL`, optional `MALWARE_SCANNER_API_KEY` | Preserve enforced upload checks | Test equivalent |

No `DATABASE_URL` is added: the application already uses Supabase's API. No duplicate site-URL variable is added. `PAYMENT_TEST_DATABASE_URL` is only for isolated automated database tests, not app production. Existing marketing/SMS/analytics variables remain untouched. `.env.example` contains placeholders only.

## 8. Stripe Dashboard configuration still required

1. The new **$19.99 USD**, one-time, tax-exclusive Price is configured on the live **Personalized AI Song** product and in Production `STRIPE_PRICE_ID`. Keep the old $7.99 Price only for historical reference; the code intentionally fails on a mismatched amount or tax behavior.
2. Verify Tax registrations, product tax code and collection behavior in Stripe. Automatic-tax settings on a Payment Link do not configure independently created Sessions.
3. The production endpoint is active with all seven listed events and an API version compatible with stripe-node 22.4.0. Keep its signing secret only in Production and monitor delivery failures.
4. Confirm Dashboard branding: Memories to Melody; legal entity ZEVYNTA LABS LLC; statement descriptor MEMORIES TO MELODY; shortened descriptor MEMORIES. The app does not change account-level settings.
5. Reconcile pending legacy checkouts/static-link purchases. Retire the static Payment Link from all purchase entry points at cutover: it cannot associate the customer's private customization with an internal order. Do not merely change its success redirect and assume that enables fulfillment.
6. The separate sandbox product and $19.99 Price are created and configured in Preview. Store that destination's distinct signing secret in Preview, rotate its deployment-protection bypass, and inspect test event deliveries before using Preview for release certification.

## 9. Vercel and database deployment configuration

- Keep Node Route Handlers: webhook maxDuration 60 seconds, generation worker maxDuration 300 seconds. Confirm the plan/runtime supports these limits.
- Configure Production and Preview separately. Do not copy live Stripe or production database/provider/email credentials into Preview.
- Apply migrations to a test project first. Confirm private bucket policy, auth callbacks, email domain, and `NEXT_PUBLIC_APP_URL` match that deployment.
- Verify Supabase Vault `app_url` and `job_worker_secret` for the **same** environment. Verify migration 005's one-minute dispatcher actually invokes `/api/jobs/process` and receives 202. The daily Vercel cron is only a backup and is insufficient for prompt fulfillment.
- Keep webhook and worker routes outside browser-session refresh/IP middleware; they have their own signature/secret authorization.
- If Preview deployment protection applies, use an approved isolated test domain/access configuration that Stripe and the worker can reach. Do not disable protection globally to work around it.
- Run the existing production environment guard with real Production configuration. It now requires `STRIPE_PRICE_ID` and a live Production key; a publishable key is not required.
- Default local Turbopack build hit an OS port-binding restriction. `npm run build -- --webpack` passed; use `pnpm build --webpack` as the reviewed Vercel build override if needed. The default cloud Turbopack path is not validated by that result.
- Migration and new application rollout must be coordinated: old code does not satisfy the new paid-job guard. Pause purchase entry points during the migration/reconciliation window. Do not deploy the old worker against the new guards. Roll back application/migrations only with a reviewed payment reconciliation plan; never remove event receipts to "retry" purchases.

## 10. Validation performed

- ESLint and TypeScript: passed.
- Vitest: **79 tests passed across 16 files**, including payment, ownership, release-catalog, status endpoint, terminal-provider retry, support-retry limit and generation-payment coverage.
- Isolated PostgreSQL 16: migrations and lifecycle tests passed, including rejected-event rollback, price validation, order/payment/item persistence, outbox, immutable stories, role-update privileges, unpaid enqueue/claim rejection, prerequisite enforcement, retries, refunds and out-of-order events.
- Real parallel database connections: 12 checkout requests → 1 order; 12 payment events → 1 payment + 8 stage jobs + 1 confirmation; 12 job claims → 1 claim.
- `pnpm build --webpack`: passed locally. The deployed Vercel Production Turbopack build and TypeScript validation also passed.
- Browser: root success/cancel pages rendered; missing/unauthorized order showed verification-required messaging and no payment claim. The home page also rendered correctly after restarting the server against the final build; no browser errors were reported. These checks used local resources, not a live Checkout purchase.
- Automated tests made no live charges. A user-authorized existing live purchase was reconciled and fulfilled through a fresh Kunavo task; song-ready emails were sent once and the private audio was play-tested.

Run locally with `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build --webpack`. For database tests, create an empty isolated PostgreSQL database named `mtm_test_*` and run `PAYMENT_TEST_DATABASE_URL=<test connection> pnpm test:payments:db`. The script deliberately rejects other database names. CI now runs this database suite against an isolated PostgreSQL service.

## 11. Exact production validation checklist

Before deploy:

- [ ] Read-only inventory of applied Supabase migrations, private bucket, active scheduler, existing pending/paid orders and duplicate Stripe identifiers.
- [ ] Reconcile historical paid orders/old metadata and in-flight jobs. Do not backfill by trusting browser redirects or old order statuses.
- [ ] Configure isolated Preview database/auth/storage/Redis/email/providers and Stripe test credentials/Price/webhook.
- [ ] Run migrations 007–009 and all automated checks against test resources.
- [ ] Submit a complete test song form. Confirm one internal pending order and one item exist **before** Checkout.
- [ ] Confirm hosted Checkout uses the existing test Product/Price, collects name/email, and calculates tax correctly; metadata contains only order ID.
- [ ] Visit success URL before payment: no paid state, no job, no audio link.
- [ ] Cancel, return, and retry: same order; open Session reused; expired Session rotates only after server verification.
- [ ] Pay with a Stripe test card. Inspect verified event delivery and persisted Session, Intent, amount/currency/tax, payment state, unique event and stage records.
- [ ] Replay the same event and send another eligible event for the same payment concurrently. Confirm no extra stages, song versions, music submission or fulfillment email.
- [ ] Test delayed payment success/failure and payment-intent failure. A failed attempt must not overwrite a later successful payment.
- [ ] Interrupt a worker after provider submission; confirm restart polls the same saved Kunavo job ID. Test exhausted/ambiguous requests stop for support.
- [ ] Complete generation; verify audio was copied to the private bucket, playback uses signed access, and a fresh signed link works after expiry.
- [ ] Confirm exactly one order-confirmation and one owner song-ready email; separately test opted-in recipient delivery with controlled inboxes.
- [ ] Test refund and dispute before/during/after generation and replay older success events. Confirm no new generation begins after eligibility is revoked.
- [ ] Use another account/no cookie/wrong guest cookie against order, studio, upload, dashboard and status URLs. Confirm no story, email, token or audio access.
- [ ] Confirm one-minute worker dispatch, structured logs, failed/dead-letter alerts and outbox review monitoring.
- [ ] Configure actual Production variables, webhook, live Price and account branding; coordinate the migration/reconciliation/application cutover.

After the validated production deploy:

- [ ] Verify domain routing, health and unsigned webhook rejection.
- [ ] Verify Stripe can deliver to the actual production endpoint and the worker can reach the app.
- [ ] Perform one explicitly controlled live purchase only when authorized, with a defined test customer, budget, and refund decision. Never place a real charge in automated tests.
- [ ] Confirm one order/payment/music job, private audio storage, delivery receipts, and access denial from another session.
- [ ] Watch event failures, paid-but-stalled orders, job lease age, provider IDs, outbox review, and scheduler failures through the first release window.

## 12. Remaining risks / TODOs

Production is deployed and the recovered historical live order proves generation, private archival, playback, and delivery. It does not certify the new $19.99 Checkout webhook path because that purchase used the former $19.00 Checkout implementation and was reconciled manually after exact Stripe verification. Run one controlled sandbox purchase after the distinct Preview signing secret is configured, then monitor the first organic $19.99 live webhook closely.

External side effects cannot be made mathematically exactly-once solely with a database transaction. Saved provider IDs, stable keys, leases, and durable receipts prevent duplicate retries within documented provider guarantees; ambiguous operations outside those guarantees deliberately require reconciliation. Kunavo job retrieval is documented with approximately 30-day retention. Generic HTTP adapters require a verified provider-specific resume contract before automatic retries can be enabled.

The code expects a tax-exclusive $19.99 Price. Create and verify the replacement live Price before deployment. Premium/add-on/coupon mappings are intentionally not invented. Existing public/provider asset URLs are not retroactively privatized, and already submitted provider work cannot be cancelled by this integration. Existing staff/support workflows must handle those legacy cases.

Email recovery after the safe idempotency window, failed/ambiguous Checkout creation, exhausted generation, won disputes and partial refunds require an operator runbook and alerts. The historical order's durable confirmation outbox entry failed after the earlier confirmation email had already been delivered; it was not resent to avoid a duplicate. Signed URLs already issued remain usable until their expiry; payment refund does not recall downloaded audio.

Google Search Console reports the pricing page indexed. The submitted sitemap was last read successfully with 39 discovered pages; the property-wide Page indexing report is still processing. `robots.txt`, the canonical pricing URL, the public sitemap, and private-page `noindex` metadata were validated in Production. The pricing Product schema has one valid Product snippet plus a non-blocking Merchant listing enhancement warning; the page remains eligible for normal search results.

## Sources used to verify provider behavior

- [Stripe fulfillment](https://docs.stripe.com/checkout/fulfillment): payment eligibility, server verification and repeated delivery.
- [Stripe webhooks](https://docs.stripe.com/webhooks): raw body signatures and event retries.
- [Stripe Checkout Session API](https://docs.stripe.com/api/checkout/sessions/create) and [Stripe Tax](https://docs.stripe.com/tax/checkout).
- [Kunavo music API](https://kunavo.com/docs/music): asynchronous jobs, saved job polling, approximately 24-hour idempotency and result retention.
- [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys): 24-hour deduplication window.

## File inventory

The following inventory lists files created/modified by this change; no existing migrations were edited.

### Created

- `docs/PAYMENT_PRODUCTION_REVIEW.md`
- `scripts/test-payment-db.mjs`
- `src/app/api/orders/[orderId]/route.ts`
- `src/app/payment-cancelled/page.tsx`
- `src/app/payment-success/page.tsx`
- `src/components/studio/payment-status.tsx`
- `src/lib/email/outbox.ts`
- `src/lib/security/ownership.ts`
- `src/lib/storage/archive.ts`
- `src/lib/stripe/webhook.ts`
- `supabase/migrations/007_payment_integrity.sql`
- `supabase/migrations/008_delivery_outbox.sql`
- `supabase/migrations/009_payment_guardrails.sql`
- `supabase/migrations/010_v1_price_1999.sql`
- `supabase/migrations/011_single_audio_launch.sql`
- `tests/generation-payment.test.ts`
- `tests/order-status.test.ts`
- `tests/payment-lifecycle.test.ts`
- `tests/sql/bootstrap.sql`
- `tests/sql/concurrency-fixture.sql`
- `tests/sql/payment-lifecycle.sql`

### Modified

- `.env.example`
- `.github/workflows/ci.yml`
- `.gitignore`
- `package.json`
- `scripts/verify-production-env.mjs`
- `src/app/(dashboard)/dashboard/orders/[orderId]/page.tsx`
- `src/app/(dashboard)/dashboard/orders/[orderId]/revisions/page.tsx`
- `src/app/(studio)/studio/[projectId]/checkout/page.tsx`
- `src/app/(studio)/studio/[projectId]/success/page.tsx`
- `src/app/api/jobs/process/route.ts`
- `src/app/api/listen/[token]/status/route.ts`
- `src/app/api/stripe/mock-complete/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/uploads/route.ts`
- `src/app/listen/[token]/page.tsx`
- `src/components/player/listen-experience.tsx`
- `src/components/studio/checkout-form.tsx`
- `src/lib/actions/listen.ts`
- `src/lib/actions/orders.ts`
- `src/lib/actions/reviews.ts`
- `src/lib/actions/studio.ts`
- `src/lib/auth/session.ts`
- `src/lib/db/mappers.ts`
- `src/lib/db/mock-repository.ts`
- `src/lib/db/seed-data.ts`
- `src/lib/db/supabase-repository.ts`
- `src/lib/email/send.ts`
- `src/lib/env.ts`
- `src/lib/jobs/pipeline.ts`
- `src/lib/production-readiness.ts`
- `src/lib/providers/lyrics/openai.ts`
- `src/lib/providers/music/http.ts`
- `src/lib/providers/music/kunavo.ts`
- `src/lib/providers/types.ts`
- `src/lib/security/rate-limit.ts`
- `src/lib/stripe/client.ts`
- `src/lib/studio/load-project.ts`
- `src/lib/validation/studio.ts`
- `src/proxy.ts`
- `src/types/index.ts`
- `tests/production-readiness.test.ts`
