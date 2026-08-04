import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { CookieConsent } from "@/components/shared/cookie-consent";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen">
      <SiteHeader signedIn={!!user} />
      <main>{children}</main>
      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
