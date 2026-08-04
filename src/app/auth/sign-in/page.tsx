import Link from "next/link";
import { signInAction } from "@/lib/actions/auth";

export const metadata = { title: "Sign In" };

export default function SignInPage() {
  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3";
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-navy">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Demo auth accepts any email/password (min 8 chars). Use admin@melora.app for admin access.
        </p>
        <form action={signInAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" required className={field} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
            <input id="password" name="password" type="password" required minLength={8} className={field} />
          </div>
          <button type="submit" className="btn-primary w-full">Sign in</button>
        </form>
        <div className="mt-6 space-y-2 text-sm text-muted">
          <p>
            <Link href="/auth/sign-up" className="underline">Create an account</Link>
          </p>
          <p>
            <Link href="/auth/reset-password" className="underline">Forgot password</Link>
          </p>
          <p className="pt-2">OAuth (Google / Apple) and magic links wire to Supabase Auth when configured.</p>
        </div>
      </div>
    </div>
  );
}
