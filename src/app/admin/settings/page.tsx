import { AdminSettingsClient } from "@/components/admin/admin-settings-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getEmailLogs } from "@/lib/email-logs";
import { getPlatformSettings, supportedActiveLanguages } from "@/lib/platform-settings";
import { auth } from "@/auth";

const hasDatabase = Boolean(process.env.DATABASE_URL);

function getCanonicalAppUrl() {
  return process.env.AUTH_URL?.replace(/\/$/, "")
    || process.env.NEXTAUTH_URL?.replace(/\/$/, "")
    || process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    || "";
}

export default async function AdminSettingsPage() {
  await requireAdmin("/admin/settings");

  const [session, settings, emailLogs] = await Promise.all([
    auth(),
    getPlatformSettings(),
    hasDatabase ? getEmailLogs(80) : Promise.resolve([])
  ]);

  return (
    <AdminShell
      title="Platform settings"
      description="Languages, payments, footer, OAuth, Gemini, social automations, domain operations, and hosting infrastructure."
      activePath="/admin/settings"
    >
      <AdminSettingsClient
        activeLanguages={settings.activeLanguages}
        availableLanguages={supportedActiveLanguages}
        footerDetails={settings.footerDetails}
        paymentIntegrations={settings.paymentIntegrations}
        oauthConfig={settings.oauthConfig}
        geminiConfig={settings.geminiConfig}
        ttsConfig={settings.ttsConfig}
        voiceProviderConfig={settings.voiceProviderConfig}
        infobipConfig={settings.infobipConfig}
        socialBotConfig={settings.socialBotConfig}
        adminUserId={session?.user?.id ?? ""}
        magneticCommerceConfig={settings.magneticCommerceConfig}
        trustedPartnersConfig={settings.trustedPartnersConfig}
        welcomeEmailConfig={settings.welcomeEmailConfig}
        transactionalEmailConfig={settings.transactionalEmailConfig}
        emailNotificationsConfig={settings.emailNotificationsConfig}
        domainProviderConfig={settings.domainProviderConfig}
        hostingProviderConfig={settings.hostingProviderConfig}
        aboutConfig={settings.aboutConfig}
        brandingConfig={settings.brandingConfig}
        emailLogs={emailLogs}
        appBaseUrl={getCanonicalAppUrl()}
        canPersist={hasDatabase}
      />
    </AdminShell>
  );
}
