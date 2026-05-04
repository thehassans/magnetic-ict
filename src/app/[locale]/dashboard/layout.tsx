import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CustomerDashboardShell } from "@/components/dashboard/customer-dashboard-shell";
import { userHasMagneticVpsAccess } from "@/lib/hosting-access";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";

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

  const [hasMagneticVpsAccess, hasMagneticSocialBotAccess] = await Promise.all([
    userHasMagneticVpsAccess(session.user.id).catch(() => false),
    userHasMagneticSocialBotAccess(session.user.id).catch(() => false)
  ]);

  return (
    <CustomerDashboardShell
      locale={locale}
      userName={session.user.name}
      userEmail={session.user.email}
      hasMagneticVpsAccess={hasMagneticVpsAccess}
      hasMagneticSocialBotAccess={hasMagneticSocialBotAccess}
    >
      {children}
    </CustomerDashboardShell>
  );
}
