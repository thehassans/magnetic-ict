import { getWorkspaceContext } from "@/lib/social-bot-access";
import { BarChart3, Clock, MessageCircle, TrendingUp, Users, Zap } from "lucide-react";
import { auth } from "@/auth";
import { findMongoDocuments, getSocialBotIntegrations, getSocialBotThreads, socialBotCollections } from "@/lib/social-bot-db";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CH_COLOR: Record<string, string> = {
  WHATSAPP: "from-emerald-500 to-emerald-700",
  INSTAGRAM: "from-pink-500 to-rose-600",
  MESSENGER: "from-sky-500 to-blue-600"
};

export default async function ChatbotReportsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);
  const uid = workspace.ownerId;

  type PresenceRecord = {
    _id: string;
    userId: string;
    lastSeenAt: string;
    sessionStart: string;
    totalTimeMs: number;
    sessionTimeMs: number;
    status: string;
  };

  const [threads, integrations, presenceRecords] = await Promise.all([
    getSocialBotThreads(uid),
    getSocialBotIntegrations(uid),
    findMongoDocuments<PresenceRecord>(socialBotCollections.presence, {}, { sort: { lastSeenAt: -1 }, limit: 50 })
  ]);

  // Enrich presence with Prisma user names
  const userIds = [...new Set(presenceRecords.map((p) => p.userId))];
  const presenceUsers = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
    : [];
  const userMap = Object.fromEntries(presenceUsers.map((u) => [u.id, u]));

  function fmtDuration(ms: number) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  }

  function relativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return "Just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(iso).toLocaleDateString();
  }

  function isOnline(lastSeenAt: string) {
    return Date.now() - new Date(lastSeenAt).getTime() < 90_000; // 90 s threshold
  }

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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reports</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Analytics and performance across all channels</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${s.cls}`}>
              <div className="flex items-start justify-between">
                <p className="text-[13px] text-gray-600 dark:text-white/50">{s.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.icls}`}><Icon className="h-4 w-4" /></div>
              </div>
              <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/[0.06] px-5 py-4">
          <BarChart3 className="h-4 w-4 text-violet-500 dark:text-violet-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Conversations by Channel</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
          {byChannel.map((row) => {
            const pct = threads.length ? Math.round((row.total / threads.length) * 100) : 0;
            return (
              <div key={row.channel} className="px-5 py-5">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-white/70">{row.channel}</span>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-gray-500 dark:text-white/50"><span className="font-bold text-gray-900 dark:text-white">{row.total}</span> total</span>
                    <span className="text-emerald-600 dark:text-emerald-300"><span className="font-bold">{row.ai}</span> AI</span>
                    <span className="text-gray-400 dark:text-white/35"><span className="font-bold text-gray-500 dark:text-white/50">{row.manual}</span> manual</span>
                  </div>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${CH_COLOR[row.channel] ?? "from-violet-500 to-purple-600"} shadow-[0_0_8px_rgba(124,58,237,0.4)]`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-right text-[10px] text-gray-400 dark:text-white/25">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/[0.06] px-5 py-4">
          <Users className="h-4 w-4 text-violet-500 dark:text-violet-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Integration Status</h2>
        </div>
        {integrations.length === 0 ? (
          <p className="p-5 text-sm text-gray-400 dark:text-white/30">No channels configured.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {integrations.map((i) => (
              <div key={i._id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${i.status === "CONNECTED" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" : i.status === "PENDING" ? "bg-amber-400" : "bg-gray-300 dark:bg-white/20"}`} />
                  <span className="text-sm text-gray-600 dark:text-white/60">{i.label || i.channel}</span>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${i.status === "CONNECTED" ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : i.status === "PENDING" ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/30"}`}>{i.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Team Presence ──────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/[0.06] px-5 py-4">
          <Clock className="h-4 w-4 text-violet-500 dark:text-violet-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Team Presence</h2>
          <span className="ml-auto text-[11px] text-gray-400 dark:text-white/30">
            {presenceRecords.filter((p) => isOnline(p.lastSeenAt)).length} online now
          </span>
        </div>
        {presenceRecords.length === 0 ? (
          <p className="p-5 text-sm text-gray-400 dark:text-white/30">No presence data yet — it appears after users open the app.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {presenceRecords.map((p) => {
              const user = userMap[p.userId];
              const online = isOnline(p.lastSeenAt);
              return (
                <div key={p._id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/40 to-purple-600/30 text-[12px] font-bold text-violet-700 dark:text-violet-200">
                      {(user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()}
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white dark:border-[#070710] ${
                        online ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]" : "bg-gray-300 dark:bg-white/20"
                      }`} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-800 dark:text-white/80">
                        {user?.name ?? user?.email ?? p.userId.slice(0, 12)}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-white/30">
                        {online ? "Online now" : `Last seen ${relativeTime(p.lastSeenAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-white/30">Session</p>
                      <p className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">{fmtDuration(p.sessionTimeMs)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-white/30">Total</p>
                      <p className="text-[12px] font-semibold text-violet-600 dark:text-violet-400">{fmtDuration(p.totalTimeMs)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
