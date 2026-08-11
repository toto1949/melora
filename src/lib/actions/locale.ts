"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isSupportedLocale, LOCALE_COOKIE } from "@/lib/i18n";

export async function setLocaleAction(formData: FormData) {
  const locale = String(formData.get("locale") || "");
  if (!isSupportedLocale(locale)) return;

  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}
