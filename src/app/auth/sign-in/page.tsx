import Link from "next/link";
import { SignInForm } from "@/components/auth/auth-forms";

export const metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-navy">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to manage your songs, revisions, and sharing.
        </p>
        <SignInForm />
        <div className="mt-6 space-y-2 text-sm text-muted">
          <p>
            New to Melora? <Link href="/auth/sign-up" className="underline">Create an account</Link>
          </p>
          <p>
            <Link href="/auth/reset-password" className="underline">Forgot password</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
