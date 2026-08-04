"use server";

import { redirect } from "next/navigation";
import { signInWithPassword, signOut } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/send";
import { getEnv } from "@/lib/env";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export async function signInAction(formData: FormData) {
  const parsed = authSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  await signInWithPassword(parsed.email, parsed.password);
  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const parsed = authSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
  });
  const profile = await signInWithPassword(parsed.email, parsed.password, parsed.name);
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
