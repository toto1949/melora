import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Memories to Melody collects, uses, and protects your data — including your stories, uploads, and payment details.",
  alternates: { canonical: "/legal/privacy" },
};

const LAST_UPDATED = "August 12, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl text-navy">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <article className="section-pad">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-4xl text-navy">Privacy Policy</h1>
          <p className="text-sm text-muted">Last updated {LAST_UPDATED}</p>
          <p className="prose-muted">
            Your songs are built from personal stories, so privacy is core to how Memories to Melody works.
            This policy explains what we collect, why, and the choices you have.
          </p>
        </header>

        <Section title="1. What we collect">
          <ul className="list-disc space-y-2 pl-5 prose-muted">
            <li>
              <strong>Account data</strong> — email address, name, and sign-in records, used to run your
              account and deliver your orders.
            </li>
            <li>
              <strong>Order and story data</strong> — the recipient details, memories, occasion, and musical
              preferences you enter in the studio, used solely to write and produce your song.
            </li>
            <li>
              <strong>Uploads</strong> — optional photos, voice notes, or documents you attach to a project,
              stored in private storage and accessed only through short-lived signed links.
            </li>
            <li>
              <strong>Payment data</strong> — handled entirely by Stripe. We receive order totals and payment
              status, never your card number.
            </li>
            <li>
              <strong>Usage data</strong> — privacy-friendly, cookie-less page analytics (Vercel Web
              Analytics) and product events such as &ldquo;checkout started&rdquo;, used to improve the
              service. We do not build advertising profiles.
            </li>
          </ul>
        </Section>

        <Section title="2. How we use your data">
          <p className="prose-muted">
            We use your data to create and deliver your songs, process payments, send transactional emails
            (order confirmations, delivery notifications, sign-in links), provide support, prevent fraud and
            abuse, and improve the product. We send marketing email only if you opt in, and every message
            includes an unsubscribe link.
          </p>
        </Section>

        <Section title="3. AI processing and model training">
          <p className="prose-muted">
            Your story is processed by AI providers to generate lyrics and music. These providers process your
            content to fulfill your order only. We do not use your stories, uploads, or finished songs to train
            AI models unless you explicitly opt in from your account settings.
          </p>
        </Section>

        <Section title="4. Who we share data with">
          <p className="prose-muted">
            We share data only with the processors needed to run the service: Supabase (database and file
            storage), Stripe (payments), Vercel (hosting and analytics), Resend (email delivery), and our AI
            generation providers. Each receives only what it needs. We never sell your personal data.
          </p>
        </Section>

        <Section title="5. Sharing pages">
          <p className="prose-muted">
            Each delivered song gets a private listening page reachable only by its unguessable link. You
            control it: you can make the page password-protected or disable sharing entirely from your
            dashboard. Songs are never listed publicly unless you choose to submit one as a public example or
            review.
          </p>
        </Section>

        <Section title="6. Retention and deletion">
          <p className="prose-muted">
            We keep your songs and projects so you can return to them — the license is lifetime, so we do not
            auto-delete delivered work. You can delete individual projects, export your data, or request full
            account deletion at any time from your dashboard or by emailing us. Deletion removes personal data
            within 30 days, except records we must keep for legal or accounting reasons.
          </p>
        </Section>

        <Section title="7. Security">
          <p className="prose-muted">
            All traffic is encrypted with TLS. Uploads live in private buckets with signed, expiring URLs.
            Access to production data is limited to staff who need it to run the service.
          </p>
        </Section>

        <Section title="8. Your rights">
          <p className="prose-muted">
            Depending on where you live (including under GDPR and CCPA), you may have rights to access,
            correct, export, or delete your personal data, and to object to certain processing. Contact us and
            we will honor these requests regardless of your location.
          </p>
        </Section>

        <Section title="9. Children">
          <p className="prose-muted">
            The service is intended for adults. We do not knowingly collect data from children under 16.
            Songs about children (birthdays, new babies) are created from information their parent or guardian
            provides.
          </p>
        </Section>

        <Section title="10. Contact">
          <p className="prose-muted">
            For privacy requests or questions, email{" "}
            <a href="mailto:hello@memoriestomelody.com" className="underline">
              hello@memoriestomelody.com
            </a>
            . We respond to verified requests within 30 days.
          </p>
        </Section>
      </div>
    </article>
  );
}
