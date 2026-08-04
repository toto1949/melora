import { getCurrentUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl text-navy">Profile</h1>
      <div className="surface-card space-y-2 p-5 text-sm">
        <p><span className="text-muted">Email:</span> {user.email}</p>
        <p><span className="text-muted">Name:</span> {user.fullName || "—"}</p>
        <p><span className="text-muted">Locale:</span> {user.locale}</p>
        <p><span className="text-muted">Currency:</span> {user.currency}</p>
        <p><span className="text-muted">Training opt-in:</span> {user.trainingOptIn ? "Yes" : "No (default)"}</p>
        <p className="pt-2 text-muted">Account deletion and data export are available via support in this demo build.</p>
      </div>
    </div>
  );
}
