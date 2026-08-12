"use server";

import { redirect } from "next/navigation";
import { signInWithPassword, signOut, signUpWithPassword } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/send";
import { getEnv } from "@/lib/env";
import { z, ZodError } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export type AuthState = { error: string } | null;

function friendlyAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/invalid login credentials|invalid credentials/i.test(message)) {
    return "Incorrect email or password. Please try again.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email first — check your inbox for the confirmation link.";
  }
  if (/already registered|already exists/i.test(message)) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (/rate limit/i.test(message)) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const parsed = authSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await signInWithPassword(parsed.email, parsed.password);
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message ?? "Please review the form." };
    }
    return { error: friendlyAuthError(error) };
  }
  redirect("/dashboard");
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  try {
    const parsed = authSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name") || undefined,
    });
    const profile = await signUpWithPassword(parsed.email, parsed.password, parsed.name);
    const env = getEnv();
    await sendEmail({
      to: profile.email,
      template: "welcome",
      data: { name: profile.fullName },
    });
    await sendEmail({
      to: profile.email,
      template: "email-verification",
      data: { verifyUrl: `${env.NEXT_PUBLIC_APP_URL}/auth/verify` },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: error.issues[0]?.message ?? "Please review the form." };
    }
    return { error: friendlyAuthError(error) };
  }
  redirect("/dashboard");
}

export async function signOutAction() {
  await signOut();
  redirect("/");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const env = getEnv();
  if (email) {
    await sendEmail({
      to: email,
      template: "password-reset",
      data: { resetUrl: `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password` },
    });
  }
  redirect("/auth/reset-password?sent=1");
}
