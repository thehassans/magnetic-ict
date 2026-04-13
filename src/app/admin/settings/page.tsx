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
      description="Control languages, public footer details, payment availability, OAuth visibility, and Gemini integration from one premium settings center."
      activePath="/admin/settings"
    >
      <AdminSettingsClient
        activeLanguages={settings.activeLanguages}
        availableLanguages={supportedActiveLanguages}
        footerDetails={settings.footerDetails}
        paymentIntegrations={settings.paymentIntegrations}
        oauthConfig={settings.oauthConfig}
        geminiConfig={settings.geminiConfig}
        canPersist={hasDatabase}
      />
    </AdminShell>
  );
}
