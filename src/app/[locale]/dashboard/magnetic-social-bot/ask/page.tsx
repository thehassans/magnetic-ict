import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { AIAssistantInterface } from "@/components/ui/ai-assistant-interface";
import { BrainCircuit } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Ask Magnetic — Your AI Knowledge Assistant",
  description: "Chat with your trained knowledge base. Get instant answers powered by your uploaded business documents.",
};

export default async function AskMagneticDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    notFound();
  }

  const userName = session.user.name ?? null;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_4px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
            <BrainCircuit className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">Ask Magnetic</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Trained on your knowledge base</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Knowledge base active
        </div>
      </div>

      {/* Chat interface */}
      <div className="flex min-h-0 flex-1 flex-col">
        <AIAssistantInterface userName={userName} />
      </div>
    </div>
  );
}
