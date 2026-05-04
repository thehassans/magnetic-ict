import { Bot, Instagram, MessageCircle, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CustomerSocialBotWorkspace } from "@/components/dashboard/customer-social-bot-workspace";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { getPlatformSettings } from "@/lib/platform-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MagneticSocialBotDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    notFound();
  }

  const settings = await getPlatformSettings();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
            <Sparkles className="h-4 w-4" />
            Magnetic Social Bot
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Instagram className="h-4 w-4" />
            Instagram
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Bot className="h-4 w-4" />
            Messenger
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Social Bot workspace</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Connect channels through a guided Meta flow, upload knowledge, and manage AI or manual replies from one inbox.
        </p>
      </section>

      <CustomerSocialBotWorkspace
        metaAppId={settings.socialBotConfig.metaAppId}
        metaConfigId={settings.socialBotConfig.metaConfigId}
      />
    </div>
  );
}
