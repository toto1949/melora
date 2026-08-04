export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="section-pad">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="font-display text-4xl text-navy">Terms of Service</h1>
        <p className="prose-muted">
          By creating a Melora project you confirm you have rights to the stories and media you submit.
          Standard packages include a personal-use license for private listening, download, and sharing via Melora links.
          Commercial use requires a separate license.
        </p>
      </div>
    </article>
  );
}
