import { BarChart3, Bot, FileText, MessageCircle, Users, Webhook, Zap } from "lucide-react";
import { auth } from "@/auth";
import {
  getSocialBotAgents,
  getSocialBotDocuments,
  getSocialBotIntegrations,
  getSocialBotThreads
} from "@/lib/social-bot-db";

export const dynamic = "force-dynamic";

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

  const connected = integrations.filter((i) => i.status === "CONNECTED").length;
  const aiThreads = threads.filter((t) => t.mode === "AI").length;
  const unread = threads.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0);
  const docsReady = documents.filter((d) => d.status === "READY").length;

  const stats = [
    { label: "Total Conversations", value: threads.length, icon: MessageCircle, color: "violet" },
    { label: "Unread Messages", value: unread, icon: MessageCircle, color: "rose" },
    { label: "AI-Handled Threads", value: aiThreads, icon: Zap, color: "emerald" },
    { label: "Connected Channels", value: connected, icon: Webhook, color: "blue" },
    { label: "Active Agents", value: agents.filter((a) => a.isActive).length, icon: Bot, color: "violet" },
    { label: "Knowledge Docs", value: docsReady, icon: FileText, color: "amber" }
  ];

  const colorMap: Record<string, string> = {
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Overview of your omnichannel workspace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colorMap[stat.color] ?? colorMap.violet}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-violet-600" />
            <h2 className="font-semibold text-slate-950 dark:text-white">Recent Conversations</h2>
          </div>
          {threads.slice(0, 5).length === 0 ? (
            <p className="text-sm text-slate-400">No conversations yet.</p>
          ) : (
            <div className="space-y-3">
              {threads.slice(0, 5).map((t) => (
                <div key={t._id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {t.contactName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{t.contactName}</p>
                    <p className="truncate text-xs text-slate-400">{t.lastMessagePreview}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.mode === "AI" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{t.mode}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-violet-600" />
            <h2 className="font-semibold text-slate-950 dark:text-white">Channel Status</h2>
          </div>
          {integrations.length === 0 ? (
            <p className="text-sm text-slate-400">No channels configured yet.</p>
          ) : (
            <div className="space-y-3">
              {integrations.map((i) => (
                <div key={i._id} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{i.channel}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${i.status === "CONNECTED" ? "bg-emerald-100 text-emerald-700" : i.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{i.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
