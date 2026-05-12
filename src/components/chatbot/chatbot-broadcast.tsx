"use client";

import { useState } from "react";
import {
  CheckSquare,
  Loader2,
  Megaphone,
  MessageSquare,
  Send,
  Square,
  Users,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotThread } from "@/lib/social-bot-types";

const channelColors: Record<string, { badge: string; icon: string }> = {
  WHATSAPP:  { badge: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20", icon: "text-emerald-500 dark:text-emerald-400" },
  INSTAGRAM: { badge: "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-500/20",           icon: "text-pink-500 dark:text-pink-400" },
  MESSENGER: { badge: "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/20",                 icon: "text-sky-500 dark:text-sky-400" }
};

export function ChatbotBroadcast({ initialThreads }: { initialThreads: SocialBotThread[] }) {
  const uniqueThreads = initialThreads.filter(
    (t, i, arr) => arr.findIndex((x) => x.contactHandle === t.contactHandle) === i
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; message: string } | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [filterChannel, setFilterChannel] = useState<string>("ALL");

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  const filtered = filterChannel === "ALL" ? uniqueThreads : uniqueThreads.filter((t) => t.source === filterChannel);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t._id)));
    }
  }

  async function handleBroadcast() {
    if (!message.trim()) { showToast("err", "Please write a message first."); return; }
    if (selected.size === 0) { showToast("err", "Select at least one contact."); return; }

    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/social-bot/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadIds: Array.from(selected), message: message.trim() })
      });
      const json = (await res.json()) as { sent?: number; failed?: number; message?: string; error?: string };
      if (res.ok) {
        setResult({ sent: json.sent ?? 0, failed: json.failed ?? 0, message: json.message ?? "Done." });
        setSelected(new Set());
        setMessage("");
        showToast("ok", json.message ?? "Broadcast sent.");
      } else {
        showToast("err", json.error ?? "Broadcast failed.");
      }
    } catch {
      showToast("err", "Broadcast failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      {toast && (
        <div className={cn("fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl backdrop-blur",
          toast.type === "ok" ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                              : "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30")}>
          {toast.msg}
        </div>
      )}

      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Broadcast</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Send a message to multiple contacts at once across all channels</p>
      </div>

      <div className="flex flex-1 gap-5 overflow-hidden px-6 pb-6">
        <div className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]">
          <div className="border-b border-gray-100 dark:border-white/[0.05] px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Contacts
              </p>
              <button type="button" onClick={selectAll} className="text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 transition">
                {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="mt-2 flex gap-1">
              {["ALL", "WHATSAPP", "INSTAGRAM", "MESSENGER"].map((ch) => (
                <button key={ch} type="button" onClick={() => setFilterChannel(ch)}
                  className={cn("rounded-lg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition",
                    filterChannel === ch ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300" : "text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50")}>
                  {ch === "ALL" ? "All" : ch.charAt(0) + ch.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Users className="mb-3 h-8 w-8 text-gray-300 dark:text-white/20" />
                <p className="text-xs text-gray-400 dark:text-white/30">No contacts yet. Start conversations from the inbox.</p>
              </div>
            ) : (
              filtered.map((t) => {
                const colors = channelColors[t.source] ?? channelColors.WHATSAPP;
                const isSelected = selected.has(t._id);
                return (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => toggleSelect(t._id)}
                    className={cn("flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-white/[0.02]",
                      isSelected && "bg-violet-50/60 dark:bg-violet-500/[0.05]")}
                  >
                    {isSelected ? <CheckSquare className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-400" /> : <Square className="h-4 w-4 shrink-0 text-gray-300 dark:text-white/20" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-white/80">{t.contactName}</p>
                      <p className="truncate text-[11px] text-gray-400 dark:text-white/30">{t.contactHandle}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", colors.badge)}>
                      {t.source.charAt(0) + t.source.slice(1).toLowerCase()}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selected.size > 0 && (
            <div className="border-t border-gray-100 dark:border-white/[0.05] px-4 py-2">
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">{selected.size} contact{selected.size !== 1 ? "s" : ""} selected</p>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]">
            <div className="border-b border-gray-100 dark:border-white/[0.05] px-5 py-3.5 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-white/80">Compose Message</p>
            </div>
            <div className="p-5">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the message you want to send to all selected contacts…"
                rows={6}
                className="w-full resize-none rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-4 py-3 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/25 focus:border-violet-400 dark:focus:border-violet-500/60 focus:bg-gray-50 dark:focus:bg-white/[0.06] transition"
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/30">
                  <Zap className="h-3.5 w-3.5 text-violet-400" />
                  {selected.size > 0 ? `Will send to ${selected.size} contact${selected.size !== 1 ? "s" : ""}` : "Select contacts on the left"}
                </div>
                <button
                  type="button"
                  onClick={handleBroadcast}
                  disabled={sending || selected.size === 0 || !message.trim()}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Sending…" : "Send Broadcast"}
                </button>
              </div>
            </div>
          </div>

          {result && (
            <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/[0.07] p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <Megaphone className="h-4 w-4" /> Broadcast Complete
              </p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{result.message}</p>
              <div className="mt-3 flex gap-4">
                <div className="rounded-xl bg-emerald-100 dark:bg-emerald-500/10 px-4 py-2 text-center">
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{result.sent}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Sent</p>
                </div>
                {result.failed > 0 && (
                  <div className="rounded-xl bg-rose-100 dark:bg-rose-500/10 px-4 py-2 text-center">
                    <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{result.failed}</p>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400">Failed</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Important</p>
            <ul className="space-y-1.5 text-sm text-amber-700 dark:text-amber-300/70">
              <li>• Only contacts with active channel integrations will receive messages through Meta.</li>
              <li>• Messages to demo threads are recorded but not delivered externally.</li>
              <li>• Follow WhatsApp / Meta messaging policies — only send to opted-in contacts.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
