import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you create a personalized song with Memories to Melody: licensing, delivery, revisions, and acceptable use.",
  alternates: { canonical: "/legal/terms" },
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

export default function TermsPage() {
  return (
    <article className="section-pad">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-4xl text-navy">Terms of Service</h1>
          <p className="text-sm text-muted">Last updated {LAST_UPDATED}</p>
          <p className="prose-muted">
            These terms govern your use of Memories to Melody (&ldquo;we&rdquo;, &ldquo;us&rdquo;) at
            memoriestomelody.com. By placing an order or creating an account you agree to them. If you do not
            agree, please do not use the service.
          </p>
        </header>

        <Section title="1. What we provide">
          <p className="prose-muted">
            Memories to Melody creates personalized songs from the stories, names, and preferences you provide.
            Each order includes original lyrics, a studio-quality recording in your chosen genre and vocal
            style, and delivery through a private listening page and downloadable audio files. Package contents,
            delivery targets, and revision credits are described on the pricing page at the time of purchase.
          </p>
        </Section>

        <Section title="2. Your content and our license to use it">
          <p className="prose-muted">
            You confirm that you have the right to share the stories, names, photos, and other media you submit,
            and that your submissions do not infringe anyone else&rsquo;s rights or include unlawful content. You
            retain ownership of everything you upload. You grant us a limited license to use your submissions
            solely to create and deliver your song, provide support, and process revisions. We do not use your
            stories or media to train AI models unless you explicitly opt in.
          </p>
        </Section>

        <Section title="3. Your license to the finished song">
          <p className="prose-muted">
            Every package includes a lifetime personal-use license: you may listen, download, share the private
            listening link, play the song at private events, and post it on personal social media accounts.
            Commercial use — including advertising, monetized content, resale, or broadcast — requires a separate
            commercial license. Contact us before any commercial use.
          </p>
        </Section>

        <Section title="4. Delivery and revisions">
          <p className="prose-muted">
            Delivery targets (for example, 48 hours for standard delivery) are measured from the moment your
            order and story details are complete. Most orders arrive early, but delivery targets are good-faith
            estimates, not guarantees, except where a paid rush option states otherwise. If we anticipate a
            delay, we will contact you. Included revision credits let you request changes to lyrics, style, or
            mix; revisions are scoped to the original story and occasion.
          </p>
        </Section>

        <Section title="5. Payment">
          <p className="prose-muted">
            Prices are shown at checkout and charged when you place your order. Payments are processed by
            Stripe; we never store your card details. Applicable taxes are calculated at checkout. Discount
            codes cannot be applied retroactively.
          </p>
        </Section>

        <Section title="6. Acceptable use">
          <p className="prose-muted">
            You may not use the service to create content that is hateful, harassing, sexually explicit
            involving minors, or intended to defame or impersonate a real person without their consent. We may
            decline or refund any order that violates this policy. You also may not attempt to disrupt the
            service, scrape it, or resell it without our written permission.
          </p>
        </Section>

        <Section title="7. Accounts">
          <p className="prose-muted">
            You are responsible for keeping your account credentials secure and for activity under your
            account. You can request account deletion at any time from your dashboard or by contacting support;
            deletion removes your personal data as described in our Privacy Policy.
          </p>
        </Section>

        <Section title="8. Disclaimers and liability">
          <p className="prose-muted">
            The service is provided &ldquo;as is&rdquo;. To the maximum extent permitted by law, our total
            liability for any claim arising out of an order is limited to the amount you paid for that order.
            We are not liable for indirect or consequential damages. Nothing in these terms limits liability
            that cannot be limited by law.
          </p>
        </Section>

        <Section title="9. Changes to these terms">
          <p className="prose-muted">
            We may update these terms as the service evolves. Material changes will be announced on this page
            with a new &ldquo;last updated&rdquo; date. Continued use after a change means you accept the
            updated terms; orders are always governed by the terms in effect when they were placed.
          </p>
        </Section>

        <Section title="10. Contact">
          <p className="prose-muted">
            Questions about these terms? Email{" "}
            <a href="mailto:hello@memoriestomelody.com" className="underline">
              hello@memoriestomelody.com
            </a>
            .
          </p>
        </Section>
      </div>
    </article>
  );
}
