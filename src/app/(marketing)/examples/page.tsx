import { SampleSongsSection } from "@/components/marketing/sections";
import { listSamples } from "@/lib/db/repository";

export const metadata = {
  title: "Song Examples",
  description:
    "Listen to real personalized songs created from customer stories — browse by occasion, genre, mood, and vocal style before creating your own.",
  alternates: { canonical: "/examples" },
};

export default async function ExamplesPage() {
  const samples = await listSamples();
  return <SampleSongsSection samples={samples} />;
}
