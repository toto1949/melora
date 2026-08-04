import { NextRequest, NextResponse } from "next/server";
import { completeMockPaymentAction } from "@/lib/actions/studio";
import { getOrder } from "@/lib/db/repository";
import { getEnv } from "@/lib/env";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }
  await completeMockPaymentAction(orderId);
  const order = await getOrder(orderId);
  const env = getEnv();
  const projectId = order?.projectId;
  return NextResponse.redirect(
    `${env.NEXT_PUBLIC_APP_URL}/studio/${projectId}/success?orderId=${orderId}`,
  );
}
