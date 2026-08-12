import { startStudioAction } from "@/lib/actions/studio";
import { OCCASIONS } from "@/lib/constants";

export const metadata = { title: "Create Your Song" };

export default async function StudioEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string; package?: string; inspiredBy?: string }>;
}) {
  const params = await searchParams;
  const occasion = OCCASIONS.find((o) => o.slug === params.occasion);
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-xl p-8 text-center">
        <p className="font-display text-4xl text-navy">Melora Studio</p>
        <p className="mt-3 prose-muted">
          {occasion
            ? `Let's create a ${occasion.name.toLowerCase()} song they'll never forget. We'll guide you step by step.`
            : "Create a personalized song in about five minutes. No account required to begin—we'll save your progress as you go."}
        </p>
        <form action={startStudioAction} className="mt-8">
          {params.occasion ? <input type="hidden" name="occasion" value={params.occasion} /> : null}
          {params.package ? <input type="hidden" name="package" value={params.package} /> : null}
          {params.inspiredBy ? <input type="hidden" name="inspiredBy" value={params.inspiredBy} /> : null}
          <button type="submit" className="btn-primary w-full">
            {occasion ? `Begin their ${occasion.name.toLowerCase()} song` : "Begin your song"}
          </button>
        </form>
      </div>
    </div>
  );
}
