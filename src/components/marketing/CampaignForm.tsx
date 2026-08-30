"use client";

import type {
  MarketingGenerationRequest,
  MarketingPlatform,
  MarketingVideoDuration,
} from "@/types/marketing";

const platformOptions: { value: MarketingPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
];

const durationOptions: { value: MarketingVideoDuration; label: string; detail: string }[] = [
  { value: 10, label: "10s", detail: "Fast performance ad" },
  { value: 20, label: "20s", detail: "Short emotional story" },
  { value: 30, label: "30s", detail: "Full storyline" },
  { value: 40, label: "40s", detail: "Extended short film" },
];

const angleOptions = [
  "anniversary gift",
  "birthday surprise",
  "song for mom",
  "song for dad",
  "wedding gift",
  "long-distance relationship",
  "just because gift",
  "memorial tribute",
];

export function CampaignForm({
  value,
  onChange,
  onSubmit,
  loading,
}: {
  value: MarketingGenerationRequest;
  onChange: (next: MarketingGenerationRequest) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const field = "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-navy/40 focus:ring-2 focus:ring-navy/10";

  function patch(patchValue: Partial<MarketingGenerationRequest>) {
    onChange({ ...value, ...patchValue });
  }

  function togglePlatform(platform: MarketingPlatform) {
    const selected = value.platforms.includes(platform);
    const platforms = selected
      ? value.platforms.filter((item) => item !== platform)
      : [...value.platforms, platform];
    patch({ platforms });
  }

  return (
    <form
      className="surface-card space-y-5 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Creative brief</p>
        <h2 className="mt-1 font-display text-3xl">Generate campaign video</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium">
          Campaign name
          <input
            className={field}
            value={value.campaign}
            onChange={(event) => patch({ campaign: event.target.value })}
            placeholder="anniversary-wife-premium-01"
          />
        </label>

        <label className="space-y-1.5 text-sm font-medium">
          Occasion / angle
          <select className={field} value={value.angle} onChange={(event) => patch({ angle: event.target.value })}>
            {angleOptions.map((angle) => (
              <option key={angle} value={angle}>
                {angle}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Storyline duration</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {durationOptions.map((option) => {
            const checked = value.durationSeconds === option.value;
            return (
              <label
                key={option.value}
                className={`cursor-pointer rounded-2xl border p-3 transition ${
                  checked ? "border-navy bg-navy text-cream" : "border-border bg-white text-navy"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name="durationSeconds"
                  checked={checked}
                  onChange={() => patch({ durationSeconds: option.value })}
                />
                <span className="block text-base font-semibold">{option.label}</span>
                <span className={`mt-1 block text-xs ${checked ? "text-cream/70" : "text-muted"}`}>{option.detail}</span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">
          20–40 second videos are generated as one continuous Gemini story using 10-second continuation turns with character and style continuity locked between segments.
        </p>
      </fieldset>

      <label className="block space-y-1.5 text-sm font-medium">
        Hook
        <textarea
          className={`${field} min-h-20 resize-y`}
          value={value.hook}
          onChange={(event) => patch({ hook: event.target.value })}
          placeholder="I had no idea what to get my wife for our anniversary..."
        />
      </label>

      <label className="block space-y-1.5 text-sm font-medium">
        Strict Gemini storyline prompt
        <textarea
          className={`${field} min-h-56 resize-y font-mono text-xs leading-5`}
          value={value.strictVideoPrompt}
          onChange={(event) => patch({ strictVideoPrompt: event.target.value })}
          placeholder="Describe the full storyline from opening hook through memories, transformation, emotional payoff, and brand ending."
        />
        <span className="block text-xs font-normal text-muted">
          Describe the complete story. For 20–40 seconds, the workflow automatically splits this into coherent continuation turns while preserving the same characters, visual language, and music motif.
        </span>
      </label>

      <div className="grid gap-4 xl:grid-cols-3">
        <label className="space-y-1.5 text-sm font-medium">
          Instagram caption
          <textarea
            className={`${field} min-h-28 resize-y`}
            value={value.instagramCaption}
            onChange={(event) => patch({ instagramCaption: event.target.value })}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Facebook post
          <textarea
            className={`${field} min-h-28 resize-y`}
            value={value.facebookPost}
            onChange={(event) => patch({ facebookPost: event.target.value })}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          TikTok caption
          <textarea
            className={`${field} min-h-28 resize-y`}
            value={value.tiktokCaption}
            onChange={(event) => patch({ tiktokCaption: event.target.value })}
          />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Publish destinations after approval</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {platformOptions.map((platform) => {
            const checked = value.platforms.includes(platform.value);
            return (
              <label
                key={platform.value}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${
                  checked ? "border-navy bg-navy text-cream" : "border-border bg-white text-navy"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => togglePlatform(platform.value)}
                />
                {platform.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading || !value.strictVideoPrompt.trim() || value.platforms.length === 0}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? `Generating ${value.durationSeconds}s storyline…` : `Generate ${value.durationSeconds}s storyline`}
      </button>
    </form>
  );
}
