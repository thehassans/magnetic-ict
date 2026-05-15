"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Bot,
  BookOpen,
  CheckCheck,
  Loader2,
  MessageCircle,
  MoreVertical,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  Video,
  Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotDocument } from "@/lib/social-bot-types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered";
};

type Channel = "WHATSAPP" | "INSTAGRAM" | "MESSENGER" | "WEB";

const CHANNEL_THEMES: Record<Channel, { bg: string; header: string; userBubble: string; tick: string; name: string }> = {
  WHATSAPP: {
    bg: "bg-[#e5ddd5]",
    header: "bg-[#075e54]",
    userBubble: "bg-[#dcf8c6] text-gray-900",
    tick: "text-[#4fc3f7]",
    name: "WhatsApp"
  },
  INSTAGRAM: {
    bg: "bg-[#fafafa]",
    header: "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400",
    userBubble: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    tick: "text-purple-300",
    name: "Instagram DM"
  },
  MESSENGER: {
    bg: "bg-white",
    header: "bg-[#0084ff]",
    userBubble: "bg-[#0084ff] text-white",
    tick: "text-blue-200",
    name: "Messenger"
  },
  WEB: {
    bg: "bg-gray-50 dark:bg-[#070710]",
    header: "bg-gradient-to-r from-violet-600 to-purple-700",
    userBubble: "bg-violet-600 text-white",
    tick: "text-violet-200",
    name: "Web Chat"
  }
};

const SUGGESTIONS = [
  "What services do you offer?",
  "What are your business hours?",
  "How can I contact support?",
  "Tell me about your pricing.",
  "Do you offer a free trial?",
  "How do I get started?"
];

export function ChatbotTest({ initialDocuments }: { initialDocuments: SocialBotDocument[] }) {
  const readyDocs = initialDocuments.filter((d) => d.status === "READY");
  const totalChunks = readyDocs.reduce((s, d) => s + d.chunkCount, 0);
  const hasKnowledge = readyDocs.length > 0;

  const [channel, setChannel] = useState<Channel>("WHATSAPP");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [botName, setBotName] = useState("Magnetic AI");
  const [customerName, setCustomerName] = useState("Customer");
  const [showSettings, setShowSettings] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const theme = CHANNEL_THEMES[channel];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
      status: "sending"
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setChatError(null);

    setTimeout(() => {
      setMessages((prev) => prev.map((m) => m.id === userMsg.id ? { ...m, status: "delivered" } : m));
    }, 500);

    try {
      const res = await fetch("/api/social-bot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history })
      });
      const json = (await res.json()) as { reply?: string; error?: string };

      if (res.ok && json.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: json.reply!,
            timestamp: new Date(),
            status: "delivered"
          }
        ]);
      } else {
        setChatError(json.error ?? "Something went wrong.");
      }
    } catch {
      setChatError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  }

  function clearChat() {
    setMessages([]);
    setChatError(null);
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-5 gap-5">

      {/* ── Top controls ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            <MessageCircle className="h-5 w-5 text-violet-500" />
            Test Bot
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Chat as a customer — see exactly how your bot responds</p>
        </div>

        <div className="flex items-center gap-2">
          {hasKnowledge ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-3 w-3" />
              {readyDocs.length} doc{readyDocs.length !== 1 ? "s" : ""} · {totalChunks} chunks
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" />
              No knowledge base
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition",
              showSettings
                ? "border-violet-400/40 bg-violet-500/10 text-violet-600 dark:text-violet-400"
                : "border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Settings
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-white/40 hover:text-rose-500 dark:hover:text-rose-400 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Settings panel ───────────────────────────────── */}
      {showSettings && (
        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-5 py-4 space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-white/30">Simulation settings</p>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(CHANNEL_THEMES) as Channel[]).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
                  channel === ch
                    ? "border-violet-400/40 bg-violet-500/10 text-violet-600 dark:text-violet-300"
                    : "border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-gray-600 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/[0.12]"
                )}
              >
                {CHANNEL_THEMES[ch].name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-white/30">Your name (customer)</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-8 w-44 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] px-3 text-xs text-gray-800 dark:text-white/80 outline-none focus:border-violet-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-white/30">Bot name</label>
              <input
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="h-8 w-44 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] px-3 text-xs text-gray-800 dark:text-white/80 outline-none focus:border-violet-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Phone mockup ─────────────────────────────────── */}
      <div className="flex flex-1 items-start justify-center overflow-hidden">
        <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-[36px] border-4 border-gray-900 dark:border-gray-700 shadow-2xl shadow-black/40 h-full max-h-[680px]">

          {/* Status bar */}
          <div className={cn("flex items-center justify-between px-5 py-1.5 text-white text-[11px] font-semibold", theme.header)}>
            <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3" />
              <span className="text-[9px] font-bold">4G</span>
            </div>
          </div>

          {/* Chat header */}
          <div className={cn("flex items-center gap-3 px-4 py-2.5", theme.header)}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{botName}</p>
              <p className="text-[10px] text-white/70">
                {loading ? "typing…" : "online"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Video className="h-4 w-4 text-white/80" />
              <Phone className="h-4 w-4 text-white/80" />
              <MoreVertical className="h-4 w-4 text-white/80" />
            </div>
          </div>

          {/* Messages */}
          <div className={cn("flex-1 overflow-y-auto px-3 py-3 space-y-1.5", theme.bg)}>

            {/* Date header */}
            <div className="flex justify-center py-2">
              <span className="rounded-full bg-black/10 px-3 py-0.5 text-[10px] text-gray-600 dark:text-white/50">
                Today
              </span>
            </div>

            {/* Welcome bubble */}
            {messages.length === 0 && (
              <div className="flex justify-start mb-2">
                <div className={cn("max-w-[80%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm", channel === "WEB" ? "bg-white dark:bg-white/[0.07] text-gray-800 dark:text-white/80" : "bg-white text-gray-800")}>
                  <p className="text-[13px] leading-relaxed">
                    👋 Hi! I&apos;m <strong>{botName}</strong>. How can I help you today?
                  </p>
                  <p className="mt-1 text-[9px] text-gray-400">{formatTime(new Date())}</p>
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-sm text-[13px] leading-relaxed",
                  msg.role === "user"
                    ? cn(theme.userBubble, "rounded-br-sm")
                    : cn(
                        channel === "WEB"
                          ? "bg-white dark:bg-white/[0.07] text-gray-800 dark:text-white/85"
                          : "bg-white text-gray-800",
                        "rounded-bl-sm"
                      )
                )}>
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <div className={cn("mt-1 flex items-center gap-1 text-[9px]",
                    msg.role === "user" ? theme.tick : "text-gray-400"
                  )}>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.role === "user" && (
                      <CheckCheck className={cn("h-3 w-3", msg.status === "delivered" ? theme.tick : "text-gray-300")} />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className={cn(
                  "rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm",
                  channel === "WEB" ? "bg-white dark:bg-white/[0.07]" : "bg-white"
                )}>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {chatError && (
              <div className="flex justify-center">
                <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3 py-1.5 text-[11px] text-rose-500">
                  <AlertCircle className="h-3 w-3" />
                  {chatError}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips — shown when empty */}
          {messages.length === 0 && hasKnowledge && (
            <div className={cn("flex gap-2 overflow-x-auto px-3 py-2 scrollbar-none", theme.bg)}>
              {SUGGESTIONS.slice(0, 4).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 10); }}
                  className="shrink-0 rounded-full border border-gray-300 dark:border-white/[0.12] bg-white dark:bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-gray-600 dark:text-white/50 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className={cn(
            "flex shrink-0 items-center gap-2 px-3 py-2.5",
            channel === "WEB" ? "bg-white dark:bg-[#0c0c1d] border-t border-gray-200 dark:border-white/[0.06]" : "bg-[#f0f0f0]"
          )}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Message as ${customerName}…`}
              autoFocus
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-[13px] outline-none",
                channel === "WEB"
                  ? "border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.05] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25"
                  : "bg-white text-gray-900 placeholder-gray-400"
              )}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
                channel === "WEB"
                  ? "bg-violet-600 hover:bg-violet-500 disabled:opacity-40"
                  : "bg-[#075e54] hover:bg-[#128c7e] disabled:opacity-40",
                "shadow-md"
              )}
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin text-white" />
                : <Send className="h-4 w-4 text-white" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer note ──────────────────────────────────── */}
      <p className="text-center text-[10px] text-gray-300 dark:text-white/20">
        This is a simulation. Replies use the same AI + knowledge base as live customer conversations.
      </p>
    </div>
  );
}
