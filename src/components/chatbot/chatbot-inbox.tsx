"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Instagram, Loader2, MessageCircle, RefreshCw, Send, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotMessage, SocialBotThread } from "@/lib/social-bot-types";

const sourceIconMap = { WHATSAPP: MessageCircle, INSTAGRAM: Instagram, MESSENGER: Bot } as const;

type ThreadPayload = { thread: SocialBotThread | null; messages: SocialBotMessage[] };

export function ChatbotInbox({ initialThreads }: { initialThreads: SocialBotThread[] }) {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedId, setSelectedId] = useState<string | null>(initialThreads[0]?._id ?? null);
  const [payload, setPayload] = useState<ThreadPayload | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "AI" | "MANUAL">("ALL");

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

  const filtered = threads.filter((t) => filter === "ALL" || t.mode === filter);
  const selected = payload?.thread ?? null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [payload?.messages]);

  return (
    <div className="flex h-full">
      {/* Thread list */}
      <div className="flex w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0c0c1d]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
          <h2 className="text-sm font-semibold text-white">Inbox</h2>
          <button type="button" onClick={() => void refreshThreads()} className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/[0.06] hover:text-white/70">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex gap-1 border-b border-white/[0.06] px-3 py-2">
          {(["ALL", "AI", "MANUAL"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={cn("flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition", filter === f ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]" : "text-white/30 hover:bg-white/[0.05] hover:text-white/60")}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <MessageCircle className="h-7 w-7 text-white/10" />
              <p className="text-xs text-white/25">No conversations</p>
            </div>
          ) : filtered.map((t) => {
            const Icon = sourceIconMap[t.source];
            const isActive = selectedId === t._id;
            return (
              <button key={t._id} type="button" onClick={() => setSelectedId(t._id)}
                className={cn("flex w-full items-start gap-3 px-4 py-3.5 text-left transition", isActive ? "bg-violet-500/10" : "hover:bg-white/[0.03]")}>
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  isActive ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]" : "bg-white/[0.06] text-white/50")}>
                  {t.contactName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-[13px] font-semibold text-white/90">{t.contactName}</p>
                    {t.unreadCount > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">{t.unreadCount}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Icon className="h-3 w-3 shrink-0 text-white/25" />
                    <p className="truncate text-[11px] text-white/30">{t.lastMessagePreview}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message panel */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#070710]">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c1d] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/40 to-purple-600/30 text-sm font-bold text-violet-200">
                  {selected.contactName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{selected.contactName}</p>
                  <p className="text-[11px] text-white/35">{selected.contactHandle} · {selected.source}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {(["AI", "MANUAL"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => void toggleMode(m)}
                    className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                      selected.mode === m
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]"
                        : "border border-white/[0.08] text-white/40 hover:border-violet-500/40 hover:text-white/70")}>
                    {m === "AI" && <Zap className="h-3 w-3" />}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-5">
              {(payload?.messages ?? []).map((msg) => {
                const out = msg.direction === "OUTBOUND";
                return (
                  <div key={msg._id} className={cn("flex gap-2.5", out && "justify-end")}>
                    {!out && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-xs font-bold text-white/50">
                        {selected.contactName.charAt(0)}
                      </div>
                    )}
                    <div className={cn("max-w-[68%] rounded-2xl px-4 py-2.5 text-sm leading-[1.65]",
                      out ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-[0_4px_20px_rgba(124,58,237,0.35)]" : "border border-white/[0.07] bg-white/[0.05] text-white/80")}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/[0.06] bg-[#0c0c1d] p-4">
              <div className="flex gap-3">
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2}
                  placeholder="Type a reply…"
                  className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/60 focus:bg-white/[0.06] transition" />
                <button type="button" onClick={() => void send()} disabled={sending || !text.trim()}
                  className="flex items-center gap-2 self-end rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.4)] transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-40">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                <MessageCircle className="h-7 w-7 text-white/15" />
              </div>
              <p className="text-sm text-white/25">Select a conversation to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
