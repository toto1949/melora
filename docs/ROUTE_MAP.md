# Route Map

## Marketing `(marketing)`

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/examples` | Sample songs gallery |
| `/how-it-works` | Expanded process |
| `/occasions` | Occasion index |
| `/occasions/[slug]` | SEO occasion landing |
| `/genres/[slug]` | SEO genre landing |
| `/reviews` | Testimonials |
| `/pricing` | Packages + credits |
| `/faq` | FAQ |
| `/track-order` | Guest order lookup |
| `/legal/privacy` | Privacy policy |
| `/legal/terms` | Terms of service |
| `/legal/refunds` | Refund policy |

## Auth

| Route | Purpose |
|-------|---------|
| `/auth/sign-in` | Email/password, magic link, OAuth |
| `/auth/sign-up` | Registration |
| `/auth/callback` | OAuth / magic-link callback |
| `/auth/reset-password` | Password reset |
| `/auth/verify` | Email verification |

## Studio `(studio)`

| Route | Purpose |
|-------|---------|
| `/studio` | Redirect to step 1 / resume |
| `/studio/[projectId]/occasion` | Step 1 |
| `/studio/[projectId]/recipient` | Step 2 |
| `/studio/[projectId]/story` | Step 3 |
| `/studio/[projectId]/style` | Step 4 |
| `/studio/[projectId]/lyrics` | Step 5 |
| `/studio/[projectId]/media` | Step 6 |
| `/studio/[projectId]/review` | Step 7 |
| `/studio/[projectId]/checkout` | Step 8 |
| `/studio/[projectId]/success` | Post-checkout |

## Customer `(dashboard)`

| Route | Purpose |
|-------|---------|
| `/dashboard` | Overview |
| `/dashboard/songs` | My songs |
| `/dashboard/orders` | Active orders |
| `/dashboard/drafts` | Draft projects |
| `/dashboard/favorites` | Favorites |
| `/dashboard/billing` | Billing |
| `/dashboard/profile` | Profile |
| `/dashboard/notifications` | Notifications |
| `/dashboard/support` | Support tickets |
| `/dashboard/orders/[orderId]` | Order detail |
| `/dashboard/orders/[orderId]/revisions` | Revisions |

## Listening

| Route | Purpose |
|-------|---------|
| `/listen/[token]` | Private / shareable song page |

## Admin `(admin)`

| Route | Purpose |
|-------|---------|
| `/admin` | Ops overview |
| `/admin/orders` | Order search |
| `/admin/jobs` | Generation jobs |
| `/admin/revisions` | Revision queue |
| `/admin/support` | Support queue |
| `/admin/packages` | Packages & pricing |
| `/admin/coupons` | Coupons |
| `/admin/samples` | Sample songs |
| `/admin/reviews` | Reviews CMS |
| `/admin/content` | FAQ / landing / settings |
| `/admin/providers` | Provider config |
| `/admin/analytics` | Funnel & geo |
| `/admin/audit` | Audit logs |
| `/admin/users` | Account management |

## API

| Route | Purpose |
|-------|---------|
| `POST /api/stripe/webhook` | Stripe events |
| `POST /api/jobs/process` | Job worker tick |
| `GET /api/jobs/[id]` | Job status |
| `POST /api/uploads` | Signed upload |
| `GET /api/health` | Health check |
