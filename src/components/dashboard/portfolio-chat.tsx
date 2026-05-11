"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, Loader2, RefreshCw, Sparkles, User } from "lucide-react";
import type { PortfolioChatMessage, PortfolioSite } from "@/lib/portfolio-db";
import { cn } from "@/lib/utils";

type Props = {
  site: PortfolioSite;
  initialMessages: PortfolioChatMessage[];
};

const suggestions = [
  "Change my phone number to +880 17XX XXXXXX",
  "Update my tagline to 'Full-Stack Developer & Designer'",
  "Set my accent color to #8b5cf6",
  "Add React, TypeScript and Node.js to my skills",
  "Publish my site",
  "Write a bio about me — I'm a software developer based in Dhaka"
];

export function PortfolioChat({ site, initialMessages }: Props) {
  const [messages, setMessages] = useState<PortfolioChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [updatedField, setUpdatedField] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);
    setUpdatedField(null);

    const optimistic: PortfolioChatMessage = {
      _id: `tmp-${Date.now()}`,
      siteId: site._id,
      userId: site.userId,
      role: "user",
      content: msg,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/portfolio/${site._id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      const data = (await res.json()) as { reply?: string; appliedUpdate?: { field: string; value: unknown } | null; error?: string };
      if (res.ok && data.reply) {
        const reply: PortfolioChatMessage = {
          _id: `tmp-ai-${Date.now()}`,
          siteId: site._id,
          userId: site.userId,
          role: "assistant",
          content: data.reply,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, reply]);
        if (data.appliedUpdate) setUpdatedField(data.appliedUpdate.field);
      } else {
        const err: PortfolioChatMessage = {
          _id: `tmp-err-${Date.now()}`,
          siteId: site._id,
          userId: site.userId,
          role: "assistant",
          content: data.error ?? "Something went wrong.",
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, err]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        _id: `tmp-err-${Date.now()}`,
        siteId: site._id, userId: site.userId,
        role: "assistant", content: "Network error. Please try again.",
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  return (
    <div className="flex h-[calc(100vh-13rem)] min-h-[500px] flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/[0.02]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-400/10">
          <Sparkles className="h-4.5 w-4.5 text-violet-600 dark:text-violet-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Portfolio AI</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Chat to update your portfolio — {site.name}</p>
        </div>
        {updatedField && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
            <RefreshCw className="h-3 w-3" /> Updated: {updatedField}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-violet-100 dark:bg-violet-400/10">
              <Bot className="h-8 w-8 text-violet-600 dark:text-violet-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900 dark:text-white">Portfolio AI ready</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tell me what to change on your portfolio.</p>
            </div>
            <div className="flex w-full max-w-lg flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[12px] text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-violet-400/30 dark:hover:bg-violet-400/10 dark:hover:text-violet-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m._id} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-xs font-bold",
                  m.role === "user"
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"
                )}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div className={cn("max-w-[76%] rounded-[20px] px-4 py-3 text-sm leading-6",
                  m.role === "user"
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "border border-slate-200/70 bg-white text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-400/10">
                  <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                </div>
                <div className="flex items-center gap-2 rounded-[20px] border border-slate-200/70 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
                  <span className="text-sm text-slate-500">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200/70 p-4 dark:border-white/10">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/20"
            placeholder="e.g. Change my phone to +880 17XX…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
            }}
          />
          <button
            onClick={() => void send()}
            disabled={sending || !input.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition hover:bg-violet-700 disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
