import { listSamples } from "@/lib/db/repository";

export default async function AdminSamplesPage() {
  const samples = await listSamples();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Sample songs</h1>
      <p className="text-muted">
        {samples.length} published sample{samples.length === 1 ? "" : "s"} shown on the examples page.
      </p>
      <div className="space-y-3">
        {samples.map((sample) => (
          <div key={sample.id} className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{sample.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {sample.occasion} · {sample.genre} · {sample.mood} · {sample.vocalType} vocals ·{" "}
                  {sample.language} · {Math.floor(sample.durationSeconds / 60)}:
                  {String(sample.durationSeconds % 60).padStart(2, "0")}
                </p>
                <p className="mt-2 max-w-2xl text-sm italic text-muted">“{sample.lyricsPreview}”</p>
              </div>
              <audio controls preload="none" src={sample.audioUrl} className="h-10 w-64 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
