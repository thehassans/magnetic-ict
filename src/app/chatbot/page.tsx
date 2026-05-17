import { auth } from "@/auth";
import {
  getSocialBotAgents,
  getSocialBotDocuments,
  getSocialBotIntegrations,
  getSocialBotThreads
} from "@/lib/social-bot-db";
import { Bot, FileText, MessageCircle, Users, Webhook, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

const CHANNEL_ICON: Record<string, string> = {
  WHATSAPP: "💬",
  INSTAGRAM: "📸",
  MESSENGER: "💙"
};

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

  const stats = [
    { label: "Conversations", value: threads.length, sub: "All time", accent: "text-violet-500 dark:text-violet-400", icon: MessageCircle },
    { label: "Unread", value: threads.reduce((s, t) => s + (t.unreadCount ?? 0), 0), sub: "Awaiting reply", accent: "text-rose-500 dark:text-rose-400", icon: Users },
    { label: "AI Threads", value: threads.filter((t) => t.mode === "AI").length, sub: "Handled by AI", accent: "text-emerald-600 dark:text-emerald-400", icon: Zap },
    { label: "Channels", value: integrations.filter((i) => i.status === "CONNECTED").length, sub: "Connected", accent: "text-sky-500 dark:text-sky-400", icon: Webhook },
    { label: "Agents", value: agents.filter((a) => a.isActive).length, sub: "Active", accent: "text-amber-500 dark:text-amber-400", icon: Bot },
    { label: "Knowledge", value: documents.filter((d) => d.status === "READY").length, sub: "Docs ready", accent: "text-fuchsia-500 dark:text-fuchsia-400", icon: FileText }
  ];

  return (
    <div className="min-h-full bg-gray-50/40 dark:bg-transparent">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-white/[0.05] bg-white dark:bg-transparent px-7 pt-7 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.5rem] font-bold tracking-tight text-gray-950 dark:text-white">Dashboard</h1>
            <p className="mt-0.5 text-[13px] text-gray-400 dark:text-white/30">Omnichannel workspace overview</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Live</span>
          </div>
        </div>
      </div>

      <div className="px-7 py-6 space-y-5">

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-[20px] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none transition hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-white/25">{s.label}</p>
                  <Icon className={`h-3.5 w-3.5 ${s.accent} opacity-60`} />
                </div>
                <p className={`text-[3rem] font-black leading-none tracking-tight ${s.accent}`}>{s.value}</p>
                <p className="mt-2.5 text-[11px] text-gray-400 dark:text-white/25">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Bottom panels ────────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Recent Conversations */}
          <div className="overflow-hidden rounded-[20px] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.05] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-white/25">Recent Conversations</p>
              {threads.length > 0 && (
                <span className="rounded-full bg-violet-100 dark:bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300">{threads.length}</span>
              )}
            </div>
            {threads.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 py-12">
                <MessageCircle className="h-7 w-7 text-gray-200 dark:text-white/[0.08]" />
                <p className="text-[12px] text-gray-400 dark:text-white/25">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {threads.slice(0, 5).map((t) => (
                  <div key={t._id} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-gray-50/70 dark:hover:bg-white/[0.02]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-white/[0.07] text-sm font-bold text-gray-600 dark:text-white/50">
                      {t.contactName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-gray-900 dark:text-white">{t.contactName}</p>
                      <p className="truncate text-[11px] text-gray-400 dark:text-white/30">{t.lastMessagePreview ?? "—"}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${
                      t.mode === "AI"
                        ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-white/35"
                    }`}>{t.mode}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Channel Status */}
          <div className="overflow-hidden rounded-[20px] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none">
            <div className="border-b border-gray-100 dark:border-white/[0.05] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-white/25">Channel Status</p>
            </div>
            {integrations.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 py-12">
                <Webhook className="h-7 w-7 text-gray-200 dark:text-white/[0.08]" />
                <p className="text-[12px] text-gray-400 dark:text-white/25">No channels configured</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
                {integrations.map((i) => (
                  <div key={i._id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-base leading-none">{CHANNEL_ICON[i.channel] ?? "📡"}</span>
                      <span className="text-[13px] font-medium text-gray-700 dark:text-white/60 capitalize">{i.channel.charAt(0) + i.channel.slice(1).toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        i.status === "CONNECTED"
                          ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.7)]"
                          : i.status === "PENDING"
                            ? "bg-amber-400"
                            : "bg-gray-300 dark:bg-white/20"
                      }`} />
                      <span className={`text-[11px] font-semibold ${
                        i.status === "CONNECTED"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : i.status === "PENDING"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-400 dark:text-white/25"
                      }`}>{i.status.charAt(0) + i.status.slice(1).toLowerCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
