"use client";

import { useCallback, useEffect, useState } from "react";
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

  return (
    <div className="flex h-full">
      <div className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
          <h2 className="font-semibold text-slate-950 dark:text-white">Inbox</h2>
          <button type="button" onClick={() => void refreshThreads()} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1 border-b border-slate-200 px-3 py-2 dark:border-white/10">
          {(["ALL", "AI", "MANUAL"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={cn("flex-1 rounded-lg py-1.5 text-xs font-semibold transition", filter === f ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10")}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-white/10">
          {filtered.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No conversations.</p>
          ) : filtered.map((t) => {
            const Icon = sourceIconMap[t.source];
            return (
              <button key={t._id} type="button" onClick={() => setSelectedId(t._id)}
                className={cn("flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-white/5", selectedId === t._id && "bg-violet-50 dark:bg-violet-400/10")}>
                <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  selectedId === t._id ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300")}>
                  {t.contactName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{t.contactName}</p>
                    {t.unreadCount > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white">{t.unreadCount}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3 w-3 shrink-0 text-slate-400" />
                    <p className="truncate text-xs text-slate-400">{t.lastMessagePreview}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 dark:border-white/10 dark:bg-slate-900">
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">{selected.contactName}</p>
                <p className="text-xs text-slate-400">{selected.contactHandle} · {selected.source}</p>
              </div>
              <div className="flex gap-2">
                {(["AI", "MANUAL"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => void toggleMode(m)}
                    className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      selected.mode === m ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300")}>
                    {m === "AI" && <Zap className="h-3 w-3" />}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-5">
              {(payload?.messages ?? []).map((msg) => {
                const out = msg.direction === "OUTBOUND";
                return (
                  <div key={msg._id} className={cn("flex gap-2", out && "justify-end")}>
                    {!out && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                        {selected.contactName.charAt(0)}
                      </div>
                    )}
                    <div className={cn("max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-6",
                      out ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100")}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
              <div className="flex gap-3">
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2}
                  placeholder="Type a reply…"
                  className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <button type="button" onClick={() => void send()} disabled={sending || !text.trim()}
                  className="flex items-center gap-2 self-end rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
