import { BRAND } from "@/lib/constants";

type TemplateData = Record<string, string | number | undefined | null>;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://memoriestomelody.com";
const LOGO_URL = `${APP_URL}/apple-icon`;

const COLORS = {
  cream: "#F7F0E6",
  card: "#FFFCFA",
  navy: "#0B1426",
  ink: "#1A2740",
  muted: "#6B645A",
  gold: "#C9A96E",
  goldDark: "#B8955A",
  border: "#EDE4D6",
};

const FONT_BODY = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const FONT_DISPLAY = "Georgia,'Times New Roman',serif";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function paragraph(html: string) {
  return `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:15px;line-height:1.7;color:${COLORS.ink};">${html}</p>`;
}

function button(label: string, url: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 20px;">
    <tr>
      <td align="center" bgcolor="${COLORS.gold}" style="border-radius:999px;">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 32px;font-family:${FONT_BODY};font-size:15px;font-weight:700;color:${COLORS.navy};text-decoration:none;border-radius:999px;background:${COLORS.gold};">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function detailsBox(rows: Array<[label: string, value: string]>) {
  const body = rows
    .map(
      ([label, value]) => `<tr>
        <td style="padding:6px 0;font-family:${FONT_BODY};font-size:13px;color:${COLORS.muted};white-space:nowrap;padding-right:24px;">${label}</td>
        <td style="padding:6px 0;font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${COLORS.navy};" align="right">${value}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"
    style="margin:4px 0 20px;background:${COLORS.cream};border-radius:16px;">
    <tr><td style="padding:16px 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${body}</table>
    </td></tr>
  </table>`;
}

function formatDelivery(value: string | number | undefined | null) {
  if (!value) return "within 48 hours";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function shell(options: { title: string; preheader: string; body: string }) {
  const { title, preheader, body } = options;
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.cream};-webkit-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${COLORS.cream};">
      <tr>
        <td align="center" style="padding:40px 16px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;">

            <!-- Header -->
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-right:12px;">
                      <img src="${LOGO_URL}" width="40" height="40" alt="${BRAND.name}"
                           style="display:block;border-radius:12px;" />
                    </td>
                    <td style="font-family:${FONT_DISPLAY};font-size:22px;font-weight:700;letter-spacing:-0.01em;color:${COLORS.navy};">
                      ${BRAND.name}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td style="background:${COLORS.card};border-radius:24px;box-shadow:0 18px 50px rgba(11,20,38,0.08);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="height:6px;background:linear-gradient(90deg,${COLORS.gold},${COLORS.goldDark});border-radius:24px 24px 0 0;font-size:0;line-height:0;" bgcolor="${COLORS.gold}">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:36px 40px 8px;">
                      <h1 style="margin:0 0 18px;font-family:${FONT_DISPLAY};font-size:26px;line-height:1.3;font-weight:700;color:${COLORS.navy};">${title}</h1>
                      ${body}
                    </td>
                  </tr>

                  <!-- Signature -->
                  <tr>
                    <td style="padding:8px 40px 36px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid ${COLORS.border};">
                        <tr>
                          <td style="padding-top:24px;">
                            <table role="presentation" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding-right:14px;" valign="top">
                                  <img src="${LOGO_URL}" width="48" height="48" alt=""
                                       style="display:block;border-radius:14px;" />
                                </td>
                                <td valign="middle">
                                  <p style="margin:0;font-family:${FONT_DISPLAY};font-size:16px;font-style:italic;color:${COLORS.ink};">With care,</p>
                                  <p style="margin:2px 0 0;font-family:${FONT_DISPLAY};font-size:17px;font-weight:700;color:${COLORS.navy};">The ${BRAND.name} Team</p>
                                  <p style="margin:4px 0 0;font-family:${FONT_BODY};font-size:12px;color:${COLORS.muted};">${BRAND.tagline}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:28px 24px 8px;">
                <p style="margin:0 0 10px;font-family:${FONT_BODY};font-size:13px;">
                  <a href="${APP_URL}" style="color:${COLORS.goldDark};text-decoration:none;font-weight:600;">Website</a>
                  <span style="color:${COLORS.muted};">&nbsp;&middot;&nbsp;</span>
                  <a href="${APP_URL}/examples" style="color:${COLORS.goldDark};text-decoration:none;font-weight:600;">Listen to examples</a>
                  <span style="color:${COLORS.muted};">&nbsp;&middot;&nbsp;</span>
                  <a href="${APP_URL}/pricing" style="color:${COLORS.goldDark};text-decoration:none;font-weight:600;">Pricing</a>
                  <span style="color:${COLORS.muted};">&nbsp;&middot;&nbsp;</span>
                  <a href="mailto:${BRAND.supportEmail}" style="color:${COLORS.goldDark};text-decoration:none;font-weight:600;">Support</a>
                </p>
                <p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:12px;color:${COLORS.muted};">
                  Questions? Just reply to this email — a real person reads every message.
                </p>
                <p style="margin:0;font-family:${FONT_BODY};font-size:11px;color:${COLORS.muted};">
                  &copy; ${year} ${BRAND.name} &middot; <a href="${APP_URL}/legal/privacy" style="color:${COLORS.muted};">Privacy</a> &middot; <a href="${APP_URL}/legal/terms" style="color:${COLORS.muted};">Terms</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const link = (url: string, label: string) =>
  `<a href="${url}" style="color:${COLORS.goldDark};font-weight:600;">${label}</a>`;

export const emailTemplates = {
  welcome: (d: TemplateData) => ({
    subject: `Welcome to ${BRAND.name} 🎵`,
    html: shell({
      title: `Welcome${d.name ? `, ${d.name}` : ""} — let's make something unforgettable`,
      preheader: "Your account is ready. Turn a memory into a song they'll keep forever.",
      body:
        paragraph(
          `Your account is ready. ${BRAND.name} turns the stories you tell us — the inside jokes, the little moments, the big milestones — into a studio-quality song made just for someone you love.`,
        ) +
        paragraph(
          `Whenever a memory wants a melody, we're here. It takes about ten minutes to share your story, and your finished song arrives within 48 hours.`,
        ) +
        button("Start your song", `${APP_URL}/studio`) +
        paragraph(
          `Not sure yet? ${link(`${APP_URL}/examples`, "Listen to a few examples")} to hear what's possible.`,
        ),
    }),
  }),

  "email-verification": (d: TemplateData) => ({
    subject: `Verify your ${BRAND.name} email`,
    html: shell({
      title: "One quick step — verify your email",
      preheader: "Confirm your address to secure your account and your songs.",
      body:
        paragraph(
          `Please confirm this email address so your songs, downloads, and order history stay safely tied to your account.`,
        ) +
        button("Verify my email", String(d.verifyUrl ?? APP_URL)) +
        paragraph(
          `If you didn't create a ${BRAND.name} account, you can safely ignore this email.`,
        ),
    }),
  }),

  "order-confirmation": (d: TemplateData) => ({
    subject: `Your song is on its way — order ${d.orderNumber}`,
    html: shell({
      title: "Thank you! Your order is confirmed",
      preheader: `Order ${d.orderNumber} confirmed. Our songwriters are getting started.`,
      body:
        paragraph(
          `We've received your story and our songwriting begins now. Here's everything at a glance:`,
        ) +
        detailsBox([
          ["Order number", String(d.orderNumber ?? "")],
          ["Estimated delivery", formatDelivery(d.estimatedDelivery)],
        ]) +
        paragraph(
          `We'll email you the moment your song is ready. You can check progress anytime from your dashboard.`,
        ) +
        button("View my order", `${APP_URL}/dashboard/orders`) +
        paragraph(
          `While you wait: think about who you'll share it with first. That reaction is the best part.`,
        ),
    }),
  }),

  "payment-failed": (d: TemplateData) => ({
    subject: `Action needed — payment for order ${d.orderNumber}`,
    html: shell({
      title: "Your payment didn't go through",
      preheader: "No worries — your story is saved. Retry payment securely in one click.",
      body:
        paragraph(
          `We couldn't complete the payment for order <strong>${d.orderNumber}</strong>. This usually happens when a card is declined or the session timed out — it's easily fixed.`,
        ) +
        paragraph(`Your story and song details are saved, so you won't lose anything.`) +
        button("Retry payment securely", String(d.retryUrl ?? `${APP_URL}/studio`)) +
        paragraph(
          `If the problem continues, reply to this email and we'll sort it out together.`,
        ),
    }),
  }),

  "generation-started": (d: TemplateData) => ({
    subject: `Your song is being written 🎼`,
    html: shell({
      title: "The studio lights are on",
      preheader: "Lyrics are being written and your melody is taking shape.",
      body:
        paragraph(
          `Work on order <strong>${d.orderNumber}</strong> has begun. Right now your story is being shaped into lyrics, then arranged and produced in the style you chose.`,
        ) +
        paragraph(
          `You don't need to do anything — we'll email you the private listening link the moment it's ready.`,
        ),
    }),
  }),

  "song-ready": (d: TemplateData) => ({
    subject: `🎁 It's here — "${String(d.title ?? "Your personalized song").replace(/[\r\n]+/g, " ")}" is ready`,
    html: shell({
      title: `Your song is ready`,
      preheader: `"${escapeHtml(d.title)}" is waiting on your private listening page.`,
      body:
        paragraph(
          `The moment you've been waiting for: <em>“${escapeHtml(d.title)}”</em> is finished and waiting for you on your private listening page.`,
        ) +
        button("Listen to my song", String(d.listenUrl ?? `${APP_URL}/dashboard/orders`)) +
        paragraph(
          `From the listening page you can download the audio, share the private link, and add lyrics or a personal note. Only people with the link can hear it — you're in full control.`,
        ) +
        paragraph(
          `Something not quite right? Your order includes revision credits — request a change right from the page and we'll fine-tune it.`,
        ),
    }),
  }),

  "recipient-gift-ready": (d: TemplateData) => {
    const recipientName = escapeHtml(d.recipientName || "there");
    const fromName = escapeHtml(d.fromName || "Someone special");
    const title = escapeHtml(d.title || "A song made for you");
    const personalMessage = d.personalMessage
      ? paragraph(`<em>“${escapeHtml(d.personalMessage)}”</em>`)
      : "";
    return {
      subject: `${String(d.fromName || "Someone special").replace(/[\r\n]+/g, " ")} made you a song 🎁`,
      html: shell({
        title: `${recipientName}, a private gift is waiting for you`,
        preheader: `${fromName} turned your memories into a song called “${title}”.`,
        body:
          paragraph(
            `<strong>${fromName}</strong> created something deeply personal for you: an original song called <em>“${title}”</em>.`,
          ) +
          personalMessage +
          paragraph(
            `Open the private gift page when you're ready. The reveal, song, cover artwork, and lyrics are all waiting there.`,
          ) +
          button("Open my gift", String(d.listenUrl ?? APP_URL)) +
          paragraph(
            `This link was shared only for this gift. You can keep it and return to the song anytime.`,
          ),
      }),
    };
  },

  "video-ready": (d: TemplateData) => ({
    subject: `Your music video is ready 🎬`,
    html: shell({
      title: "Your photo music video is ready",
      preheader: "Your photos and your song, together at last.",
      body:
        paragraph(
          `The photo music video for order <strong>${d.orderNumber}</strong> is finished — your pictures set to your song, ready to share.`,
        ) +
        button("Watch it now", String(d.listenUrl ?? `${APP_URL}/dashboard/orders`)),
    }),
  }),

  "revision-received": (d: TemplateData) => ({
    subject: `Got it — we're on your revision`,
    html: shell({
      title: "Your revision request is in good hands",
      preheader: `We've received your notes for order ${d.orderNumber}.`,
      body:
        paragraph(
          `Thanks for the notes on order <strong>${d.orderNumber}</strong> — they're exactly what we need to get it right.`,
        ) +
        paragraph(
          `Our team is reviewing your request now. We'll email you as soon as the new version is ready to hear.`,
        ),
    }),
  }),

  "revision-completed": (d: TemplateData) => ({
    subject: `Your revised song is ready ✨`,
    html: shell({
      title: "Take two — your revision is ready",
      preheader: "A new version of your song is waiting for you.",
      body:
        paragraph(
          `We've made the changes you asked for, and the new version is ready on your listening page.`,
        ) +
        button("Hear the new version", String(d.listenUrl ?? `${APP_URL}/dashboard/orders`)) +
        paragraph(
          `Every previous version stays available too, so you can compare and pick your favorite.`,
        ),
    }),
  }),

  "refund-issued": (d: TemplateData) => ({
    subject: `Your refund is on its way`,
    html: shell({
      title: "Refund processed",
      preheader: `The refund for order ${d.orderNumber} has been issued.`,
      body:
        paragraph(
          `A refund for order <strong>${d.orderNumber}</strong> has been issued to your original payment method. Banks typically post it within 5–10 business days.`,
        ) +
        paragraph(
          `We're sorry this one didn't work out. If there's anything we could have done better, reply and tell us — we read every message. We'd love another chance to make something special for you.`,
        ),
    }),
  }),

  "password-reset": (d: TemplateData) => ({
    subject: `Reset your ${BRAND.name} password`,
    html: shell({
      title: "Reset your password",
      preheader: "Use the secure link below to choose a new password.",
      body:
        paragraph(`We received a request to reset the password for your account.`) +
        button("Choose a new password", String(d.resetUrl ?? `${APP_URL}/auth/reset-password`)) +
        paragraph(
          `If you didn't request this, you can safely ignore this email — your password won't change.`,
        ),
    }),
  }),
} as const;

export type EmailTemplate = keyof typeof emailTemplates;
