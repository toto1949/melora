import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { saveRecipientAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import Link from "next/link";

export default async function RecipientStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const project = await loadStudioProject(projectId);
  const r = project.recipient;
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <StudioShell projectId={projectId} currentStep={2}>
      <h1 className="font-display text-4xl text-navy">Who is this song for?</h1>
      <p className="mt-3 prose-muted">We&apos;ll use these details for pronunciation, dedication, and lyrics.</p>
      <FormError message={error} />
      <form action={saveRecipientAction.bind(null, projectId)} className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="name">Recipient name</label>
          <input id="name" name="name" required defaultValue={r?.name || ""} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="pronunciation">Pronunciation guide</label>
          <input id="pronunciation" name="pronunciation" defaultValue={r?.pronunciation || ""} className={field} placeholder="uh-VAY-ree" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="relationship">Relationship</label>
          <input id="relationship" name="relationship" defaultValue={r?.relationship || ""} className={field} placeholder="Partner, parent, friend..." />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="pronouns">Preferred pronouns</label>
          <input id="pronouns" name="pronouns" defaultValue={r?.pronouns || ""} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="nickname">Nickname (optional)</label>
          <input id="nickname" name="nickname" defaultValue={r?.nickname || ""} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="fromName">Who is the song from?</label>
          <input id="fromName" name="fromName" defaultValue={r?.fromName || ""} className={field} />
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/occasion`} className="btn-secondary">Back</Link>
          <button type="submit" className="btn-primary">Continue</button>
        </div>
      </form>
    </StudioShell>
  );
}
