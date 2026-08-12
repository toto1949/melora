import Link from "next/link";
import { SignUpForm } from "@/components/auth/auth-forms";

export const metadata = { title: "Sign Up" };

export default function SignUpPage() {
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-navy">Create your Memories to Melody account</h1>
        <p className="mt-2 text-sm text-muted">
          Keep every song, request revisions, and control who can listen.
        </p>
        <SignUpForm />
        <p className="mt-6 text-sm text-muted">
          Already have an account? <Link href="/auth/sign-in" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
