export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="section-pad">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="font-display text-4xl text-navy">Privacy Policy</h1>
        <p className="prose-muted">
          Memories to Melody processes account data, order details, story inputs, and optional media uploads to create and deliver personalized songs.
          Uploads are stored in private buckets with signed URLs. We do not use customer stories or media for model training without explicit opt-in consent.
        </p>
        <p className="prose-muted">
          You may request account deletion and data export. Cookie preferences are available on first visit. Contact hello@memoriestomelody.com for privacy requests.
        </p>
      </div>
    </article>
  );
}
