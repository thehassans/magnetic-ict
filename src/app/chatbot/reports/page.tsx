import { BarChart3, MessageCircle, TrendingUp, Users, Zap } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSocialBotThreads, getSocialBotIntegrations } from "@/lib/social-bot-db";

export const dynamic = "force-dynamic";

export default async function ChatbotReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/en/sign-in");
  const uid = session.user.id;

  const [threads, integrations] = await Promise.all([
    getSocialBotThreads(uid),
    getSocialBotIntegrations(uid)
  ]);

  const byChannel = ["WHATSAPP", "INSTAGRAM", "MESSENGER"].map((ch) => ({
    channel: ch,
    total: threads.filter((t) => t.source === ch).length,
    ai: threads.filter((t) => t.source === ch && t.mode === "AI").length,
    manual: threads.filter((t) => t.source === ch && t.mode === "MANUAL").length
  }));

  const totalUnread = threads.reduce((s, t) => s + (t.unreadCount ?? 0), 0);
  const aiRate = threads.length ? Math.round((threads.filter((t) => t.mode === "AI").length / threads.length) * 100) : 0;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Reports</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Analytics and performance across all channels.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Threads", value: threads.length, icon: MessageCircle, cls: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300" },
          { label: "Unread", value: totalUnread, icon: TrendingUp, cls: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" },
          { label: "AI Automation Rate", value: `${aiRate}%`, icon: Zap, cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" },
          { label: "Contacts", value: threads.length, icon: Users, cls: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300" }
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.cls}`}><Icon className="h-4 w-4" /></div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 p-5 dark:border-white/10">
          <BarChart3 className="h-4 w-4 text-violet-600" />
          <h2 className="font-semibold text-slate-950 dark:text-white">Conversations by Channel</h2>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {byChannel.map((row) => (
            <div key={row.channel} className="flex items-center gap-4 px-5 py-4">
              <div className="w-28 text-sm font-medium text-slate-700 dark:text-slate-300">{row.channel}</div>
              <div className="flex-1">
                <div className="flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  {threads.length > 0 && (
                    <div
                      className="bg-violet-500 transition-all"
                      style={{ width: `${Math.round((row.total / threads.length) * 100)}%` }}
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span><span className="font-semibold text-slate-800 dark:text-white">{row.total}</span> total</span>
                <span><span className="font-semibold text-emerald-600">{row.ai}</span> AI</span>
                <span><span className="font-semibold text-slate-600 dark:text-slate-300">{row.manual}</span> manual</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-200 p-5 dark:border-white/10">
          <Users className="h-4 w-4 text-violet-600" />
          <h2 className="font-semibold text-slate-950 dark:text-white">Channel Integration Status</h2>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {integrations.length === 0 ? (
            <p className="p-5 text-sm text-slate-400">No channels configured.</p>
          ) : integrations.map((i) => (
            <div key={i._id} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-slate-700 dark:text-slate-300">{i.label || i.channel}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${i.status === "CONNECTED" ? "bg-emerald-100 text-emerald-700" : i.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{i.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
