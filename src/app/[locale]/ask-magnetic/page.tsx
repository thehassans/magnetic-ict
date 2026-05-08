import { auth } from "@/auth";
import { AIAssistantInterface } from "@/components/ui/ai-assistant-interface";
import { BrainCircuit, Sparkles } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Magnetic ICT — AI Knowledge Assistant",
  description: "Chat with Magnetic ICT's AI assistant. Get instant answers about our services, products, and solutions powered by our knowledge base.",
};

export const dynamic = "force-dynamic";

export default async function AskMagneticPage() {
  const session = await auth();
  const userName = session?.user?.name ?? null;

  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-col bg-white dark:bg-[#06080f]">
      {/* Subtle background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-0 h-[50vh] w-[50vh] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.07),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_60%)]" />
        <div className="absolute right-[10%] top-[30%] h-[40vh] w-[40vh] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.05),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(168,85,247,0.1),transparent_60%)]" />
      </div>

      {/* Page header */}
      <div className="relative border-b border-slate-200/60 px-4 py-4 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
              <BrainCircuit className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ask Magnetic ICT</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Knowledge base assistant</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </div>
        </div>
      </div>

      {/* Chat interface fills remaining height */}
      <div className="relative flex-1">
        <AIAssistantInterface userName={userName} />
      </div>
    </main>
  );
}
