import { getLocale } from "@/lib/i18n";
import { LEGAL_CONTENT, type LegalDocumentKey } from "@/lib/legal-content";

const SUPPORT_EMAIL = "hello@memoriestomelody.com";

function Paragraph({ text }: { text: string }) {
  const [before, after] = text.split("{email}");
  return (
    <p className="prose-muted">
      {before}
      {after !== undefined ? <><a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a>{after}</> : null}
    </p>
  );
}

export async function LegalDocument({ document }: { document: LegalDocumentKey }) {
  const locale = await getLocale();
  const content = LEGAL_CONTENT[locale][document];
  return (
    <article className="section-pad">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-4xl text-navy">{content.title}</h1>
          <p className="text-sm text-muted">{content.updated}</p>
          <Paragraph text={content.intro} />
        </header>
        {content.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-display text-2xl text-navy">{section.title}</h2>
            <Paragraph text={section.body} />
          </section>
        ))}
      </div>
    </article>
  );
}
