import Link from "next/link";
import { notFound } from "next/navigation";
import { OCCASIONS } from "@/lib/constants";
import { listSamples } from "@/lib/db/repository";
import { AudioPlayer } from "@/components/player/audio-player";

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const occasion = OCCASIONS.find((o) => o.slug === slug);
  if (!occasion) return {};
  return {
    title: `${occasion.name} songs`,
    description: occasion.description,
  };
}

export default async function OccasionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const occasion = OCCASIONS.find((o) => o.slug === slug);
  if (!occasion) notFound();
  const samples = (await listSamples()).filter((s) => s.occasion === slug);

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">Occasion</p>
        <h1 className="mt-2 font-display text-4xl text-navy md:text-6xl">{occasion.name}</h1>
        <p className="mt-4 max-w-2xl prose-muted text-lg">{occasion.description}</p>
        <Link href={`/studio?occasion=${occasion.slug}`} className="btn-primary mt-8 inline-flex">
          Create a {occasion.name} song
        </Link>
        {samples.length ? (
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {samples.map((sample) => (
              <AudioPlayer
                key={sample.id}
                id={`occasion-${sample.id}`}
                src={sample.audioUrl}
                title={sample.title}
                subtitle={`${sample.genre} · ${sample.mood}`}
                coverUrl={sample.coverUrl}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-muted">No demo samples for this occasion yet—your story will lead the song.</p>
        )}
      </div>
    </section>
  );
}
