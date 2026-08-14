import { verifyListenPasswordAction } from "@/lib/actions/listen";

export function ListenPasswordGate({
  shareToken,
  error,
  labels,
}: {
  shareToken: string;
  error?: string | null;
  labels: {
    title: string;
    body: string;
    placeholder: string;
    unlock: string;
  };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        action={verifyListenPasswordAction.bind(null, shareToken)}
        className="surface-card max-w-md space-y-4 p-8 text-center"
      >
        <h1 className="font-display text-3xl">{labels.title}</h1>
        <p className="text-muted">{labels.body}</p>
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        <input
          name="password"
          type="password"
          required
          minLength={4}
          placeholder={labels.placeholder}
          autoComplete="current-password"
          className="w-full rounded-2xl border border-border px-4 py-3"
        />
        <button type="submit" className="btn-primary w-full">
          {labels.unlock}
        </button>
      </form>
    </div>
  );
}
