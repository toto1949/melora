export const metadata = { title: "Verify Email" };

export default function VerifyPage() {
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-md p-8 text-center">
        <h1 className="font-display text-3xl text-navy">Email verification</h1>
        <p className="mt-3 prose-muted">
          In production, Supabase handles verification tokens here. Your demo account is ready to use.
        </p>
      </div>
    </div>
  );
}
