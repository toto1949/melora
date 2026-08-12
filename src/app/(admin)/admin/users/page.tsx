import { listAllProfiles } from "@/lib/db/repository";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const profiles = await listAllProfiles();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Users</h1>
      <p className="text-muted">{profiles.length} registered account{profiles.length === 1 ? "" : "s"}.</p>
      <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Locale</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b border-border/70">
                <td className="p-3">{profile.email}</td>
                <td className="p-3">{profile.fullName ?? "—"}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      profile.role === "customer" ? "bg-navy/5" : "bg-gold/20 font-medium"
                    }`}
                  >
                    {profile.role}
                  </span>
                </td>
                <td className="p-3">{profile.locale}</td>
                <td className="p-3">{formatDate(profile.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
