import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Check, ArrowLeft } from "lucide-react";
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
    <main className="atmosphere grain flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-7 font-display text-xl text-navy">{BRAND.name}</Link>
      <div className="surface-card w-full max-w-xl p-6 text-center sm:p-9">
        <h1 className="font-display text-3xl text-navy sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 prose-muted">
          {occasionName ? copy.occasionBody.replace("{occasion}", occasionName) : copy.body}
        </p>
        <ol className="mt-6 grid gap-3 text-start text-sm text-navy">{messages.v1.steps.map((step, index) => <li key={step} className="flex items-center gap-3"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-cream-deep text-xs font-semibold">{index+1}</span>{step}</li>)}</ol>
        <p className="mt-6 border-t border-border pt-5 text-sm font-semibold text-navy">{messages.v1.entryPrice}</p>
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
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted"><Check className="h-3 w-3 shrink-0" aria-hidden="true" />{messages.v1.saveNote}</p>
        <p className="mt-4 text-xs leading-relaxed text-muted">{messages.v1.privacyNote}</p>
      </div>
      <Link href="/" className="mt-6 inline-flex items-center gap-2 p-2 text-sm text-muted"><ArrowLeft aria-hidden="true" className="directional-icon h-4 w-4" />{messages.v1.backHome}</Link>
    </main>
  );
}
