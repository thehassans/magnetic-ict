import Link from "next/link";
import { auth } from "@/auth";
import {
  getSocialBotAgents,
  getSocialBotDocuments,
  getSocialBotIntegrations,
  getSocialBotThreads
} from "@/lib/social-bot-db";
import { getSocialBotSubscriptionInfo, getWorkspaceContext } from "@/lib/social-bot-access";
import { WhatsAppIcon, InstagramIcon, MessengerIcon } from "@/components/chatbot/social-icons";
import {
  ArrowRight,
  Bot,
  FileText,
  MessageCircle,
  Plug,
  Users,
  Webhook,
  Zap
} from "lucide-react";

export const dynamic = "force-dynamic";

const CHANNEL_META: Record<string, { label: string; hexColor: string; bgCls: string; Icon: React.ElementType }> = {
  WHATSAPP: { label: "WhatsApp", hexColor: "#25D366", bgCls: "bg-[#25D366]/10", Icon: WhatsAppIcon },
  INSTAGRAM: { label: "Instagram", hexColor: "#E1306C", bgCls: "bg-[#E1306C]/10", Icon: InstagramIcon },
  MESSENGER: { label: "Messenger", hexColor: "#0099FF", bgCls: "bg-[#0099FF]/10", Icon: MessengerIcon }
};

export default async function ChatbotDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const workspace = await getWorkspaceContext(session.user.id);
  const uid = workspace.ownerId;

  const [threads, integrations, documents, agents, subscription] = await Promise.all([
    getSocialBotThreads(uid),
    getSocialBotIntegrations(uid),
    getSocialBotDocuments(uid),
    getSocialBotAgents(uid),
    getSocialBotSubscriptionInfo(uid)
  ]);

  const stats = [
    { label: "Conversations", value: threads.length, sub: "All time", accent: "text-violet-500 dark:text-violet-400", bg: "bg-violet-500/[0.07]", href: "/chatbot/inbox", icon: MessageCircle },
    { label: "Unread", value: threads.reduce((s, t) => s + (t.unreadCount ?? 0), 0), sub: "Awaiting reply", accent: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/[0.07]", href: "/chatbot/inbox", icon: Users },
    { label: "AI Threads", value: threads.filter((t) => t.mode === "AI").length, sub: "Handled by AI", accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/[0.07]", href: "/chatbot/inbox", icon: Zap },
    { label: "Channels", value: integrations.filter((i) => i.status === "CONNECTED").length, sub: "Connected", accent: "text-sky-500 dark:text-sky-400", bg: "bg-sky-500/[0.07]", href: "/chatbot/connect", icon: Webhook },
    { label: "Agents", value: agents.filter((a) => a.isActive).length, sub: "Active", accent: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/[0.07]", href: "/chatbot/agents", icon: Bot },
    { label: "Knowledge", value: documents.filter((d) => d.status === "READY").length, sub: "Docs ready", accent: "text-fuchsia-500 dark:text-fuchsia-400", bg: "bg-fuchsia-500/[0.07]", href: "/chatbot/knowledge", icon: FileText }
  ];

  const planGradient = subscription.planType === "MANUAL"
    ? "from-amber-500 to-orange-500"
    : subscription.planName.toLowerCase().includes("ent") ? "from-sky-500 to-blue-600"
    : subscription.planName.toLowerCase().includes("start") ? "from-emerald-500 to-teal-500"
    : "from-violet-500 to-purple-600";

  return (
    <div className="min-h-full bg-gray-50/40 dark:bg-transparent">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-white/[0.05] bg-white dark:bg-transparent px-7 pt-7 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-[1.4rem] font-bold tracking-tight text-gray-950 dark:text-white">Dashboard</h1>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">Live</span>
              </div>
            </div>
            <p className="text-[13px] text-gray-400 dark:text-white/30">Omnichannel workspace overview</p>
          </div>

          {/* Subscription badge */}
          {subscription.hasAccess && (
            <div className={`flex items-center gap-3 rounded-[14px] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] px-4 py-2.5`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${planGradient} shadow-sm`}>
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-900 dark:text-white">{subscription.planName}</p>
                <p className="text-[10px] text-gray-400 dark:text-white/30">
                  {subscription.planType === "MANUAL" ? "Admin access" : subscription.startDate ? `Active since ${new Date(subscription.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : "Subscription active"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-7 py-6 space-y-5">

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className="group relative overflow-hidden rounded-[20px] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] dark:hover:bg-white/[0.04] hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-white/25">{s.label}</p>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${s.accent}`} />
                  </div>
                </div>
                <p className={`text-[2.8rem] font-black leading-none tracking-tight ${s.accent}`}>{s.value}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[11px] text-gray-400 dark:text-white/25">{s.sub}</p>
                  <ArrowRight className="h-3 w-3 text-gray-300 dark:text-white/15 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Bottom panels ────────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Recent Conversations */}
          <div className="overflow-hidden rounded-[20px] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.05] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-white/25">Recent Conversations</p>
              <div className="flex items-center gap-2">
                {threads.length > 0 && (
                  <span className="rounded-full bg-violet-100 dark:bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300">{threads.length}</span>
                )}
                <Link href="/chatbot/inbox" className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 dark:text-white/25 hover:text-violet-600 dark:hover:text-violet-400 transition">
                  View all <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>
            {threads.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/[0.04]">
                  <MessageCircle className="h-5 w-5 text-gray-300 dark:text-white/15" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-gray-500 dark:text-white/30">No conversations yet</p>
                  <p className="mt-0.5 text-[11px] text-gray-400 dark:text-white/20">Connect a channel to start receiving messages</p>
                </div>
                <Link href="/chatbot/connect" className="mt-1 flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-[12px] font-semibold text-white transition hover:bg-violet-500">
                  <Plug className="h-3 w-3" /> Connect channel
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {threads.slice(0, 6).map((t) => (
                  <Link key={t._id} href="/chatbot/inbox" className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-50/80 dark:hover:bg-white/[0.02]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/20 dark:to-purple-500/10 text-[13px] font-bold text-violet-600 dark:text-violet-300">
                      {t.contactName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-gray-900 dark:text-white">{t.contactName}</p>
                      <p className="truncate text-[11px] text-gray-400 dark:text-white/30">{t.lastMessagePreview ?? "—"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        t.mode === "AI"
                          ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-white/35"
                      }`}>{t.mode}</span>
                      {(t.unreadCount ?? 0) > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">{t.unreadCount}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Channel Status */}
          <div className="overflow-hidden rounded-[20px] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.05] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-white/25">Channel Status</p>
              <Link href="/chatbot/connect" className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 dark:text-white/25 hover:text-violet-600 dark:hover:text-violet-400 transition">
                Manage <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
            {integrations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/[0.04]">
                  <Webhook className="h-5 w-5 text-gray-300 dark:text-white/15" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-medium text-gray-500 dark:text-white/30">No channels configured</p>
                  <p className="mt-0.5 text-[11px] text-gray-400 dark:text-white/20">Add WhatsApp, Instagram or Messenger</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {integrations.map((i) => {
                  const meta = CHANNEL_META[i.channel] ?? { label: i.channel, hexColor: "#6b7280", bgCls: "bg-gray-500/10", Icon: Webhook };
                  const ChannelIcon = meta.Icon;
                  return (
                    <div key={i._id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.bgCls}`}>
                          <ChannelIcon className="h-4 w-4" style={{ color: meta.hexColor }} />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-800 dark:text-white/80">{meta.label}</p>
                          {i.label && <p className="text-[10px] text-gray-400 dark:text-white/25 truncate max-w-[100px]">{i.label}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          i.status === "CONNECTED" ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.7)] animate-pulse"
                          : i.status === "PENDING" ? "bg-amber-400"
                          : "bg-gray-300 dark:bg-white/20"
                        }`} />
                        <span className={`text-[11px] font-semibold ${
                          i.status === "CONNECTED" ? "text-emerald-600 dark:text-emerald-400"
                          : i.status === "PENDING" ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-400 dark:text-white/25"
                        }`}>{i.status.charAt(0) + i.status.slice(1).toLowerCase()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
