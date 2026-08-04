import Link from "next/link";
import { notFound } from "next/navigation";
import { ListenExperience } from "@/components/player/listen-experience";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderByShareToken } from "@/lib/db/repository";
import { BRAND } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderByShareToken(token);
  return {
    title: order?.currentVersion?.title || "Private listening page",
    robots: { index: false, follow: false },
  };
}

export default async function ListenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderByShareToken(token);
  if (!order) notFound();
  if (order.privacyMode === "private") {
    const user = await getCurrentUser();
    if (!user || (order.userId && user.id !== order.userId && user.role === "customer")) {
      return (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="surface-card max-w-md p-8 text-center">
            <h1 className="font-display text-3xl">This song is private</h1>
            <p className="mt-3 text-muted">Sign in as the owner to listen.</p>
            <Link href="/auth/sign-in" className="btn-primary mt-6 inline-flex">
              Sign in
            </Link>
          </div>
        </div>
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
            Create a song
          </Link>
        </div>
      </header>
      <ListenExperience order={order} version={order.currentVersion || null} canManage={canManage} />
    </div>
  );
}
