import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CommerceOverlays } from "@/components/commerce/commerce-overlays";
import { AnimatedPageShell } from "@/components/layout/animated-page-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/providers/app-providers";
import { routing } from "@/i18n/routing";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { fallbackLanguages, getActiveLanguages } from "@/lib/settings";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, session, activeLanguages] = await Promise.all([
    getMessages(),
    auth(),
    getActiveLanguages().catch(() => fallbackLanguages)
  ]);
  const hasMagneticSocialBotAccess = session?.user?.id
    ? await userHasMagneticSocialBotAccess(session.user.id).catch(() => false)
    : false;

  const activeLocale = activeLanguages.find((language) => language.code === locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProviders session={session}>
        <div
          className="min-h-screen bg-hero-radial"
          data-direction={activeLocale?.direction ?? "ltr"}
          data-locale={locale}
          data-user-role={session?.user?.role ?? "guest"}
          dir={activeLocale?.direction ?? "ltr"}
        >
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_36%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.2),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.16),transparent_24%)]" />
            <SiteHeader
              locale={locale}
              activeLanguages={activeLanguages}
              sessionUser={session?.user}
              hasMagneticSocialBotAccess={hasMagneticSocialBotAccess}
            />
            <AnimatedPageShell>
              <div className="relative z-10">{children}</div>
            </AnimatedPageShell>
            <SiteFooter locale={locale} />
            <CommerceOverlays />
          </div>
        </div>
      </AppProviders>
    </NextIntlClientProvider>
  );
}
