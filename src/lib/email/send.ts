import { getEnv, isMockMode } from "@/lib/env";
import { emailTemplates, type EmailTemplate } from "./templates";

export async function sendEmail(input: {
  to: string;
  template: EmailTemplate;
  data?: Record<string, string | number | undefined | null>;
  idempotencyKey?: string;
}) {
  const rendered = emailTemplates[input.template](input.data || {});
  const env = getEnv();

  if (isMockMode() || !env.RESEND_API_KEY) {
    console.info("[email:mock]", {
      to: input.to,
      subject: rendered.subject,
      template: input.template,
    });
    return { id: `mock_${Date.now()}`, mocked: true };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);
  const payload = {
    from: env.EMAIL_FROM,
    to: input.to,
    subject: rendered.subject,
    html: rendered.html,
  };
  const result = input.idempotencyKey
    ? await resend.emails.send(payload, {
        headers: { "Idempotency-Key": input.idempotencyKey.slice(0, 256) },
      })
    : await resend.emails.send(payload);

  if (result.error) {
    throw new Error(`Email delivery failed: ${result.error.message}`);
  }

  return { id: result.data?.id, mocked: false };
}
