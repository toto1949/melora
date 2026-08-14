import Link from "next/link";
import { notFound } from "next/navigation";
import { ListenExperience } from "@/components/player/listen-experience";
import { ListenPasswordGate } from "@/components/player/listen-password-gate";
import { getCurrentUser } from "@/lib/auth/session";
import { isListenUnlocked } from "@/lib/actions/listen";
import { getOrderByShareToken } from "@/lib/db/repository";
import { BRAND } from "@/lib/constants";
import { getEnv } from "@/lib/env";
import { getMessages } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderByShareToken(token);
  return {
    title: order?.currentVersion?.title || "Private listening page",
    robots: { index: false, follow: false },
  };
}

export default async function ListenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const [order, messages] = await Promise.all([getOrderByShareToken(token), getMessages()]);
  if (!order) notFound();
  const copy = messages.listen;

  if (order.privacyMode === "private") {
    const user = await getCurrentUser();
    if (!user || (order.userId && user.id !== order.userId && user.role === "customer")) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="surface-card max-w-md p-8 text-center">
            <h1 className="font-display text-3xl">{copy.privateTitle}</h1>
            <p className="mt-3 text-muted">{copy.privateBody}</p>
            <Link href="/auth/sign-in" className="btn-primary mt-6 inline-flex">
              {copy.signIn}
            </Link>
          </div>
        </div>
      );
    }
  }

  if (order.privacyMode === "password") {
    const unlocked = await isListenUnlocked(order.id);
    if (!unlocked) {
      return (
        <ListenPasswordGate
          shareToken={token}
          error={query.error === "invalid_password" ? copy.invalidPassword : null}
          labels={{
            title: copy.passwordTitle,
            body: copy.passwordBody,
            placeholder: copy.passwordPlaceholder,
            unlock: copy.unlock,
          }}
        />
      );
    }
  }

  const user = await getCurrentUser();
  const canManage = !!user && (user.id === order.userId || user.role !== "customer");

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-surface/80 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="font-display text-xl text-navy">
            {BRAND.name}
          </Link>
          <Link href="/studio" className="btn-secondary !py-2 text-sm">
            {copy.headerCreate}
          </Link>
        </div>
      </header>
      <ListenExperience
        order={order}
        version={order.currentVersion || null}
        canManage={canManage}
        videoEnabled={getEnv().VIDEO_FEATURE_ENABLED}
      />
    </div>
  );
}
