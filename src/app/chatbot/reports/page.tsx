import { BarChart3, MessageCircle, TrendingUp, Users, Zap } from "lucide-react";
import { auth } from "@/auth";
import { getSocialBotThreads, getSocialBotIntegrations } from "@/lib/social-bot-db";

export const dynamic = "force-dynamic";

const CH_COLOR: Record<string, string> = {
  WHATSAPP: "from-emerald-500 to-emerald-700",
  INSTAGRAM: "from-pink-500 to-rose-600",
  MESSENGER: "from-sky-500 to-blue-600"
};

export default async function ChatbotReportsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
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

  const stats = [
    { label: "Total Threads", value: threads.length, icon: MessageCircle, cls: "from-violet-500/20 to-violet-900/10 border-violet-500/20", icls: "bg-violet-500/20 text-violet-300" },
    { label: "Unread Messages", value: totalUnread, icon: TrendingUp, cls: "from-rose-500/20 to-rose-900/10 border-rose-500/20", icls: "bg-rose-500/20 text-rose-300" },
    { label: "AI Automation Rate", value: `${aiRate}%`, icon: Zap, cls: "from-emerald-500/20 to-emerald-900/10 border-emerald-500/20", icls: "bg-emerald-500/20 text-emerald-300" },
    { label: "Unique Contacts", value: threads.length, icon: Users, cls: "from-sky-500/20 to-sky-900/10 border-sky-500/20", icls: "bg-sky-500/20 text-sky-300" }
  ];

  return (
    <div className="min-h-full space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reports</h1>
        <p className="mt-0.5 text-sm text-white/40">Analytics and performance across all channels</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${s.cls}`}>
              <div className="flex items-start justify-between">
                <p className="text-[13px] text-white/50">{s.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.icls}`}><Icon className="h-4 w-4" /></div>
              </div>
              <p className="mt-4 text-4xl font-bold text-white">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
          <BarChart3 className="h-4 w-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white">Conversations by Channel</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {byChannel.map((row) => {
            const pct = threads.length ? Math.round((row.total / threads.length) * 100) : 0;
            return (
              <div key={row.channel} className="px-5 py-5">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-white/70">{row.channel}</span>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-white/50"><span className="font-bold text-white">{row.total}</span> total</span>
                    <span className="text-emerald-300"><span className="font-bold">{row.ai}</span> AI</span>
                    <span className="text-white/35"><span className="font-bold text-white/50">{row.manual}</span> manual</span>
                  </div>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${CH_COLOR[row.channel] ?? "from-violet-500 to-purple-600"} shadow-[0_0_8px_rgba(124,58,237,0.4)]`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-right text-[10px] text-white/25">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
          <Users className="h-4 w-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white">Integration Status</h2>
        </div>
        {integrations.length === 0 ? (
          <p className="p-5 text-sm text-white/30">No channels configured.</p>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {integrations.map((i) => (
              <div key={i._id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${i.status === "CONNECTED" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" : i.status === "PENDING" ? "bg-amber-400" : "bg-white/20"}`} />
                  <span className="text-sm text-white/60">{i.label || i.channel}</span>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${i.status === "CONNECTED" ? "bg-emerald-500/15 text-emerald-300" : i.status === "PENDING" ? "bg-amber-500/15 text-amber-300" : "bg-white/[0.06] text-white/30"}`}>{i.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
