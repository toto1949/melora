import { getEnv, isMockMode } from "@/lib/env";

export default async function AdminProvidersPage() {
  const env = getEnv();
  const mock = isMockMode();

  const providers: Array<[name: string, value: string, configured: boolean]> = [
    ["Database", env.NEXT_PUBLIC_SUPABASE_URL ? "Supabase" : "Local mock store", Boolean(env.SUPABASE_SERVICE_ROLE_KEY)],
    [
      "Payments",
      env.STRIPE_SECRET_KEY
        ? env.STRIPE_SECRET_KEY.startsWith("sk_live")
          ? "Stripe (live mode)"
          : "Stripe (test mode)"
        : "Not configured",
      Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
    ],
    ["Email", env.RESEND_API_KEY ? `Resend — ${env.EMAIL_FROM}` : "Not configured", Boolean(env.RESEND_API_KEY)],
    ["Lyrics", env.LYRICS_PROVIDER === "mock" ? "Mock" : `${env.LYRICS_PROVIDER} (${env.OPENAI_MODEL})`, Boolean(env.OPENAI_API_KEY) || env.LYRICS_PROVIDER === "mock"],
    ["Music", env.MUSIC_PROVIDER === "mock" ? "Mock" : env.MUSIC_PROVIDER, Boolean(env.MUSIC_PROVIDER_API_KEY) || env.MUSIC_PROVIDER === "mock"],
    ["Video", env.VIDEO_PROVIDER === "mock" ? "Mock" : env.VIDEO_PROVIDER, Boolean(env.VIDEO_PROVIDER_API_KEY) || env.VIDEO_PROVIDER === "mock"],
    ["Rate limiting", env.UPSTASH_REDIS_REST_URL ? "Upstash Redis" : "In-memory (per instance)", true],
    ["SMS", env.TWILIO_ACCOUNT_SID ? "Twilio" : "Not configured", Boolean(env.TWILIO_ACCOUNT_SID)],
  ];

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
            {providers.map(([name, value, configured]) => (
              <tr key={name} className="border-b border-border/70">
                <td className="p-3 font-medium">{name}</td>
                <td className="p-3">{value}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      configured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {configured ? "Configured" : "Missing keys"}
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
