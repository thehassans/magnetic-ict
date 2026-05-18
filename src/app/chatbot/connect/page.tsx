import { getWorkspaceContext } from "@/lib/social-bot-access";
import { auth } from "@/auth";
import { getSocialBotIntegrations } from "@/lib/social-bot-db";
import { getPlatformSettings } from "@/lib/platform-settings";
import { ChatbotConnect } from "@/components/chatbot/chatbot-connect";

function getCanonicalAppUrl() {
  return (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}

export const dynamic = "force-dynamic";

export default async function ChatbotConnectPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);

  const [integrations, settings] = await Promise.all([
    getSocialBotIntegrations(workspace.ownerId),
    getPlatformSettings()
  ]);

  const oauthCallbackBase = getCanonicalAppUrl();

  return (
    <ChatbotConnect
      integrations={integrations}
      metaAppId={settings.socialBotConfig.metaAppId}
      metaConfigId={settings.socialBotConfig.metaConfigId}
      metaMessengerConfigId={settings.socialBotConfig.metaMessengerConfigId}
      metaInstagramConfigId={settings.socialBotConfig.metaInstagramConfigId}
      oauthCallbackBase={oauthCallbackBase}
    />
  );
}
