import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Memories to Melody's refund policy: revision-first quality guarantee, full refunds for non-delivery, and how to request one.",
  alternates: { canonical: "/legal/refunds" },
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

export default function RefundsPage() {
  return (
    <article className="section-pad">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-4xl text-navy">Refund Policy</h1>
          <p className="text-sm text-muted">Last updated {LAST_UPDATED}</p>
          <p className="prose-muted">
            Every song is made to order, so our policy is revision-first: if something is off, we fix it. If we
            can&rsquo;t make it right, we refund you. Here is exactly how that works.
          </p>
        </header>

        <Section title="1. Before your song is delivered">
          <p className="prose-muted">
            You can cancel for a full refund any time before production of your song has started. Once
            production is underway, we can no longer cancel, but the quality guarantee below still applies to
            the delivered song.
          </p>
        </Section>

        <Section title="2. Our quality guarantee">
          <p className="prose-muted">
            If your delivered song has a real quality problem — wrong names or facts from your brief, an
            obviously different genre than you selected, or audio defects — tell us within 14 days of delivery.
            We will first fix it using your included revision credits at no cost. If we still cannot deliver a
            usable song after revisions, you get a full refund.
          </p>
        </Section>

        <Section title="3. What isn't covered">
          <p className="prose-muted">
            Because each song is a custom creation, taste alone (&ldquo;I imagined it differently&rdquo;) is
            what revision credits are for, not automatic refunds. Refunds also do not cover incorrect details
            you submitted in your brief, or requests made more than 14 days after delivery. We review edge
            cases individually — when in doubt, write to us.
          </p>
        </Section>

        <Section title="4. Non-delivery">
          <p className="prose-muted">
            If we fail to deliver your song entirely, you receive a full refund without needing to ask twice.
            If a paid rush deadline is missed, we refund the rush fee automatically.
          </p>
        </Section>

        <Section title="5. How to request a refund">
          <p className="prose-muted">
            Email{" "}
            <a href="mailto:hello@memoriestomelody.com" className="underline">
              hello@memoriestomelody.com
            </a>{" "}
            with your order number and a short description of the issue. We respond within 2 business days.
            Approved refunds are returned to your original payment method; banks typically post them within
            5–10 business days.
          </p>
        </Section>
      </div>
    </article>
  );
}
