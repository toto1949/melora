# Memories to Melody Marketing Control Center

The internal control center is available at:

```text
/admin/marketing
```

It is protected by the existing admin layout and staff-role checks.

## Required website environment variables

Add these server-only values to `.env.local` for local development or to the website deployment environment:

```text
MARKETING_N8N_BASE_URL=http://localhost:5678
MARKETING_REVIEW_TOKEN=<same value as MTM_REVIEW_TOKEN in n8n>
```

Never prefix the review token with `NEXT_PUBLIC_`.

When n8n is deployed publicly, replace the base URL with the HTTPS n8n origin, for example:

```text
MARKETING_N8N_BASE_URL=https://automation.example.com
```

## n8n workflows required

The control center expects these active production webhooks:

```text
POST /webhook/mtm-generate-video
POST /webhook/mtm-review-action
POST /webhook/mtm-publish-approved
```

Workflow 06 generates the media and returns `generationPayload` and `publishPayload`.
Workflow 07 validates the private review token and handles `approve`, `reject`, and `regenerate`.
Workflow 04 publishes approved content through Postiz.

## Browser workflow

1. Open `/admin/marketing` with a staff account.
2. Enter a campaign name, angle, hook, strict Gemini prompt, and platform-specific copy.
3. Select Instagram, Facebook, TikTok, or any subset.
4. Click **Generate video**.
5. Review the returned 9:16 video.
6. Choose:
   - **Approve & publish** — publishes only to the selected platforms.
   - **Regenerate** — reuses the generation payload and current strict prompt.
   - **Reject** — publishes nothing.

The browser never receives `MARKETING_REVIEW_TOKEN`; the Next.js review route adds it server-side.

## Production networking requirement

A deployed website cannot call `http://localhost:5678` on your Mac. For the live website control center to work, n8n must be reachable from the website server through a stable HTTPS URL.

Until n8n is hosted publicly, use the control center with the website running locally on the same machine as n8n.

## Campaign history

The initial control-center version stores the latest 30 admin-generated campaign records in browser local storage. This is intentionally lightweight and does not contain the private review token. A future database-backed history can replace it without changing the n8n contract.
