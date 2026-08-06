"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth/session";
import { softDeleteUser } from "@/lib/db/repository";
import { getSupabaseServer } from "@/lib/db/client";
import { hasSupabase } from "@/lib/env";

export async function deleteAccountAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const confirm = String(formData.get("confirm") || "");
  if (confirm !== "DELETE") {
    throw new Error("Type DELETE to confirm account deletion");
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
