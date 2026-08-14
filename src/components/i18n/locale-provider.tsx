"use client";

import { createContext, useContext } from "react";
import type { Locale, Messages } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  messages: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  locale,
  messages,
}: LocaleContextValue & { children: React.ReactNode }) {
  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
