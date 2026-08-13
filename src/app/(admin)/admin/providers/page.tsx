import { getEnv, isMockMode } from "@/lib/env";
import { getProductionReadiness } from "@/lib/production-readiness";

export default async function AdminProvidersPage() {
  const env = getEnv();
  const mock = isMockMode();

  const providers = getProductionReadiness(env);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Providers</h1>
      <p className="text-muted">
        Integration status, read from the deployment environment.
        {mock ? " The app is currently running in mock mode." : ""}
      </p>
      <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="p-3">Service</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(({ name, detail, configured, required }) => (
              <tr key={name} className="border-b border-border/70">
                <td className="p-3 font-medium">{name}</td>
                <td className="p-3">{detail}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      configured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {configured ? "Configured" : required ? "Required" : "Disabled"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Keys are managed in Vercel project settings. This page never displays secret values.
      </p>
    </div>
  );
}
