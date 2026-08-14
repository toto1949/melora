import Link from "next/link";
import { notFound } from "next/navigation";
import { GENRES } from "@/lib/constants";
import { listSamples } from "@/lib/db/repository";
import { AudioPlayer } from "@/components/player/audio-player";
import { getMessages } from "@/lib/i18n";

export function generateStaticParams() {
  return GENRES.filter((g) => g.slug !== "custom").map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) return {};
  return {
    title: `Personalized ${genre.name} Songs`,
    description: `Create a personalized ${genre.name} song from your memories — custom lyrics, studio-quality audio, and a private listening page.`,
    alternates: { canonical: `/genres/${genre.slug}` },
  };
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) notFound();
  const [allSamples, messages] = await Promise.all([listSamples(), getMessages()]);
  const samples = allSamples.filter((s) => s.genre === slug);
  const genreName = messages.catalog.genres[genre.slug];
  const copy = messages.genrePage;

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-4xl text-navy md:text-6xl">{copy.title.replace("{genre}", genreName)}</h1>
        <p className="mt-4 max-w-2xl prose-muted">
          {copy.body.replace("{genre}", genreName)}
        </p>
        <Link href={`/studio?genre=${genre.slug}`} className="btn-primary mt-8 inline-flex">
          {copy.create.replace("{genre}", genreName)}
        </Link>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {samples.map((sample) => (
            <AudioPlayer
              key={sample.id}
              id={`genre-${sample.id}`}
              src={sample.audioUrl}
              title={sample.title}
              subtitle={sample.mood}
              coverUrl={sample.coverUrl}
            />
          ))}
        </div>
        {samples.length === 0 ? <p className="mt-8 text-muted">{copy.empty.replace("{genre}", genreName)}</p> : null}
      </div>
    </section>
  );
}
