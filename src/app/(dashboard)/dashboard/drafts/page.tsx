import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserProjects } from "@/lib/db/repository";
import { getMessages } from "@/lib/i18n";

export default async function DraftsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [projects, messages] = await Promise.all([listUserProjects(user.id), getMessages()]);
  const drafts = projects.filter((p) => p.status === "draft");
  const copy = messages.dashboard.drafts;
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <div className="mt-6 space-y-3">
        {drafts.map((project) => (
          <article key={project.id} className="surface-card flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold">{project.recipient?.name || copy.untitled}</p>
              <p className="text-sm text-muted">{copy.step} {project.currentStep} · {project.occasion || copy.noOccasion}</p>
            </div>
            <Link href={`/studio/${project.id}/occasion`} className="btn-primary !py-2 text-sm">{copy.resume}</Link>
          </article>
        ))}
        {drafts.length === 0 ? <p className="text-muted">{copy.empty}</p> : null}
      </div>
    </div>
  );
}
