"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Check, CheckCheck, ChevronDown, Clock, Loader2, RefreshCw, Search, Send, Sparkles, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotMessage, SocialBotThread } from "@/lib/social-bot-types";

/* ─── Platform brand config ─────────────────────────────────────────────── */
const PLATFORM = {
  WHATSAPP: {
    label: "WhatsApp",
    color: "#25D366",
    bg: "bg-[#25D366]",
    ring: "ring-[#25D366]/30",
    glow: "shadow-[0_0_16px_rgba(37,211,102,0.35)]",
    icon: function WhatsAppIcon({ className }: { className?: string }) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    }
  },
  INSTAGRAM: {
    label: "Instagram",
    color: "#E1306C",
    bg: "bg-gradient-to-br from-[#F58529] via-[#E1306C] to-[#833AB4]",
    ring: "ring-[#E1306C]/30",
    glow: "shadow-[0_0_16px_rgba(225,48,108,0.35)]",
    icon: function InstagramIcon({ className }: { className?: string }) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    }
  },
  MESSENGER: {
    label: "Messenger",
    color: "#0084FF",
    bg: "bg-[#0084FF]",
    ring: "ring-[#0084FF]/30",
    glow: "shadow-[0_0_16px_rgba(0,132,255,0.35)]",
    icon: function MessengerIcon({ className }: { className?: string }) {
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.131 3.26L19.752 8.1l-6.561 6.863z" />
        </svg>
      );
    }
  }
} as const;

type PlatformKey = keyof typeof PLATFORM;
type ThreadPayload = { thread: SocialBotThread | null; messages: SocialBotMessage[] };

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatFullTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function PlatformBadge({ source }: { source: PlatformKey }) {
  const p = PLATFORM[source];
  const Icon = p.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white", p.bg)}>
      <Icon className="h-2.5 w-2.5" />
      {p.label}
    </span>
  );
}

function PlatformAvatar({ source, initial, size = "md" }: { source: PlatformKey; initial: string; size?: "sm" | "md" | "lg" }) {
  const p = PLATFORM[source];
  const Icon = p.icon;
  const sizes = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-11 w-11 text-base" };
  const iconSizes = { sm: "h-3 w-3", md: "h-3.5 w-3.5", lg: "h-4 w-4" };
  const badgeSizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  return (
    <div className="relative shrink-0">
      <div className={cn("flex items-center justify-center rounded-full bg-white/[0.1] font-bold text-white ring-1 ring-white/10", sizes[size])}>
        {initial}
      </div>
      <div className={cn("absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full text-white", badgeSizes[size], p.bg)}>
        <Icon className={iconSizes[size]} />
      </div>
    </div>
  );
}

function DeliveryIcon({ status }: { status: SocialBotMessage["deliveryStatus"] }) {
  if (status === "PENDING") return <Clock className="h-3 w-3 text-white/30" />;
  if (status === "FAILED") return <span className="text-[9px] font-bold text-red-400">!</span>;
  if (status === "SENT") return <Check className="h-3 w-3 text-white/50" />;
  return <CheckCheck className="h-3 w-3 text-violet-300" />;
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export function ChatbotInbox({ initialThreads }: { initialThreads: SocialBotThread[] }) {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedId, setSelectedId] = useState<string | null>(initialThreads[0]?._id ?? null);
  const [payload, setPayload] = useState<ThreadPayload | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [modeFilter, setModeFilter] = useState<"ALL" | "AI" | "MANUAL">("ALL");
  const [platformFilter, setPlatformFilter] = useState<PlatformKey | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadThread = useCallback(async (id: string) => {
    const r = await fetch(`/api/social-bot/threads/${id}`, { cache: "no-store" });
    if (r.ok) setPayload(await r.json() as ThreadPayload);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void loadThread(selectedId);
    const t = window.setInterval(() => void loadThread(selectedId), 5000);
    return () => window.clearInterval(t);
  }, [selectedId, loadThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [payload?.messages]);

  async function refreshThreads() {
    setRefreshing(true);
    const r = await fetch("/api/social-bot/workspace", { cache: "no-store" });
    if (r.ok) {
      const ws = await r.json() as { threads?: SocialBotThread[] };
      setThreads(ws.threads ?? []);
    }
    setRefreshing(false);
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
    }
    setSending(false);
  }

  async function toggleMode(mode: "AI" | "MANUAL") {
    if (!selectedId) return;
    await fetch(`/api/social-bot/threads/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    });
    await loadThread(selectedId);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const filtered = threads.filter((t) => {
    if (modeFilter !== "ALL" && t.mode !== modeFilter) return false;
    if (platformFilter !== "ALL" && t.source !== platformFilter) return false;
    if (search && !t.contactName.toLowerCase().includes(search.toLowerCase()) && !t.contactHandle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = payload?.thread ?? null;
  const totalUnread = threads.reduce((s, t) => s + t.unreadCount, 0);

  const platformCounts: Record<PlatformKey, number> = {
    WHATSAPP: threads.filter((t) => t.source === "WHATSAPP").length,
    INSTAGRAM: threads.filter((t) => t.source === "INSTAGRAM").length,
    MESSENGER: threads.filter((t) => t.source === "MESSENGER").length
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Thread list sidebar ────────────────────────────────────────── */}
      <div className="flex w-[300px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a1a]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
              <Zap className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <h2 className="text-[13px] font-bold text-white">Inbox</h2>
            {totalUnread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(124,58,237,0.5)]">
                {totalUnread}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => void refreshThreads()}
            disabled={refreshing}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white/70 disabled:opacity-40"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 focus-within:border-violet-500/40 focus-within:bg-white/[0.05] transition">
            <Search className="h-3.5 w-3.5 shrink-0 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-white/25"
            />
          </div>
        </div>

        {/* Platform filter */}
        <div className="flex gap-1.5 px-3 pb-2">
          <button
            type="button"
            onClick={() => setPlatformFilter("ALL")}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wide transition",
              platformFilter === "ALL"
                ? "bg-white/[0.08] text-white"
                : "text-white/25 hover:bg-white/[0.04] hover:text-white/50"
            )}
          >
            All ({threads.length})
          </button>
          {(Object.keys(PLATFORM) as PlatformKey[]).filter((k) => platformCounts[k] > 0).map((key) => {
            const p = PLATFORM[key];
            const Icon = p.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPlatformFilter(platformFilter === key ? "ALL" : key)}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition",
                  platformFilter === key
                    ? cn("text-white", p.bg)
                    : "text-white/25 hover:bg-white/[0.04] hover:text-white/50"
                )}
              >
                <Icon className="h-3 w-3" />
                {platformCounts[key]}
              </button>
            );
          })}
        </div>

        {/* Mode filter */}
        <div className="flex gap-1 border-b border-white/[0.05] px-3 pb-3">
          {(["ALL", "AI", "MANUAL"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setModeFilter(f)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wide transition",
                modeFilter === f
                  ? "bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30"
                  : "text-white/25 hover:bg-white/[0.04] hover:text-white/50"
              )}
            >
              {f === "AI" && <Sparkles className="h-3 w-3" />}
              {f === "MANUAL" && <User className="h-3 w-3" />}
              {f}
            </button>
          ))}
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                <Bot className="h-5 w-5 text-white/15" />
              </div>
              <p className="text-[12px] text-white/25">No conversations found</p>
            </div>
          ) : (
            filtered.map((t) => {
              const isActive = selectedId === t._id;
              const p = PLATFORM[t.source as PlatformKey] ?? PLATFORM.MESSENGER;
              const initial = t.contactName.charAt(0).toUpperCase();
              return (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => setSelectedId(t._id)}
                  className={cn(
                    "group relative flex w-full items-start gap-3 px-3 py-3.5 text-left transition-all",
                    isActive
                      ? "bg-gradient-to-r from-violet-500/[0.12] to-transparent"
                      : "hover:bg-white/[0.025]"
                  )}
                >
                  {isActive && <span className="absolute left-0 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-400" />}

                  <PlatformAvatar source={t.source as PlatformKey} initial={initial} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={cn("truncate text-[13px] font-semibold", isActive ? "text-white" : "text-white/75 group-hover:text-white/90")}>
                        {t.contactName}
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {t.unreadCount > 0 && (
                          <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(124,58,237,0.45)]">
                            {t.unreadCount}
                          </span>
                        )}
                        <span className="text-[10px] text-white/25">{formatTime(t.lastMessageAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <PlatformBadge source={t.source as PlatformKey} />
                      <p className="truncate text-[11px] text-white/30">{t.lastMessagePreview}</p>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                        t.mode === "AI"
                          ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20"
                          : "bg-amber-500/10 text-amber-300/80 ring-1 ring-amber-400/20"
                      )}>
                        {t.mode === "AI" ? <Sparkles className="h-2 w-2" /> : <User className="h-2 w-2" />}
                        {t.mode === "AI" ? "AI" : "Manual"}
                      </span>
                      <span className="text-[10px] text-white/20">{t.contactHandle}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Message panel ─────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#070710]">
        {selected ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a1a] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <PlatformAvatar source={selected.source as PlatformKey} initial={selected.contactName.charAt(0).toUpperCase()} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-bold text-white">{selected.contactName}</p>
                    <PlatformBadge source={selected.source as PlatformKey} />
                  </div>
                  <p className="text-[11px] text-white/35">{selected.contactHandle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode toggle */}
                <div className="flex items-center rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 gap-0.5">
                  {(["AI", "MANUAL"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => void toggleMode(m)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition",
                        selected.mode === m
                          ? m === "AI"
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                            : "bg-amber-500/80 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                          : "text-white/30 hover:text-white/60"
                      )}
                    >
                      {m === "AI" ? <Sparkles className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {m === "AI" ? "AI Mode" : "Manual"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-1 px-5 py-5">
              {(payload?.messages ?? []).map((msg, idx) => {
                const out = msg.direction === "OUTBOUND";
                const isAI = msg.role === "ASSISTANT";
                const prevMsg = payload?.messages?.[idx - 1];
                const showDateSep = !prevMsg || new Date(msg.timestamp).toDateString() !== new Date(prevMsg.timestamp).toDateString();

                return (
                  <div key={msg._id}>
                    {showDateSep && (
                      <div className="flex items-center gap-3 py-4">
                        <div className="h-px flex-1 bg-white/[0.05]" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">
                          {new Date(msg.timestamp).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                        </span>
                        <div className="h-px flex-1 bg-white/[0.05]" />
                      </div>
                    )}

                    <div className={cn("group flex items-end gap-2.5 mt-2", out ? "justify-end" : "justify-start")}>
                      {!out && (
                        <PlatformAvatar
                          source={selected.source as PlatformKey}
                          initial={selected.contactName.charAt(0).toUpperCase()}
                          size="sm"
                        />
                      )}

                      <div className={cn("flex flex-col gap-1", out ? "items-end" : "items-start", "max-w-[65%]")}>
                        {/* Role label */}
                        {out && isAI && (
                          <div className="flex items-center gap-1 mb-0.5 self-end">
                            <Sparkles className="h-2.5 w-2.5 text-violet-400" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-violet-400/70">AI Response</span>
                          </div>
                        )}

                        <div className={cn(
                          "relative rounded-2xl px-4 py-2.5 text-[13px] leading-[1.7]",
                          out
                            ? isAI
                              ? "rounded-br-md bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-[0_4px_24px_rgba(124,58,237,0.3)]"
                              : "rounded-br-md bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.25)]"
                            : "rounded-bl-md border border-white/[0.07] bg-white/[0.05] text-white/85 backdrop-blur-sm"
                        )}>
                          {msg.text}
                        </div>

                        <div className={cn("flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100", out ? "flex-row-reverse" : "flex-row")}>
                          <span className="text-[10px] text-white/25">{formatFullTime(msg.timestamp)}</span>
                          {out && <DeliveryIcon status={msg.deliveryStatus} />}
                        </div>
                      </div>

                      {out && (
                        <div className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                          isAI ? "bg-gradient-to-br from-violet-500 to-purple-600" : "bg-indigo-600"
                        )}>
                          {isAI ? <Sparkles className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="border-t border-white/[0.06] bg-[#0a0a1a] p-4">
              <div className="flex items-end gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 focus-within:border-violet-500/40 transition">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder={selected.mode === "AI" ? "AI is handling replies — type to override…" : "Type a reply… (Enter to send)"}
                  className="flex-1 resize-none bg-transparent text-[13px] text-white outline-none placeholder:text-white/20 leading-relaxed max-h-32"
                  style={{ overflowY: "auto" }}
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={sending || !text.trim()}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition",
                    text.trim()
                      ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-[0_0_14px_rgba(124,58,237,0.4)] hover:from-violet-500 hover:to-purple-500"
                      : "bg-white/[0.05] text-white/20"
                  )}
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-[10px] text-white/20">
                  {selected.mode === "AI" ? "AI mode active — your message will override AI" : "Manual mode — you are in control"}
                </p>
                <div className="flex items-center gap-1">
                  <ChevronDown className="h-3 w-3 text-white/15" />
                  <span className="text-[10px] text-white/15">Shift+Enter for new line</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.06] bg-white/[0.03]">
                <div className="flex gap-1">
                  {(["WHATSAPP", "INSTAGRAM", "MESSENGER"] as PlatformKey[]).map((k) => {
                    const Icon = PLATFORM[k].icon;
                    return <Icon key={k} className="h-4 w-4 text-white/20" />;
                  })}
                </div>
              </div>
              <p className="text-[15px] font-semibold text-white/30">Select a conversation</p>
              <p className="mt-1.5 text-[12px] text-white/15">Choose a thread from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
