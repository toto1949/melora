import { getSettings, listFaqs } from "@/lib/db/repository";
import { updateSettingsAction } from "@/lib/actions/admin";

export default async function AdminContentPage() {
  const [settings, faqs] = await Promise.all([getSettings(), listFaqs()]);
  const field = "w-full rounded-xl border border-border px-3 py-2";
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">Landing content & settings</h1>
      <form action={updateSettingsAction} className="surface-card grid gap-3 p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-sm" htmlFor="heroHeadline">Hero headline</label>
          <input id="heroHeadline" name="heroHeadline" defaultValue={settings.heroHeadline} className={field} />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm" htmlFor="heroSupporting">Supporting copy</label>
          <textarea id="heroSupporting" name="heroSupporting" defaultValue={settings.heroSupporting} className={field + " min-h-24"} />
        </div>
        <div>
          <label className="text-sm" htmlFor="songsCreated">Songs created</label>
          <input id="songsCreated" name="songsCreated" type="number" defaultValue={settings.songsCreated} className={field} />
        </div>
        <div>
          <label className="text-sm" htmlFor="averageRating">Average rating</label>
          <input id="averageRating" name="averageRating" type="number" step="0.1" defaultValue={settings.averageRating} className={field} />
        </div>
        <div>
          <label className="text-sm" htmlFor="genresSupported">Genres supported</label>
          <input id="genresSupported" name="genresSupported" type="number" defaultValue={settings.genresSupported} className={field} />
        </div>
        <div>
          <label className="text-sm" htmlFor="countriesServed">Countries served</label>
          <input id="countriesServed" name="countriesServed" type="number" defaultValue={settings.countriesServed} className={field} />
        </div>
        <button type="submit" className="btn-primary md:col-span-2">Save settings</button>
      </form>
      <section className="surface-card p-5">
        <h2 className="font-display text-2xl">FAQ ({faqs.length})</h2>
        <p className="mt-2 text-sm text-muted">FAQ items are editable via seed/admin CMS extensions. Current published count shown above.</p>
      </section>
    </div>
  );
}
