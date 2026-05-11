import { auth } from "@/auth";
import { ChatbotSettings } from "@/components/chatbot/chatbot-settings";
import { getPlatformSettings } from "@/lib/platform-settings";

export const dynamic = "force-dynamic";

export default async function ChatbotSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const settings = await getPlatformSettings();

  return (
    <ChatbotSettings
      userName={session.user.name ?? "User"}
      userEmail={session.user.email ?? ""}
      botName={settings.socialBotConfig.globalBotInstructions ? "Magnetic Assistant" : ""}
      webhookUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://magnetic-ict.com"}/api/social-bot/webhook`}
    />
  );
}
