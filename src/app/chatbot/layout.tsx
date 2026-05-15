import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { ChatbotShell } from "@/components/chatbot/chatbot-shell";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function ChatbotLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const reqHeaders = await headers();
  const chatbotHost = reqHeaders.get("x-chatbot-host") ?? reqHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() ?? "";
  const isChatbotSubdomain = chatbotHost.startsWith("chatbot.");
  const mainAppUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://magnetic-ict.com").replace(/\/$/, "");
  const chatbotBaseUrl = isChatbotSubdomain ? `https://${chatbotHost}` : mainAppUrl;

  if (!session?.user?.id) {
    redirect(`${mainAppUrl}/en/customer/sign-in?callback=${chatbotBaseUrl}/chatbot/inbox`);
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    redirect(`${mainAppUrl}/en/dashboard`);
  }

  const settings = await getPlatformSettings();

  return (
    <ChatbotShell
      userName={session.user.name ?? session.user.email ?? "User"}
      userEmail={session.user.email ?? ""}
      metaAppId={settings.socialBotConfig.metaAppId}
      metaConfigId={settings.socialBotConfig.metaConfigId}
      logoLight={settings.brandingConfig.chatbotLogoLight || undefined}
      logoDark={settings.brandingConfig.chatbotLogoDark || undefined}
    >
      {children}
    </ChatbotShell>
  );
}
