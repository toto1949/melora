import { cookies } from "next/headers";
import { LANGUAGES } from "@/lib/constants";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";
import es from "../../messages/es.json";
import fr from "../../messages/fr.json";

export const LOCALE_COOKIE = "melora_locale";
export const SUPPORTED_LOCALES = LANGUAGES.map((l) => l.code);
export type Locale = (typeof SUPPORTED_LOCALES)[number];

type Messages = typeof en;

const DICTIONARIES: Record<Locale, Messages> = { en, es, fr, ar };

export function isSupportedLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as string[]).includes(value);
}

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return isSupportedLocale(value) ? value : "en";
}

export async function getMessages(locale?: Locale): Promise<Messages> {
  const resolved = locale ?? (await getLocale());
  return DICTIONARIES[resolved] ?? DICTIONARIES.en;
}

export function getTextDirection(locale: Locale): "ltr" | "rtl" {
  return LANGUAGES.find((l) => l.code === locale)?.dir ?? "ltr";
}

export function translate(messages: Messages, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined), messages);
  return typeof value === "string" ? value : key;
}
