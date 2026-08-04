import { getEnv, isMockMode } from "@/lib/env";
import { emailTemplates, type EmailTemplate } from "./templates";

export async function sendEmail(input: {
  to: string;
  template: EmailTemplate;
  data?: Record<string, string | number | undefined | null>;
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
  const result = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: rendered.subject,
    html: rendered.html,
  });

  return { id: result.data?.id, mocked: false };
}
