import { hasSupabase } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/db/client";
import { retryDatabaseRead } from "@/lib/db/retry-read";
import { sendEmail } from "./send";
import type { EmailTemplate } from "./templates";
import { logEvent } from "@/lib/observability/logger";
export async function processEmailOutbox() {
  if (!hasSupabase()) return;
  const { data, error, status } = await retryDatabaseRead("list_email_outbox", () => getSupabaseAdmin().from("email_outbox").select("key,order_id,to_email,template,data")
    .in("status", ["pending", "failed", "sending"]).or(`leased_until.is.null,leased_until.lt.${new Date().toISOString()}`).order("created_at").limit(10));
  if (error) throw new Error(`Email outbox unavailable (HTTP ${status}, code ${error.code || "unknown"})`);
  for (const item of data ?? []) {
    try { await sendEmail({ to: item.to_email, orderId: item.order_id, template: item.template as EmailTemplate, data: item.data, idempotencyKey: item.key }); }
    catch { logEvent("warn", "email_delivery_pending", { deliveryId: item.key }); }
  }
}
