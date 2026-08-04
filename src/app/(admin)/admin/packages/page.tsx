import { listPackages } from "@/lib/db/repository";
import { updatePackageAction } from "@/lib/actions/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPackagesPage() {
  const packages = await listPackages();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Packages & pricing</h1>
      {packages.map((pkg) => (
        <form key={pkg.id} action={updatePackageAction.bind(null, pkg.id)} className="surface-card grid gap-3 p-5 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-2xl">{pkg.name}</p>
            <p className="text-sm text-muted">{pkg.slug}</p>
          </div>
          <div>
            <label className="text-xs text-muted" htmlFor={`price-${pkg.id}`}>Price (cents)</label>
            <input id={`price-${pkg.id}`} name="priceCents" type="number" defaultValue={pkg.priceCents} className="w-full rounded-xl border border-border px-3 py-2" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">Save ({formatCurrency(pkg.priceCents)})</button>
          </div>
        </form>
      ))}
    </div>
  );
}
