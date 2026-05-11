import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { ChatbotShell } from "@/components/chatbot/chatbot-shell";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function ChatbotLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/en/sign-in?callbackUrl=/chatbot");
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    redirect("/en/dashboard");
  }

  const settings = await getPlatformSettings();

  return (
    <ChatbotShell
      userName={session.user.name ?? session.user.email ?? "User"}
      userEmail={session.user.email ?? ""}
      metaAppId={settings.socialBotConfig.metaAppId}
      metaConfigId={settings.socialBotConfig.metaConfigId}
    >
      {children}
    </ChatbotShell>
  );
}
