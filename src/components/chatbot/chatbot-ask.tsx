"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Bot,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotDocument } from "@/lib/social-bot-types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  error?: boolean;
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm Magnetic AI. Ask me anything — I'll answer using your uploaded knowledge base. Try asking about your products, services, FAQs, or any information you've trained me on."
};

export function ChatbotAsk({ documents }: { documents: SocialBotDocument[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const readyDocs = documents.filter((d) => d.status === "READY");
  const totalChunks = readyDocs.reduce((s, d) => s + d.chunkCount, 0);
  const hasKnowledge = readyDocs.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = messages
      .filter((m) => m.id !== "welcome" && !m.error)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await fetch("/api/social-bot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history })
      });
      const json = (await res.json()) as { reply?: string; error?: string };

      if (res.ok && json.reply) {
        setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: "assistant", text: json.reply! }]);
      } else {
        setMessages((prev) => [...prev, { id: `e_${Date.now()}`, role: "assistant", text: json.error ?? "Something went wrong. Please try again.", error: true }]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: `e_${Date.now()}`, role: "assistant", text: "Connection error. Please try again.", error: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function clearChat() {
    setMessages([WELCOME]);
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1d] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Ask Magnetic</h1>
            <p className="text-xs text-gray-500 dark:text-white/40">Test your AI knowledge base in real time</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium",
            hasKnowledge
              ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/[0.07] text-emerald-700 dark:text-emerald-300"
              : "border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/[0.07] text-amber-700 dark:text-amber-300")}>
            <BookOpen className="h-3.5 w-3.5" />
            {hasKnowledge ? `${readyDocs.length} doc${readyDocs.length !== 1 ? "s" : ""} · ${totalChunks} chunks` : "No knowledge base"}
          </div>
          <button
            type="button"
            onClick={clearChat}
            title="Clear conversation"
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {!hasKnowledge && (
        <div className="shrink-0 mx-6 mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/[0.06] px-4 py-3.5">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">No knowledge base found</p>
            <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400/80">Go to <span className="font-semibold">Knowledge</span> and upload documents first. The AI will still reply using its global instructions, but won't have your specific business context.</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              msg.role === "user"
                ? "bg-violet-100 dark:bg-violet-500/20"
                : "bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/25")}>
              {msg.role === "user"
                ? <User className="h-4 w-4 text-violet-600 dark:text-violet-300" />
                : <Sparkles className="h-4 w-4 text-white" />}
            </div>
            <div className={cn("max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
              msg.role === "user"
                ? "rounded-tr-sm bg-violet-600 text-white shadow-violet-500/15"
                : msg.error
                ? "rounded-tl-sm border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/[0.07] text-rose-700 dark:text-rose-300"
                : "rounded-tl-sm border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.04] text-gray-800 dark:text-white/80")}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.04] px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
              <span className="text-sm text-gray-400 dark:text-white/30">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1d] px-6 py-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] transition focus-within:border-violet-400 dark:focus-within:border-violet-500/50 focus-within:bg-white dark:focus-within:bg-white/[0.06]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your knowledge base… (Enter to send)"
              rows={1}
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/25"
              style={{ maxHeight: "120px", overflowY: "auto" }}
            />
          </div>
          <button
            type="button"
            onClick={() => { void send(); }}
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 shadow-md shadow-violet-500/25 transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4 text-white" />}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-300 dark:text-white/20">
          AI responses are generated using your knowledge base + Gemini · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
