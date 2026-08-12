import Link from "next/link";
import { notFound } from "next/navigation";
import { GENRES } from "@/lib/constants";
import { listSamples } from "@/lib/db/repository";
import { AudioPlayer } from "@/components/player/audio-player";

export function generateStaticParams() {
  return GENRES.filter((g) => g.slug !== "custom").map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) return {};
  return {
    title: `${genre.name} personalized songs`,
    description: `Create a personalized ${genre.name} song with Memories to Melody.`,
  };
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = GENRES.find((g) => g.slug === slug);
  if (!genre) notFound();
  const samples = (await listSamples()).filter((s) => s.genre === slug);

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-4xl text-navy md:text-6xl">{genre.name} songs</h1>
        <p className="mt-4 max-w-2xl prose-muted">
          Shape a personalized {genre.name.toLowerCase()} song around names, memories, and the feeling you want to leave behind.
        </p>
        <Link href={`/studio?genre=${genre.slug}`} className="btn-primary mt-8 inline-flex">
          Create in {genre.name}
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
      </div>
    </section>
  );
}
