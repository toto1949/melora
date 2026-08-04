import { SampleSongsSection } from "@/components/marketing/sections";
import { listSamples } from "@/lib/db/repository";

export const metadata = { title: "Examples" };

export default async function ExamplesPage() {
  const samples = await listSamples();
  return <SampleSongsSection samples={samples} />;
}
