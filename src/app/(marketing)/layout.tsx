import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getMessages } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const [user, messages] = await Promise.all([getCurrentUser(), getMessages(locale)]);
  return (
    <div className="min-h-screen">
      <SiteHeader signedIn={!!user} labels={messages.nav} />
      <main>{children}</main>
      <SiteFooter locale={locale} messages={messages} />
    </div>
  );
}
