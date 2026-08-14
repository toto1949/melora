import Link from "next/link";
import { SignInForm } from "@/components/auth/auth-forms";
import { getMessages } from "@/lib/i18n";

export const metadata = { title: "Sign In" };

export default async function SignInPage() {
  const messages = await getMessages();
  const copy = messages.auth;
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-navy">{copy.signInTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {copy.signInBody}
        </p>
        <SignInForm />
        <div className="mt-6 space-y-2 text-sm text-muted">
          <p>
            {copy.newUser} <Link href="/auth/sign-up" className="underline">{copy.createAccount}</Link>
          </p>
          <p>
            <Link href="/auth/reset-password" className="underline">{copy.forgot}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
