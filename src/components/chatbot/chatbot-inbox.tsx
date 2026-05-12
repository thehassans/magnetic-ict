"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, FileText, Loader2, RefreshCw, Search, Send, UserCheck, Users, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotAgent, SocialBotMessage, SocialBotThread } from "@/lib/social-bot-types";

type ThreadPayload = { thread: SocialBotThread | null; messages: SocialBotMessage[] };
type Filter = "ALL" | "AI" | "MANUAL" | "UNASSIGNED";

/* ─── Platform brand SVGs ─────────────────────────────────────────── */
function WhatsAppIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function MessengerIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.131 3.26L19.752 8.1l-6.561 6.863z" />
    </svg>
  );
}

const platformConfig = {
  WHATSAPP: { Icon: WhatsAppIcon, color: "#25D366", bg: "bg-[#25D366]/15", text: "text-[#25D366]", label: "WhatsApp" },
  INSTAGRAM: { Icon: InstagramIcon, color: "#E1306C", bg: "bg-[#E1306C]/15", text: "text-[#E1306C]", label: "Instagram" },
  MESSENGER: { Icon: MessengerIcon, color: "#0099FF", bg: "bg-[#0099FF]/15", text: "text-[#0099FF]", label: "Messenger" }
} as const;

function PlatformBadge({ source, size = "sm" }: { source: keyof typeof platformConfig; size?: "sm" | "xs" }) {
  const { Icon, bg, text, label } = platformConfig[source];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md font-semibold", bg, text,
      size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-1 py-0.5 text-[9px]")}>
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-2 w-2"} />
      {size === "sm" && label}
    </span>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 24) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffH < 48) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/* ─── Agent panel ─────────────────────────────────────────────────── */
function AgentPanel({
  agents,
  thread,
  onAssign,
  onAutoAssign,
  assigning
}: {
  agents: SocialBotAgent[];
  thread: SocialBotThread;
  onAssign: (agentId: string | null) => void;
  onAutoAssign: () => void;
  assigning: boolean;
}) {
  const [open, setOpen] = useState(false);
  const assigned = agents.find((a) => a._id === thread.assignedAgentId);

  return (
    <div className="w-[230px] shrink-0 border-l border-white/[0.06] bg-[#0a0a1c] flex flex-col">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">Assignment</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Assigned agent card */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3.5">
          {assigned ? (
            <div className="flex items-start gap-2.5">
              {assigned.avatarDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assigned.avatarDataUrl} alt={assigned.name} className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-purple-600/20 text-xs font-bold text-violet-300">
                  {assigned.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white/90">{assigned.name}</p>
                {assigned.description && <p className="mt-0.5 truncate text-[11px] text-white/35">{assigned.description}</p>}
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.7)]" />
                  <span className="text-[10px] text-emerald-400/70">Active</span>
                </div>
                {assigned.documentIds.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-white/25">
                    <FileText className="h-2.5 w-2.5" />
                    {assigned.documentIds.length} doc{assigned.documentIds.length !== 1 ? "s" : ""} trained
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-white/[0.1]">
                <UserCheck className="h-4 w-4 text-white/20" />
              </div>
              <p className="text-center text-[11px] text-white/25">No agent assigned</p>
            </div>
          )}
        </div>

        {/* Agent selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-[13px] text-white/60 transition hover:border-violet-500/30 hover:text-white/80"
          >
            <span className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-violet-400/60" />
              {assigned ? assigned.name : "Assign agent…"}
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform text-white/30", open && "rotate-180")} />
          </button>
          {open && (
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-xl border border-white/[0.09] bg-[#0f0f24] shadow-2xl">
              <button
                type="button"
                onClick={() => { onAssign(null); setOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] text-white/40 transition hover:bg-white/[0.04] hover:text-white/70"
              >
                <X className="h-3.5 w-3.5" />Unassign
              </button>
              {agents.filter((a) => a.isActive).map((a) => (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => { onAssign(a._id); setOpen(false); }}
                  className={cn("flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] transition hover:bg-violet-500/10",
                    a._id === thread.assignedAgentId ? "bg-violet-500/10 text-violet-300" : "text-white/70 hover:text-white")}
                >
                  {a.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.avatarDataUrl} alt={a.name} className="h-6 w-6 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/20 text-[10px] font-bold text-violet-300">
                      {a.name.charAt(0)}
                    </div>
                  )}
                  <span className="flex-1 truncate">{a.name}</span>
                  {a._id === thread.assignedAgentId && <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                </button>
              ))}
              {agents.filter((a) => a.isActive).length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-white/25">No active agents</p>
              )}
            </div>
          )}
        </div>

        {/* Auto-assign toggle */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
          <div>
            <p className="text-[12px] font-semibold text-white/70">Auto-assign</p>
            <p className="mt-0.5 text-[10px] text-white/30">Match best agent by channel</p>
          </div>
          <button
            type="button"
            onClick={onAutoAssign}
            disabled={assigning}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50",
              thread.autoAssign ? "bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.4)]" : "bg-white/10"
            )}
          >
            {assigning ? (
              <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-white" />
            ) : (
              <span className={cn("mt-0.5 inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                thread.autoAssign ? "translate-x-4" : "translate-x-0.5")} />
            )}
          </button>
        </div>

        {/* Platform info */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Channel</p>
          <PlatformBadge source={thread.source} size="sm" />
          <p className="text-[11px] text-white/30">{thread.contactHandle}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export function ChatbotInbox({ initialThreads, initialAgents }: { initialThreads: SocialBotThread[]; initialAgents: SocialBotAgent[] }) {
  const [threads, setThreads] = useState(initialThreads);
  const [agents] = useState(initialAgents);
  const [selectedId, setSelectedId] = useState<string | null>(initialThreads[0]?._id ?? null);
  const [payload, setPayload] = useState<ThreadPayload | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadThread = useCallback(async (id: string) => {
    const r = await fetch(`/api/social-bot/threads/${id}`, { cache: "no-store" });
    if (!r.ok) return;
    const data = await r.json() as ThreadPayload;
    setPayload(data);
    if (data.thread) {
      setThreads((prev) => prev.map((t) => t._id === id ? { ...t, ...data.thread! } : t));
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void loadThread(selectedId);
    const t = window.setInterval(() => void loadThread(selectedId), 5000);
    return () => window.clearInterval(t);
  }, [selectedId, loadThread]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [payload?.messages]);

  async function refreshThreads() {
    const r = await fetch("/api/social-bot/workspace", { cache: "no-store" });
    if (r.ok) {
      const ws = await r.json() as { threads?: SocialBotThread[] };
      setThreads(ws.threads ?? []);
    }
  }

  async function send() {
    if (!selectedId || !text.trim()) return;
    setSending(true);
    const r = await fetch("/api/social-bot/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: selectedId, text })
    });
    if (r.ok) {
      setPayload(await r.json() as ThreadPayload);
      setText("");
      textareaRef.current?.focus();
    }
    setSending(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  }

  async function patchThread(body: Record<string, unknown>) {
    if (!selectedId) return;
    const r = await fetch(`/api/social-bot/threads/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (r.ok) {
      const { thread } = await r.json() as { ok: boolean; thread: SocialBotThread };
      setPayload((p) => p ? { ...p, thread } : null);
      setThreads((prev) => prev.map((t) => t._id === selectedId ? { ...t, ...thread } : t));
    }
  }

  async function assignAgent(agentId: string | null) {
    setAssigning(true);
    await patchThread({ assignedAgentId: agentId });
    setAssigning(false);
  }

  async function triggerAutoAssign() {
    setAssigning(true);
    await patchThread({ autoAssign: true });
    setAssigning(false);
  }

  const filtered = threads
    .filter((t) => {
      if (filter === "AI") return t.mode === "AI";
      if (filter === "MANUAL") return t.mode === "MANUAL";
      if (filter === "UNASSIGNED") return !t.assignedAgentId;
      return true;
    })
    .filter((t) => !search || t.contactName.toLowerCase().includes(search.toLowerCase()) || t.contactHandle.toLowerCase().includes(search.toLowerCase()));

  const selected = payload?.thread ?? null;
  const unassignedCount = threads.filter((t) => !t.assignedAgentId).length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Thread sidebar ── */}
      <div className="flex w-[280px] shrink-0 flex-col border-r border-white/[0.06]" style={{ background: "linear-gradient(180deg,#0d0d20 0%,#0a0a1a 100%)" }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
          <div>
            <h2 className="text-sm font-bold text-white">Inbox</h2>
            {unassignedCount > 0 && (
              <p className="mt-0.5 text-[10px] text-amber-400/70">{unassignedCount} unassigned</p>
            )}
          </div>
          <button type="button" onClick={() => void refreshThreads()}
            className="rounded-lg p-1.5 text-white/25 transition hover:bg-white/[0.06] hover:text-white/60">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-white/[0.06] px-3 py-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-white/20" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…"
              className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/20" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-white/[0.06] px-3 py-2">
          {(["ALL", "AI", "MANUAL", "UNASSIGNED"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={cn("flex-1 rounded-lg py-1.5 text-[10px] font-semibold transition", filter === f
                ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]"
                : "text-white/25 hover:bg-white/[0.05] hover:text-white/60")}>
              {f === "UNASSIGNED" ? "Open" : f}
            </button>
          ))}
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-white/[0.08]">
                <Bot className="h-5 w-5 text-white/10" />
              </div>
              <p className="text-xs text-white/20">No conversations</p>
            </div>
          ) : filtered.map((t) => {
            const isActive = selectedId === t._id;
            const { Icon, color } = platformConfig[t.source];
            return (
              <button key={t._id} type="button" onClick={() => setSelectedId(t._id)}
                className={cn("relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition-all",
                  isActive ? "bg-violet-500/[0.12]" : "hover:bg-white/[0.025]")}>
                {isActive && <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-violet-500" />}
                {/* Avatar */}
                <div className="relative mt-0.5 shrink-0">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold",
                    isActive ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]" : "bg-white/[0.06] text-white/50")}>
                    {t.contactName.charAt(0).toUpperCase()}
                  </div>
                  {/* Platform icon badge */}
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-[#0d0d20] bg-[#0d0d20]">
                    <Icon className="h-2.5 w-2.5" style={{ color }} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn("truncate text-[13px] font-semibold", isActive ? "text-white" : "text-white/80")}>{t.contactName}</p>
                    <span className="shrink-0 text-[10px] text-white/20">{formatTime(t.lastMessageAt)}</span>
                  </div>
                  {/* Agent badge if assigned */}
                  {t.assignedAgentName && (
                    <div className="mt-0.5 flex items-center gap-1">
                      <UserCheck className="h-2.5 w-2.5 shrink-0 text-violet-400/60" />
                      <span className="truncate text-[10px] text-violet-400/70">{t.assignedAgentName}</span>
                    </div>
                  )}
                  <p className="mt-0.5 truncate text-[11px] text-white/30">{t.lastMessagePreview}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-semibold",
                      t.mode === "AI" ? "bg-violet-500/15 text-violet-300" : "bg-white/[0.07] text-white/35")}>
                      {t.mode}
                    </span>
                    {t.unreadCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white shadow-[0_0_6px_rgba(124,58,237,0.5)]">{t.unreadCount}</span>
                    )}
                    {!t.assignedAgentId && (
                      <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400/80">Open</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat area ── */}
      {selected ? (
        <>
          <div className="flex min-w-0 flex-1 flex-col" style={{ background: "linear-gradient(180deg,#07070f 0%,#060610 100%)" }}>
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5" style={{ background: "#0c0c1e" }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/40 to-purple-600/30 text-sm font-bold text-violet-200">
                    {selected.contactName.charAt(0)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0c0c1e]" style={{ background: platformConfig[selected.source].color }}>
                    {(() => { const { Icon } = platformConfig[selected.source]; return <Icon className="h-2 w-2 text-white" />; })()}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">{selected.contactName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-white/30">{selected.contactHandle}</p>
                    <PlatformBadge source={selected.source} size="xs" />
                    {selected.assignedAgentName && (
                      <span className="flex items-center gap-1 text-[10px] text-violet-400/70">
                        <UserCheck className="h-2.5 w-2.5" />
                        {selected.assignedAgentName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Mode toggles */}
              <div className="flex gap-1.5">
                {(["AI", "MANUAL"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => void patchThread({ mode: m })}
                    className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                      selected.mode === m
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_14px_rgba(124,58,237,0.45)]"
                        : "border border-white/[0.08] text-white/35 hover:border-violet-500/30 hover:text-white/70")}>
                    {m === "AI" ? <Zap className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 px-5 py-5">
              {(payload?.messages ?? []).map((msg, i) => {
                const out = msg.direction === "OUTBOUND";
                const prevMsg = i > 0 ? payload?.messages[i - 1] : null;
                const showSender = !prevMsg || prevMsg.direction !== msg.direction;
                return (
                  <div key={msg._id} className={cn("flex gap-2.5", out ? "justify-end" : "justify-start")}>
                    {!out && showSender && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-[11px] font-bold text-white/50">
                        {selected.contactName.charAt(0)}
                      </div>
                    )}
                    {!out && !showSender && <div className="w-7 shrink-0" />}
                    <div className="flex max-w-[65%] flex-col gap-0.5">
                      {out && showSender && selected.assignedAgentName && (
                        <p className="text-right text-[10px] text-violet-400/60">{selected.assignedAgentName}</p>
                      )}
                      <div className={cn("rounded-2xl px-4 py-2.5 text-[13px] leading-[1.7]",
                        out
                          ? "rounded-tr-sm bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-[0_4px_24px_rgba(124,58,237,0.3)]"
                          : "rounded-tl-sm border border-white/[0.07] bg-white/[0.05] text-white/80")}>
                        {msg.text}
                      </div>
                      <p className={cn("text-[10px] text-white/20", out ? "text-right" : "text-left")}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.06] p-4" style={{ background: "#0c0c1e" }}>
              {selected.assignedAgentName && (
                <div className="mb-2.5 flex items-center gap-1.5">
                  <UserCheck className="h-3 w-3 text-violet-400/60" />
                  <span className="text-[11px] text-violet-400/60">Replying as <strong className="font-semibold text-violet-300/80">{selected.assignedAgentName}</strong></span>
                </div>
              )}
              <div className="flex gap-3">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKey}
                  rows={2}
                  placeholder={selected.mode === "AI" ? "AI is handling this conversation…" : "Type a reply… (Enter to send)"}
                  className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-[13px] text-white outline-none placeholder:text-white/20 focus:border-violet-500/50 focus:bg-white/[0.06] transition"
                />
                <button type="button" onClick={() => void send()} disabled={sending || !text.trim()}
                  className="flex items-center gap-2 self-end rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-40">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* ── Agent panel ── */}
          <AgentPanel
            agents={agents}
            thread={selected}
            onAssign={(id) => void assignAgent(id)}
            onAutoAssign={() => void triggerAutoAssign()}
            assigning={assigning}
          />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center" style={{ background: "#07070f" }}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
              <Bot className="h-7 w-7 text-white/10" />
            </div>
            <p className="text-sm font-medium text-white/20">Select a conversation</p>
            <p className="mt-1 text-xs text-white/10">to view messages and assign agents</p>
          </div>
        </div>
      )}
    </div>
  );
}
