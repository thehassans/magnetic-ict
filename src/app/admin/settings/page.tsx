import { AdminSettingsClient } from "@/components/admin/admin-settings-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getPlatformSettings, supportedActiveLanguages } from "@/lib/platform-settings";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export default async function AdminSettingsPage() {
  await requireAdmin("/admin/settings");

  const settings = await getPlatformSettings();

  return (
    <AdminShell
      title="Platform settings"
      description="Languages, payments, footer, OAuth, and Gemini."
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
        canPersist={hasDatabase}
      />
    </AdminShell>
  );
}
