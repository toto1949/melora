import Link from "next/link";
import { deleteAccountAction } from "@/lib/actions/account";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-navy">Profile</h1>
      <div className="surface-card space-y-2 p-5 text-sm">
        <p><span className="text-muted">Email:</span> {user.email}</p>
        <p><span className="text-muted">Name:</span> {user.fullName || "—"}</p>
        <p><span className="text-muted">Locale:</span> {user.locale}</p>
        <p><span className="text-muted">Currency:</span> {user.currency}</p>
        <p><span className="text-muted">Training opt-in:</span> {user.trainingOptIn ? "Yes" : "No (default)"}</p>
      </div>

      <section className="surface-card space-y-3 p-5">
        <h2 className="font-display text-2xl">Data & privacy</h2>
        <p className="text-sm text-muted">
          Export your account data or permanently delete your profile. Orders already placed may be retained for billing compliance.
        </p>
        <Link href="/api/account/export" className="btn-secondary inline-flex">
          Export my data (JSON)
        </Link>
        <form action={deleteAccountAction} className="space-y-3 border-t border-border pt-4">
          <p className="text-sm text-muted">Type DELETE to confirm account deletion.</p>
          <input
            name="confirm"
            placeholder="DELETE"
            className="w-full max-w-xs rounded-2xl border border-border px-4 py-3"
          />
          <button type="submit" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            Delete account
          </button>
        </form>
      </section>
    </div>
  );
}
