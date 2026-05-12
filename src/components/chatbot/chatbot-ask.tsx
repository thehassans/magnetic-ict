"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Bot,
  BrainCircuit,
  Loader2,
  RotateCcw,
  Send,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotDocument } from "@/lib/social-bot-types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
};

const SUGGESTIONS = [
  "What services do you offer?",
  "What are your business hours?",
  "How can I contact support?",
  "Tell me about your pricing."
];

export function ChatbotAsk({ initialDocuments }: { initialDocuments: SocialBotDocument[] }) {
  const readyDocs  = initialDocuments.filter((d) => d.status === "READY");
  const totalChunks = readyDocs.reduce((s, d) => s + d.chunkCount, 0);
  const hasKnowledge = readyDocs.length > 0;

  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text, timestamp: new Date().toISOString() };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setChatError(null);

    try {
      const res  = await fetch("/api/social-bot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history })
      });
      const json = (await res.json()) as { reply?: string; error?: string };

      if (res.ok && json.reply) {
        setMessages((prev) => [...prev, {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: json.reply!,
          timestamp: new Date().toISOString()
        }]);
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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1d] px-6 py-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            <BrainCircuit className="h-5 w-5 text-violet-500" />
            Ask Magnetic
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Test your AI knowledge base in real-time</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasKnowledge ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <BookOpen className="h-3 w-3" />
                {readyDocs.length} doc{readyDocs.length !== 1 ? "s" : ""} ready
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                <Sparkles className="h-3 w-3" />
                {totalChunks} knowledge chunks
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" />
              No knowledge base yet
            </span>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => { setMessages([]); setChatError(null); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-gray-500 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/60 transition"
            >
              <RotateCcw className="h-3 w-3" />
              Clear chat
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#070710] px-6 py-5 space-y-5">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-purple-600/15 ring-1 ring-violet-200 dark:ring-violet-500/25">
                <BrainCircuit className="h-8 w-8 text-violet-500 dark:text-violet-400" />
              </div>
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 ring-2 ring-gray-50 dark:ring-[#070710]">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </span>
            </div>

            <p className="text-base font-semibold text-gray-800 dark:text-white/80">
              {hasKnowledge ? "Your knowledge base is ready to test" : "No knowledge base connected"}
            </p>
            <p className="mt-1.5 max-w-sm text-sm text-gray-400 dark:text-white/30">
              {hasKnowledge
                ? "Ask any question and Magnetic will answer using your uploaded documents and training data."
                : "Go to the Knowledge section, upload your business documents and run \"Retrain AI\", then come back here to test."}
            </p>

            {hasKnowledge && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 10); }}
                    className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-gray-600 dark:text-white/50 hover:border-violet-300 dark:hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-400 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message list */}
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex items-end gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            {/* Avatar */}
            {msg.role === "assistant" ? (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30">
                <Bot className="h-4 w-4 text-white" />
              </div>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-200 dark:bg-white/[0.1]">
                <span className="text-[10px] font-bold text-gray-500 dark:text-white/50">You</span>
              </div>
            )}

            {/* Bubble */}
            <div className={cn(
              "max-w-[68%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
              msg.role === "user"
                ? "rounded-br-sm bg-violet-600 text-white shadow-violet-500/20"
                : "rounded-bl-sm border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.05] text-gray-800 dark:text-white/85"
            )}>
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              <p className={cn("mt-1.5 text-[10px]",
                msg.role === "user" ? "text-violet-200" : "text-gray-300 dark:text-white/25")}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/30">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-sm border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.05] px-4 py-3.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {chatError && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-500/25 bg-rose-50 dark:bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {chatError}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ──────────────────────────────────────── */}
      <div className="shrink-0 border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1d] px-4 py-3">
        {!hasKnowledge && (
          <div className="mb-2.5 flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/[0.07] px-3 py-2 text-[11px] text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3 w-3 shrink-0" />
            Responses will be generic until you upload documents in the Knowledge section and retrain.
          </div>
        )}
        <div className="flex items-end gap-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={hasKnowledge ? "Ask anything about your business…" : "Ask a question to test the AI…"}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] px-4 py-3 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/25 focus:border-violet-400 dark:focus:border-violet-500/60 focus:bg-white dark:focus:bg-white/[0.06] transition"
            style={{ minHeight: "48px", maxHeight: "128px" }}
          />
          <button
            type="button"
            onClick={() => { void sendMessage(); }}
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 shadow-md shadow-violet-500/20 transition"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin text-white" />
              : <Send className="h-4 w-4 text-white" />
            }
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-gray-300 dark:text-white/20">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
