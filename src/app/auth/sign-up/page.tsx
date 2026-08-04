import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";

export const metadata = { title: "Sign Up" };

export default function SignUpPage() {
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-navy">Create your Melora account</h1>
        <form action={signUpAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name</label>
            <input id="name" name="name" className={field} />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" required className={field} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" required minLength={8} className={field} />
          </div>
          <button type="submit" className="btn-primary w-full">Create account</button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Already have an account? <Link href="/auth/sign-in" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
