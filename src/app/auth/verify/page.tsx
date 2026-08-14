export const metadata = { title: "Verify Email" };

export default async function VerifyPage() {
  const messages = await getMessages();
  const copy = messages.auth;
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-md p-8 text-center">
        <h1 className="font-display text-3xl text-navy">{copy.verifyTitle}</h1>
        <p className="mt-3 prose-muted">
          {copy.verifyBody}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/auth/sign-in" className="btn-primary">{copy.signIn}</Link>
          <Link href="/" className="btn-secondary">{copy.backHome}</Link>
        </div>
      </div>
    </div>
  );
}
import Link from "next/link";
import { getMessages } from "@/lib/i18n";
