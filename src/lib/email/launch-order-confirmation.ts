type TemplateData = Record<string, string | number | undefined | null>;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://memoriestomelody.com";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderLaunchOrderConfirmation(data: TemplateData) {
  const orderNumber = escapeHtml(data.orderNumber || "");
  const subjectOrder = String(data.orderNumber || "").replace(/[\r\n]+/g, " ");

  return {
    subject: `Payment confirmed — we're creating your song 🎵${subjectOrder ? ` · ${subjectOrder}` : ""}`,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Payment confirmed — your song is being created</title>
  </head>
  <body style="margin:0;padding:0;background:#F7F0E6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1A2740;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F7F0E6;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#FFFCFA;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(11,20,38,0.08);">
            <tr><td style="height:6px;background:#C9A96E;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr>
              <td style="padding:36px 40px;">
                <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;color:#0B1426;">Memories to Melody</p>
                <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.3;color:#0B1426;">Payment confirmed — your song is being created</h1>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">We received your story and payment successfully. Your personalized song is now being created in the style you selected.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:4px 0 22px;background:#F7F0E6;border-radius:16px;">
                  <tr><td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6B645A;">Order</td>
                        <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#0B1426;">${orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6B645A;">Status</td>
                        <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#0B1426;">Creating your song</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6B645A;">Typical wait</td>
                        <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#0B1426;">Usually a few minutes</td>
                      </tr>
                    </table>
                  </td></tr>
                </table>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Your listening page updates automatically as soon as the finished song is ready. We’ll also email you immediately with your private listening link.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 22px;">
                  <tr>
                    <td bgcolor="#C9A96E" style="border-radius:999px;">
                      <a href="${APP_URL}/dashboard/orders" target="_blank" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:#0B1426;text-decoration:none;">Watch my song progress</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#6B645A;">You don’t need to do anything else. We’ll take it from here.</p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-size:12px;color:#6B645A;">Questions? Reply to this email or contact hello@memoriestomelody.com.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
