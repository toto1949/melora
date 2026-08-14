import Link from "next/link";
import { deleteAccountAction } from "@/lib/actions/account";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const messages = await getMessages();
  const copy = messages.dashboard.profile;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <div className="surface-card space-y-2 p-5 text-sm">
        <p><span className="text-muted">{copy.email}:</span> {user.email}</p>
        <p><span className="text-muted">{copy.name}:</span> {user.fullName || "—"}</p>
        <p><span className="text-muted">{copy.locale}:</span> {user.locale}</p>
        <p><span className="text-muted">{copy.currency}:</span> {user.currency}</p>
        <p><span className="text-muted">{copy.training}:</span> {user.trainingOptIn ? copy.yes : copy.noDefault}</p>
      </div>

      <section className="surface-card space-y-3 p-5">
        <h2 className="font-display text-2xl">{copy.privacyTitle}</h2>
        <p className="text-sm text-muted">
          {copy.privacyBody}
        </p>
        <Link href="/api/account/export" className="btn-secondary inline-flex">
          {copy.export}
        </Link>
        <form action={deleteAccountAction} className="space-y-3 border-t border-border pt-4">
          <p className="text-sm text-muted">{copy.confirmDelete}</p>
          <input
            name="confirm"
            placeholder="DELETE"
            className="w-full max-w-xs rounded-2xl border border-border px-4 py-3"
          />
          <SubmitButton label={copy.delete} pendingLabel={messages.common.saving} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" />
        </form>
      </section>
    </div>
  );
}
