import { requestPasswordResetAction } from "@/lib/actions/auth";

export const metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-navy">Reset password</h1>
        {sent ? (
          <p className="mt-4 text-sm prose-muted">
            If that email exists, a reset link has been sent (check server logs in mock mode).
          </p>
        ) : (
          <form action={requestPasswordResetAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Send reset link</button>
          </form>
        )}
      </div>
    </div>
  );
}
