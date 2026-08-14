import { startStudioAction } from "@/lib/actions/studio";
import { OCCASIONS } from "@/lib/constants";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export const metadata = { title: "Create Your Song" };

export default async function StudioEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string; package?: string; inspiredBy?: string }>;
}) {
  const params = await searchParams;
  const occasion = OCCASIONS.find((o) => o.slug === params.occasion);
  const messages = await getMessages();
  const copy = messages.studio.entry;
  const occasionName = occasion ? messages.occasions.items[occasion.slug].name : null;
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-xl p-8 text-center">
        <p className="font-display text-4xl text-navy">{copy.title}</p>
        <p className="mt-3 prose-muted">
          {occasionName ? copy.occasionBody.replace("{occasion}", occasionName) : copy.body}
        </p>
        <form action={startStudioAction} className="mt-8">
          {params.occasion ? <input type="hidden" name="occasion" value={params.occasion} /> : null}
          {params.package ? <input type="hidden" name="package" value={params.package} /> : null}
          {params.inspiredBy ? <input type="hidden" name="inspiredBy" value={params.inspiredBy} /> : null}
          <SubmitButton
            label={occasionName ? copy.beginOccasion.replace("{occasion}", occasionName) : copy.begin}
            pendingLabel={messages.common.saving}
            className="btn-primary w-full"
          />
        </form>
      </div>
    </div>
  );
}
