import { listJobs } from "@/lib/db/repository";
import { retryJobAction, processJobsAction } from "@/lib/actions/admin";

export default async function AdminJobsPage() {
  const jobs = await listJobs();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Generation jobs</h1>
        <form action={processJobsAction}><button className="btn-primary" type="submit">Process queue</button></form>
      </div>
      <div className="space-y-3">
        {jobs.map((job) => (
          <article key={job.id} className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <div>
              <p className="font-semibold">{job.jobType} · {job.status}</p>
              <p className="text-muted">Order {job.orderId.slice(0, 8)} · attempt {job.attempt}/{job.maxAttempts} · {job.progress}%</p>
              {job.error ? <p className="text-rose">{job.error}</p> : null}
            </div>
            {(job.status === "failed" || job.status === "dead_letter") ? (
              <form action={retryJobAction.bind(null, job.id)}>
                <button type="submit" className="btn-secondary !py-2">Retry</button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
