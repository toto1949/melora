import type { SiteSettings } from "@/types";

export function AudioLaunchTrustBar({ settings }: { settings: SiteSettings }) {
  const stats = [
    { value: "A few min", label: "Typical creation" },
    { value: `${settings.genresSupported || 16}+`, label: "Music genres" },
    { value: "4", label: "Languages sung" },
    { value: "100%", label: "Private by default" },
  ];

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:px-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-3xl text-navy md:text-4xl">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
