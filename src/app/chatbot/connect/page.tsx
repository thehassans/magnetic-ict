import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSocialBotIntegrations } from "@/lib/social-bot-db";
import { getPlatformSettings } from "@/lib/platform-settings";
import { ChatbotConnect } from "@/components/chatbot/chatbot-connect";

export const dynamic = "force-dynamic";

export default async function ChatbotConnectPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/en/sign-in");

  const [integrations, settings] = await Promise.all([
    getSocialBotIntegrations(session.user.id),
    getPlatformSettings()
  ]);

  return (
    <ChatbotConnect
      integrations={integrations}
      metaAppId={settings.socialBotConfig.metaAppId}
      metaConfigId={settings.socialBotConfig.metaConfigId}
    />
  );
}
