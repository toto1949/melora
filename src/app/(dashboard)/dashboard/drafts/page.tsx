import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserProjects } from "@/lib/db/repository";

export default async function DraftsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const drafts = (await listUserProjects(user.id)).filter((p) => p.status === "draft");
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">Draft Projects</h1>
      <div className="mt-6 space-y-3">
        {drafts.map((project) => (
          <article key={project.id} className="surface-card flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold">{project.recipient?.name || "Untitled draft"}</p>
              <p className="text-sm text-muted">Step {project.currentStep} · {project.occasion || "No occasion yet"}</p>
            </div>
            <Link href={`/studio/${project.id}/occasion`} className="btn-primary !py-2 text-sm">Resume</Link>
          </article>
        ))}
        {drafts.length === 0 ? <p className="text-muted">No drafts. Guest drafts appear here after you claim them at checkout.</p> : null}
      </div>
    </div>
  );
}
