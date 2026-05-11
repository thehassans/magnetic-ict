import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CustomerDashboardShell } from "@/components/dashboard/customer-dashboard-shell";
import { userHasMagneticVpsAccess } from "@/lib/hosting-access";
import { userHasMagneticCommerceAccess } from "@/lib/magnetic-commerce-access";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { userHasPortfolioAccess } from "@/lib/portfolio-access";
import { defaultBrandingConfig, getBrandingConfig } from "@/lib/platform-settings";

export default async function DashboardLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const [hasMagneticVpsAccess, hasMagneticSocialBotAccess, hasMagneticCommerceAccess, hasPortfolioAccess, brandingConfig] = await Promise.all([
    userHasMagneticVpsAccess(session.user.id).catch(() => false),
    userHasMagneticSocialBotAccess(session.user.id).catch(() => false),
    userHasMagneticCommerceAccess(session.user.id).catch(() => false),
    userHasPortfolioAccess(session.user.id).catch(() => false),
    getBrandingConfig().catch(() => defaultBrandingConfig)
  ]);

  return (
    <CustomerDashboardShell
      locale={locale}
      userName={session.user.name}
      userEmail={session.user.email}
      hasMagneticVpsAccess={hasMagneticVpsAccess}
      hasMagneticSocialBotAccess={hasMagneticSocialBotAccess}
      hasMagneticCommerceAccess={hasMagneticCommerceAccess}
      hasPortfolioAccess={hasPortfolioAccess}
      logoLight={brandingConfig.customerLogoLight || undefined}
      logoDark={brandingConfig.customerLogoDark || undefined}
    >
      {children}
    </CustomerDashboardShell>
  );
}
