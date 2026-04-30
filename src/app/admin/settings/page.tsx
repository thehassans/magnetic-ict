import { AdminSettingsClient } from "@/components/admin/admin-settings-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getPlatformSettings, supportedActiveLanguages } from "@/lib/platform-settings";

const hasDatabase = Boolean(process.env.DATABASE_URL);

function getCanonicalAppUrl() {
  return process.env.AUTH_URL?.replace(/\/$/, "")
    || process.env.NEXTAUTH_URL?.replace(/\/$/, "")
    || process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    || "";
}

export default async function AdminSettingsPage() {
  await requireAdmin("/admin/settings");

  const settings = await getPlatformSettings();

  return (
    <AdminShell
      title="Platform settings"
      description="Languages, payments, footer, OAuth, Gemini, social automations, and hosting infrastructure."
      activePath="/admin/settings"
    >
      <AdminSettingsClient
        activeLanguages={settings.activeLanguages}
        availableLanguages={supportedActiveLanguages}
        footerDetails={settings.footerDetails}
        paymentIntegrations={settings.paymentIntegrations}
        oauthConfig={settings.oauthConfig}
        geminiConfig={settings.geminiConfig}
        socialBotConfig={settings.socialBotConfig}
        welcomeEmailConfig={settings.welcomeEmailConfig}
        hostingProviderConfig={settings.hostingProviderConfig}
        appBaseUrl={getCanonicalAppUrl()}
        canPersist={hasDatabase}
      />
    </AdminShell>
  );
}
