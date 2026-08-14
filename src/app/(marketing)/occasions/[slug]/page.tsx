import Link from "next/link";
import { notFound } from "next/navigation";
import { OCCASIONS } from "@/lib/constants";
import { listSamples } from "@/lib/db/repository";
import { AudioPlayer } from "@/components/player/audio-player";
import { getMessages } from "@/lib/i18n";

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const occasion = OCCASIONS.find((o) => o.slug === slug);
  if (!occasion) return {};
  return {
    title: `Personalized ${occasion.name} Songs`,
    description: `${occasion.description} Create a custom ${occasion.name.toLowerCase()} song from your memories with Memories to Melody.`,
    alternates: { canonical: `/occasions/${occasion.slug}` },
  };
}

export default async function OccasionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const occasion = OCCASIONS.find((o) => o.slug === slug);
  if (!occasion) notFound();
  const [samplesList, messages] = await Promise.all([listSamples(), getMessages()]);
  const samples = samplesList.filter((s) => s.occasion === slug);
  const copy = messages.occasions;
  const localized = copy.items[occasion.slug];

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">{copy.detailEyebrow}</p>
        <h1 className="mt-2 font-display text-4xl text-navy md:text-6xl">{localized.name}</h1>
        <p className="mt-4 max-w-2xl prose-muted text-lg">{localized.description}</p>
        <Link href={`/studio?occasion=${occasion.slug}`} className="btn-primary mt-8 inline-flex">
          {copy.createPrefix} {localized.name} {copy.createSuffix}
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
          <p className="mt-10 text-muted">{copy.emptyPrefix} {localized.name} {copy.emptySuffix}</p>
        )}
      </div>
    </section>
  );
}
