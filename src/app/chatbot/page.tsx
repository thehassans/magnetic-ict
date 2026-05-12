import { BarChart3, Bot, FileText, MessageCircle, TrendingUp, Users, Webhook, Zap } from "lucide-react";
import { auth } from "@/auth";
import {
  getSocialBotAgents,
  getSocialBotDocuments,
  getSocialBotIntegrations,
  getSocialBotThreads
} from "@/lib/social-bot-db";

export const dynamic = "force-dynamic";

const STAT_CFG = [
  { key: "conversations", label: "Total Conversations", icon: MessageCircle, from: "from-violet-500/20", to: "to-violet-900/10", border: "border-violet-500/20", icon_cls: "bg-violet-500/20 text-violet-300" },
  { key: "unread", label: "Unread Messages", icon: TrendingUp, from: "from-rose-500/20", to: "to-rose-900/10", border: "border-rose-500/20", icon_cls: "bg-rose-500/20 text-rose-300" },
  { key: "aiThreads", label: "AI-Handled Threads", icon: Zap, from: "from-emerald-500/20", to: "to-emerald-900/10", border: "border-emerald-500/20", icon_cls: "bg-emerald-500/20 text-emerald-300" },
  { key: "channels", label: "Connected Channels", icon: Webhook, from: "from-sky-500/20", to: "to-sky-900/10", border: "border-sky-500/20", icon_cls: "bg-sky-500/20 text-sky-300" },
  { key: "agents", label: "Active Agents", icon: Bot, from: "from-purple-500/20", to: "to-purple-900/10", border: "border-purple-500/20", icon_cls: "bg-purple-500/20 text-purple-300" },
  { key: "docs", label: "Knowledge Docs", icon: FileText, from: "from-amber-500/20", to: "to-amber-900/10", border: "border-amber-500/20", icon_cls: "bg-amber-500/20 text-amber-300" }
];

export default async function ChatbotDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const uid = session.user.id;

  const [threads, integrations, documents, agents] = await Promise.all([
    getSocialBotThreads(uid),
    getSocialBotIntegrations(uid),
    getSocialBotDocuments(uid),
    getSocialBotAgents(uid)
  ]);

  const values: Record<string, number> = {
    conversations: threads.length,
    unread: threads.reduce((s, t) => s + (t.unreadCount ?? 0), 0),
    aiThreads: threads.filter((t) => t.mode === "AI").length,
    channels: integrations.filter((i) => i.status === "CONNECTED").length,
    agents: agents.filter((a) => a.isActive).length,
    docs: documents.filter((d) => d.status === "READY").length
  };

  return (
    <div className="min-h-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Your omnichannel workspace overview</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span className="text-xs font-medium text-gray-500 dark:text-white/50">Live</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {STAT_CFG.map((cfg) => {
          const Icon = cfg.icon;
          return (
            <div key={cfg.key} className={`relative overflow-hidden rounded-2xl border ${cfg.border} bg-gradient-to-br ${cfg.from} ${cfg.to} p-5`}>
              <div className="flex items-start justify-between">
                <p className="text-[13px] text-gray-600 dark:text-white/50">{cfg.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.icon_cls}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">{values[cfg.key]}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-gray-300 dark:text-white/20" />
                <span className="text-[11px] text-gray-400 dark:text-white/25">All time</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Conversations</h2>
            </div>
            <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">{threads.length}</span>
          </div>
          {threads.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <MessageCircle className="h-8 w-8 text-gray-300 dark:text-white/10" />
              <p className="text-sm text-gray-400 dark:text-white/25">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {threads.slice(0, 5).map((t) => (
                <div key={t._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20 text-sm font-bold text-violet-200">
                    {t.contactName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{t.contactName}</p>
                    <p className="truncate text-xs text-gray-400 dark:text-white/30">{t.lastMessagePreview}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.mode === "AI" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-gray-100 dark:bg-white/[0.08] text-gray-500 dark:text-white/40"}`}>{t.mode}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]">
          <div className="flex items-center border-b border-gray-200 dark:border-white/[0.06] px-5 py-4">
            <BarChart3 className="mr-2 h-4 w-4 text-violet-500 dark:text-violet-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Channel Status</h2>
          </div>
          {integrations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <Webhook className="h-8 w-8 text-gray-300 dark:text-white/10" />
              <p className="text-sm text-gray-400 dark:text-white/25">No channels configured</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {integrations.map((i) => (
                <div key={i._id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${i.status === "CONNECTED" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" : i.status === "PENDING" ? "bg-amber-400" : "bg-white/20"}`} />
                    <span className="text-sm text-gray-600 dark:text-white/60">{i.channel}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${i.status === "CONNECTED" ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : i.status === "PENDING" ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/30"}`}>{i.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
