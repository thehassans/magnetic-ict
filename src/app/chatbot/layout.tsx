import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userHasMagneticSocialBotAccess, getSocialBotSubscriptionInfo, getWorkspaceContext } from "@/lib/social-bot-access";
import { ChatbotShell } from "@/components/chatbot/chatbot-shell";
import { getPlatformSettings } from "@/lib/platform-settings";

export default async function ChatbotLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://magnetic-ict.com").replace(/\/$/, "");

  if (!session?.user?.id) {
    redirect(`${appUrl}/en/customer/sign-in?callback=${encodeURIComponent(process.env.NEXT_PUBLIC_CHATBOT_URL ?? "https://chatbot.magnetic-ict.com/chatbot")}`);
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#070710]">
        <div className="max-w-md rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10">
            <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Access Required</h1>
          <p className="mb-6 text-sm text-gray-600 dark:text-white/40">
            You need access to the Magnetic Social Bot to use the chatbot platform. Please purchase the service or contact support.
          </p>
          <a
            href={`${appUrl}/en/dashboard`}
            className="inline-flex items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const [settings, subscription, workspace] = await Promise.all([
    getPlatformSettings(),
    getSocialBotSubscriptionInfo(session.user.id),
    getWorkspaceContext(session.user.id)
  ]);

  return (
    <ChatbotShell
      userName={session.user.name ?? session.user.email ?? "User"}
      userEmail={session.user.email ?? ""}
      logoLight={settings.brandingConfig.chatbotLogoLight || undefined}
      logoDark={settings.brandingConfig.chatbotLogoDark || undefined}
      subscription={subscription}
      restrictions={workspace.restrictions}
    >
      {children}
    </ChatbotShell>
  );
}
