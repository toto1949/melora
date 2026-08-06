import { verifyListenPasswordAction } from "@/lib/actions/listen";

export function ListenPasswordGate({
  shareToken,
  error,
}: {
  shareToken: string;
  error?: string | null;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        action={verifyListenPasswordAction.bind(null, shareToken)}
        className="surface-card max-w-md space-y-4 p-8 text-center"
      >
        <h1 className="font-display text-3xl">Enter share password</h1>
        <p className="text-muted">This song is password protected.</p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <input
          name="password"
          type="password"
          required
          minLength={4}
          placeholder="Share password"
          className="w-full rounded-2xl border border-border px-4 py-3"
        />
        <button type="submit" className="btn-primary w-full">
          Unlock listening page
        </button>
      </form>
    </div>
  );
}
