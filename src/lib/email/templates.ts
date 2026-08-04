import { BRAND } from "@/lib/constants";

type TemplateData = Record<string, string | number | undefined | null>;

const shell = (title: string, body: string) => `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F7F0E6;font-family:Georgia,serif;color:#0B1426;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F7F0E6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:560px;background:#FFFCFA;border-radius:24px;padding:32px;box-shadow:0 18px 50px rgba(11,20,38,0.08);">
            <tr><td style="font-size:28px;font-weight:700;letter-spacing:-0.02em;">${BRAND.name}</td></tr>
            <tr><td style="padding-top:20px;font-size:22px;font-weight:600;">${title}</td></tr>
            <tr><td style="padding-top:16px;font-size:16px;line-height:1.6;color:#1A2740;">${body}</td></tr>
            <tr><td style="padding-top:28px;font-size:13px;color:#6B645A;">With care,<br/>The ${BRAND.name} team</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const emailTemplates = {
  welcome: (d: TemplateData) => ({
    subject: `Welcome to ${BRAND.name}`,
    html: shell(
      "Welcome",
      `Hi ${d.name || "there"}, your account is ready. Whenever a memory wants a melody, we'll be here.`,
    ),
  }),
  "email-verification": (d: TemplateData) => ({
    subject: `Verify your ${BRAND.name} email`,
    html: shell(
      "Verify your email",
      `Confirm your address to secure your songs. <a href="${d.verifyUrl}" style="color:#C9A96E;">Verify email</a>`,
    ),
  }),
  "order-confirmation": (d: TemplateData) => ({
    subject: `Order confirmed — ${d.orderNumber}`,
    html: shell(
      "We received your order",
      `Order <strong>${d.orderNumber}</strong> is confirmed. Estimated delivery: ${d.estimatedDelivery}. We'll email you when the song is ready.`,
    ),
  }),
  "payment-failed": (d: TemplateData) => ({
    subject: `Payment failed for ${d.orderNumber}`,
    html: shell(
      "Payment needs attention",
      `We couldn't complete payment for order ${d.orderNumber}. <a href="${d.retryUrl}" style="color:#C9A96E;">Try again securely</a>.`,
    ),
  }),
  "generation-started": (d: TemplateData) => ({
    subject: `We're creating your song`,
    html: shell(
      "Creation has begun",
      `Our creative pipeline is writing and arranging order ${d.orderNumber}. You'll hear from us soon.`,
    ),
  }),
  "song-ready": (d: TemplateData) => ({
    subject: `Your song is ready — ${d.title}`,
    html: shell(
      "Your song is ready",
      `<em>${d.title}</em> is waiting. <a href="${d.listenUrl}" style="color:#C9A96E;">Open the private listening page</a>.`,
    ),
  }),
  "video-ready": (d: TemplateData) => ({
    subject: `Your music video is ready`,
    html: shell(
      "Video ready",
      `Your photo music video for order ${d.orderNumber} is ready. <a href="${d.listenUrl}" style="color:#C9A96E;">Watch it now</a>.`,
    ),
  }),
  "revision-received": (d: TemplateData) => ({
    subject: `Revision received`,
    html: shell(
      "We received your revision request",
      `Thanks — we're reviewing your notes for order ${d.orderNumber}.`,
    ),
  }),
  "revision-completed": (d: TemplateData) => ({
    subject: `Revision complete`,
    html: shell(
      "Your revision is ready",
      `A new version is available. <a href="${d.listenUrl}" style="color:#C9A96E;">Listen now</a>.`,
    ),
  }),
  "refund-issued": (d: TemplateData) => ({
    subject: `Refund issued`,
    html: shell(
      "Refund processed",
      `A refund for order ${d.orderNumber} has been issued. Allow a few business days for it to appear.`,
    ),
  }),
  "password-reset": (d: TemplateData) => ({
    subject: `Reset your ${BRAND.name} password`,
    html: shell(
      "Password reset",
      `Reset your password using this secure link: <a href="${d.resetUrl}" style="color:#C9A96E;">Reset password</a>.`,
    ),
  }),
} as const;

export type EmailTemplate = keyof typeof emailTemplates;
