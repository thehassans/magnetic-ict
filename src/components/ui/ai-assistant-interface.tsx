"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, BrainCircuit, LoaderCircle, RefreshCw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type SuggestedQuestion = {
  label: string;
  prompt: string;
};

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { label: "What services do you offer?", prompt: "What services does Magnetic ICT offer?" },
  { label: "How does Magnetic Commerce work?", prompt: "How does Magnetic Commerce work and what features does it include?" },
  { label: "Pricing & packages", prompt: "What are the pricing packages available?" },
  { label: "How to get started?", prompt: "How can I get started with Magnetic ICT?" },
  { label: "Admin panel features", prompt: "What features are available in the Magnetic Commerce admin panel?" },
];

interface AIAssistantInterfaceProps {
  userName?: string | null;
}

export function AIAssistantInterface({ userName }: AIAssistantInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  const displayName = userName?.split(" ")[0] ?? "there";

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(prompt: string) {
    if (!prompt.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ask-magnetic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt.trim(), history: messages }),
      });

      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };

      if (!res.ok || !data.reply) throw new Error(data.error ?? "Unable to get a response right now.");

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }

  function resetChat() {
    setMessages([]);
    setInputValue("");
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <div className="flex h-full flex-col">
      <AnimatePresence mode="wait">
        {!hasMessages ? (
          /* ── Welcome / empty state ── */
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col items-center justify-center px-4 pb-6 text-center"
          >
            {/* Icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/20">
                <BrainCircuit className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Greeting */}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Welcome{userName ? `, ${displayName}` : ""}!
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              How can I assist you today?
            </p>

            {/* Suggested questions */}
            <div className="mt-8 flex w-full max-w-lg flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button
                  key={q.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  onClick={() => sendMessage(q.prompt)}
                  className="rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-400/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                >
                  {q.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Messages ── */
          <motion.div
            key="messages"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                      <BrainCircuit className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "border border-slate-200/70 bg-white/90 text-slate-800 shadow-sm backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/[0.05] dark:text-slate-200"
                    )}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                    <BrainCircuit className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex h-10 items-center gap-1.5 rounded-2xl border border-slate-200/70 bg-white/90 px-4 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.05]">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {error && (
                <p className="text-center text-xs text-rose-500 dark:text-rose-400">{error}</p>
              )}

              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ── */}
      <div className="px-4 pb-6">
        <div className="mx-auto max-w-2xl">
          <div className="relative rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04]">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Magnetic ICT anything…"
              className="w-full resize-none rounded-3xl bg-transparent px-5 py-4 pr-24 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
              style={{ maxHeight: 180 }}
            />

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              {hasMessages && (
                <button
                  onClick={resetChat}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/[0.08] dark:hover:text-slate-200"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                  inputValue.trim() && !isLoading
                    ? "bg-slate-950 text-white shadow-md hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100"
                    : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-600"
                )}
              >
                {isLoading ? (
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Powered by Magnetic ICT knowledge base · Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
