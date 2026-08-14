import Link from "next/link";
import { SignUpForm } from "@/components/auth/auth-forms";
import { getMessages } from "@/lib/i18n";

export const metadata = { title: "Sign Up" };

export default async function SignUpPage() {
  const messages = await getMessages();
  const copy = messages.auth;
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-navy">{copy.signUpTitle}</h1>
        <p className="mt-2 text-sm text-muted">
          {copy.signUpBody}
        </p>
        <SignUpForm />
        <p className="mt-6 text-sm text-muted">
          {copy.already} <Link href="/auth/sign-in" className="underline">{copy.signIn}</Link>
        </p>
      </div>
    </div>
  );
}
