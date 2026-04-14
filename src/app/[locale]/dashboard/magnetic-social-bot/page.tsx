import { Bot, Instagram, MessageCircle, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { MagneticSocialBotWorkspace } from "@/components/dashboard/magnetic-social-bot-workspace";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";

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

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-violet-100 bg-white/90 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
            <Sparkles className="h-4 w-4" />
            Magnetic Social Bot
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Instagram className="h-4 w-4" />
            Instagram
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Bot className="h-4 w-4" />
            Messenger
          </div>
        </div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Command Center</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
          Connect channels, upload knowledge, and manage AI or manual replies from one inbox.
        </p>
      </section>

      <MagneticSocialBotWorkspace />
    </main>
  );
}
