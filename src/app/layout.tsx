import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { BRAND } from "@/lib/constants";
import { getLocale, getTextDirection } from "@/lib/i18n";
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
  return (
    <html lang={locale} dir={getTextDirection(locale)}>
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
