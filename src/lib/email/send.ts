import { getSupabaseAdmin } from "@/lib/db/client";
import { getEnv, hasSupabase, isMockMode } from "@/lib/env";
import { emailTemplates, type EmailTemplate } from "./templates";

export async function sendEmail(input: {
  to: string;
  orderId?: string;
  template: EmailTemplate;
  data?: Record<string, string | number | undefined | null>;
  idempotencyKey?: string;
}) {
  const rendered = emailTemplates[input.template](input.data || {});
  const env = getEnv();

  if (isMockMode() && process.env.NODE_ENV !== "production") {
    console.info("[email:mock]", {
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
  if (!env.RESEND_API_KEY) throw new Error("Email is not configured");
  let durablePayload = payload;
  const sb = hasSupabase() && input.idempotencyKey ? getSupabaseAdmin() : null;
  if (sb) {
    const { error: insertError } = await sb.from("email_outbox").upsert({
      key: input.idempotencyKey, order_id: input.orderId ?? null, to_email: input.to, template: input.template, data: input.data ?? {},
    }, { onConflict: "key", ignoreDuplicates: true });
    if (insertError) throw new Error("Email enqueue failed");
    const { data: claimed, error } = await sb.rpc("claim_email", { p_key: input.idempotencyKey, p_payload: payload });
    if (error) throw new Error("Email claim failed");
    if (!claimed) {
      const { data } = await sb.from("email_outbox").select("status,provider_id").eq("key", input.idempotencyKey!).single();
      if (data?.status === "sent") return { id: data.provider_id, mocked: false };
      throw new Error("Email pending or requires delivery reconciliation");
    }
    durablePayload = claimed.payload;
  }
  try {
    const result = await resend.emails.send(durablePayload, input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined);
    if (result.error || !result.data?.id) throw new Error("Email provider rejected delivery");
    if (sb) {
      const { error } = await sb.from("email_outbox").update({ status: "sent", provider_id: result.data.id, leased_until: null }).eq("key", input.idempotencyKey!);
      if (error) throw new Error("Email receipt persistence failed");
    }
    return { id: result.data.id, mocked: false };
  } catch {
    if (sb) await sb.from("email_outbox").update({ status: "failed" }).eq("key", input.idempotencyKey!);
    throw new Error("Email delivery pending retry");
  }

}
