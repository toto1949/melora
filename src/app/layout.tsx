import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Sans_Arabic } from "next/font/google";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { BRAND } from "@/lib/constants";
import { getLocale, getMessages, getTextDirection } from "@/lib/i18n";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { COOKIE_CONSENT } from "@/lib/cookie-consent";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: `${BRAND.name} — Personalized songs from your memories`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.tagline,
  keywords: [
    "personalized song",
    "custom song gift",
    "song from memories",
    "anniversary song",
    "birthday song",
    "wedding song",
    "custom lyrics",
    "personalized music gift",
  ],
  openGraph: {
    title: `${BRAND.name} — Personalized songs from your memories`,
    description: BRAND.tagline,
    type: "website",
    siteName: BRAND.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Personalized songs from your memories`,
    description: BRAND.tagline,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const [messages, cookieJar] = await Promise.all([getMessages(locale), cookies()]);
  const consent = cookieJar.get(COOKIE_CONSENT)?.value;
  return (
    <html lang={locale} dir={getTextDirection(locale)}>
      <body className={`${fraunces.variable} ${manrope.variable} ${notoSansArabic.variable} antialiased`}>
        <LocaleProvider locale={locale} messages={messages}>
          <a href="#main-content" className="skip-link">
            {messages.common.skipToContent}
          </a>
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
          <CookieConsent initialConsent={consent === "all" || consent === "essential" ? consent : null} />
        </LocaleProvider>
        {consent === "all" ? <Analytics /> : null}
      </body>
    </html>
  );
}
