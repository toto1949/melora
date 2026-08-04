import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { BRAND } from "@/lib/constants";
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
  openGraph: {
    title: BRAND.name,
    description: BRAND.tagline,
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.tagline,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
