import { startStudioAction } from "@/lib/actions/studio";

export const metadata = { title: "Create Your Song" };

export default function StudioEntryPage() {
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-xl p-8 text-center">
        <p className="font-display text-4xl text-navy">Melora Studio</p>
        <p className="mt-3 prose-muted">
          Create a personalized song in about five minutes. No account required to begin—we&apos;ll save your progress as you go.
        </p>
        <form action={startStudioAction} className="mt-8">
          <button type="submit" className="btn-primary w-full">
            Begin your song
          </button>
        </form>
      </div>
    </div>
  );
}
