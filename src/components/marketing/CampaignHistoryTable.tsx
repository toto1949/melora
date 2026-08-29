"use client";

import type { MarketingHistoryItem } from "@/types/marketing";

export function CampaignHistoryTable({ items }: { items: MarketingHistoryItem[] }) {
  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-border p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Local admin history</p>
        <h2 className="mt-1 font-display text-3xl">Recent campaigns</h2>
      </div>

      {items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/70 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Angle</th>
                <th className="px-5 py-3">Platforms</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Video</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border/70">
                  <td className="px-5 py-4 font-medium">{item.campaign}</td>
                  <td className="px-5 py-4 text-muted">{item.angle}</td>
                  <td className="px-5 py-4">{item.platforms.join(", ")}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    {item.mediaUrl ? (
                      <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-5 text-sm text-muted">No campaign has been generated from this browser yet.</p>
      )}
    </section>
  );
}
