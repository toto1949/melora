"use client";

import type { MarketingGenerationResult } from "@/types/marketing";

export function VideoPreviewCard({ result }: { result: MarketingGenerationResult | null }) {
  return (
    <section className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Preview</p>
          <h2 className="mt-1 font-display text-3xl">Generated asset</h2>
        </div>
        {result?.status ? (
          <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold">
            {result.status}
          </span>
        ) : null}
      </div>

      {result?.mediaUrl ? (
        <div className="mt-5 space-y-4">
          <div className="mx-auto max-w-sm overflow-hidden rounded-3xl bg-black shadow-lg">
            <video key={result.mediaUrl} src={result.mediaUrl} controls playsInline className="aspect-[9/16] w-full object-cover" />
          </div>
          <div className="rounded-2xl border border-border bg-white p-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <span className="text-muted">Campaign</span>
                <p className="font-medium">{result.campaign || "—"}</p>
              </div>
              <div>
                <span className="text-muted">Angle</span>
                <p className="font-medium">{result.angle || "—"}</p>
              </div>
            </div>
            {result.hook ? (
              <div className="mt-3">
                <span className="text-muted">Hook</span>
                <p className="mt-1">{result.hook}</p>
              </div>
            ) : null}
            <a
              href={result.mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-semibold underline underline-offset-4"
            >
              Open original video
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid min-h-80 place-items-center rounded-3xl border border-dashed border-border bg-white/60 p-8 text-center">
          <div>
            <p className="font-display text-2xl">No video generated yet</p>
            <p className="mt-2 max-w-md text-sm text-muted">
              Create a campaign on the left. The Gemini result will appear here for review before any publishing occurs.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
