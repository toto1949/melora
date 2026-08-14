import Link from "next/link";
import { getMessages } from "@/lib/i18n";

export default async function NotFound() {
  const copy = (await getMessages()).common;
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="surface-card max-w-lg p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">404</p>
        <h1 className="mt-2 font-display text-4xl text-navy">{copy.notFoundTitle}</h1>
        <p className="mt-3 prose-muted">{copy.notFoundBody}</p>
        <Link href="/" className="btn-primary mt-7">{copy.home}</Link>
      </div>
    </div>
  );
}
