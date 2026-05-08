import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { AIAssistantInterface } from "@/components/ui/ai-assistant-interface";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Ask Magnetic — AI Knowledge Assistant",
  description: "Chat with your trained knowledge base. Instant answers from your uploaded business documents.",
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
    <div
      className="relative flex flex-col overflow-hidden rounded-[30px] border border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.03]"
      style={{ height: "calc(100vh - 9rem)" }}
    >
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
        <div className="absolute left-[20%] top-[-10%] h-[40%] w-[40%] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.09),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_65%)]" />
        <div className="absolute right-[10%] top-[30%] h-[35%] w-[35%] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.07),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(168,85,247,0.14),transparent_65%)]" />
      </div>

      {/* Chat fills the card */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <AIAssistantInterface userName={userName} />
      </div>
    </div>
  );
}
