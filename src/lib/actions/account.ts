"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth/session";
import { softDeleteUser, updateProfile } from "@/lib/db/repository";
import { getSupabaseServer } from "@/lib/db/client";
import { hasSupabase } from "@/lib/env";

export type DeleteAccountState = { error: string } | null;
export type ProfileState = { error?: string; success?: boolean } | null;

export async function updateProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };
  const fullName = String(formData.get("fullName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (fullName.length > 100 || phone.length > 30) return { error: "Please shorten your name or phone number." };
  const updated = await updateProfile(user.id, {
    fullName: fullName || null,
    phone: phone || null,
    marketingOptIn: formData.get("marketingOptIn") === "on",
    trainingOptIn: formData.get("trainingOptIn") === "on",
  });
  return updated ? { success: true } : { error: "We could not save your profile. Please try again." };
}

export async function deleteAccountAction(_prev: DeleteAccountState, formData: FormData): Promise<DeleteAccountState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };
  const confirm = String(formData.get("confirm") || "");
  if (confirm !== "DELETE") {
    return { error: "Type DELETE exactly to confirm account deletion." };
  }

  await softDeleteUser(user.id);

  if (hasSupabase()) {
    const sb = await getSupabaseServer();
    await sb.auth.signOut();
  } else {
    await signOut();
  }

  redirect("/?deleted=1");
}
