import { getCurrentUser } from "@/lib/auth/session";
import { isListenUnlocked } from "@/lib/actions/listen";
import { getOrderByShareToken } from "@/lib/db/repository";
import { normalizeLyrics } from "@/lib/lyrics";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const order = await getOrderByShareToken(token);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  if (order.privacyMode === "private") {
    const user = await getCurrentUser();
    if (!user || (order.userId && user.id !== order.userId && user.role === "customer")) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (order.privacyMode === "password" && !(await isListenUnlocked(order.id))) {
    return Response.json({ error: "Locked" }, { status: 401 });
  }

  const version = order.currentVersion
    ? {
        ...order.currentVersion,
        lyrics: normalizeLyrics(order.currentVersion.lyrics),
      }
    : null;

  return Response.json(
    {
      status: order.status,
      progress: Math.min(100, Math.max(0, order.progress ?? 0)),
      estimatedDeliveryAt: order.estimatedDeliveryAt,
      updatedAt: order.updatedAt,
      version,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
