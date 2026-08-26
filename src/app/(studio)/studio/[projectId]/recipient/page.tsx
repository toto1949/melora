import { StudioShell } from "@/components/studio/studio-shell";
import { FormError } from "@/components/studio/form-error";
import { saveRecipientAction } from "@/lib/actions/studio";
import { loadStudioProject } from "@/lib/studio/load-project";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";
import { SubmitButton } from "@/components/studio/submit-button";

export default async function RecipientStep({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { projectId } = await params;
  const { error } = await searchParams;
  const [project, messages] = await Promise.all([loadStudioProject(projectId), getMessages()]);
  const copy = messages.studio.recipient;
  const r = project.recipient;
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <StudioShell projectId={projectId} currentStep={2}>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <p className="mt-3 prose-muted">{copy.body}</p>
      <FormError message={error} />
      <form action={saveRecipientAction.bind(null, projectId)} className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="name">{copy.name}</label>
          <input id="name" name="name" required defaultValue={r?.name || ""} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="recipientEmail">{copy.email}</label>
          <input
            id="recipientEmail"
            name="recipientEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={r?.email || ""}
            className={field}
            placeholder={copy.emailHint}
          />
          <p className="mt-2 text-xs text-muted">{copy.emailHelp}</p>
        </div>
        <label className="sm:col-span-2 flex items-start gap-3 rounded-2xl border border-border bg-cream/60 p-4 text-sm">
          <input
            type="checkbox"
            name="sendGiftEmail"
            defaultChecked={r?.sendGiftEmail ?? false}
            className="mt-1"
          />
          <span>
            <span className="block font-semibold text-navy">{copy.sendGiftEmail}</span>
            <span className="mt-1 block text-muted">{copy.sendGiftEmailHelp}</span>
          </span>
        </label>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="pronunciation">{copy.pronunciation}</label>
          <input id="pronunciation" name="pronunciation" defaultValue={r?.pronunciation || ""} className={field} placeholder={copy.pronunciationHint} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="relationship">{copy.relationship}</label>
          <input id="relationship" name="relationship" defaultValue={r?.relationship || ""} className={field} placeholder={copy.relationshipHint} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="pronouns">{copy.pronouns}</label>
          <input id="pronouns" name="pronouns" defaultValue={r?.pronouns || ""} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="nickname">{copy.nickname}</label>
          <input id="nickname" name="nickname" defaultValue={r?.nickname || ""} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="fromName">{copy.fromName}</label>
          <input id="fromName" name="fromName" defaultValue={r?.fromName || ""} className={field} />
        </div>
        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <Link href={`/studio/${projectId}/occasion`} className="btn-secondary">{messages.common.back}</Link>
          <SubmitButton label={messages.common.continue} pendingLabel={messages.common.saving} />
        </div>
      </form>
    </StudioShell>
  );
}
