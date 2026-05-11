import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { ChatbotShell } from "@/components/chatbot/chatbot-shell";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function ChatbotLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://magnetic-ict.com").replace(/\/$/, "");

  if (!session?.user?.id) {
    redirect(`${appUrl}/en/customer/sign-in?callback=https://chatbot.magnetic-ict.com`);
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    redirect(`${appUrl}/en/dashboard`);
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
