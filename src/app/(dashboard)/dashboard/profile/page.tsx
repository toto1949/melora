import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n";
import { DeleteAccountForm } from "@/components/dashboard/delete-account-form";
import { ProfileForm } from "@/components/dashboard/profile-form";

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
      <ProfileForm fullName={user.fullName} phone={user.phone} marketingOptIn={user.marketingOptIn} trainingOptIn={user.trainingOptIn} />

      <section className="surface-card space-y-3 p-5">
        <h2 className="font-display text-2xl">{copy.privacyTitle}</h2>
        <p className="text-sm text-muted">
          {copy.privacyBody}
        </p>
        <Link href="/api/account/export" className="btn-secondary inline-flex">
          {copy.export}
        </Link>
        <DeleteAccountForm prompt={copy.confirmDelete} label={copy.delete} pendingLabel={messages.common.saving} />
      </section>
    </div>
  );
}
