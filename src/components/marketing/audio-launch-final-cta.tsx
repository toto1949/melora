import Link from "next/link";

export function AudioLaunchFinalCta() {
  return (
    <section className="section-pad">
      <div className="atmosphere grain mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-border px-6 py-14 text-center md:px-12">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose">$19 launch offer</p>
        <h2 className="mt-2 font-display text-3xl text-navy md:text-5xl">
          Ready to turn their memory into a song?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl prose-muted">
          Tell us the story, choose the sound, and receive one personalized audio song with an MP3 download, private listening link, and one guided revision.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/studio?package=essential-song" className="btn-primary">
            Create Your Song — $19
          </Link>
        </div>
        <p className="mt-5 text-sm text-muted">
          One-time payment · No subscription · Secure Stripe checkout
        </p>
      </div>
    </section>
  );
}
