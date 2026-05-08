"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, BrainCircuit, FileText, LoaderCircle, RefreshCw, Upload, CheckCircle2, AlertCircle } from "lucide-react";
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

type UploadedDoc = {
  name: string;
  status: "uploading" | "done" | "error";
};

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { label: "What services do you offer?", prompt: "What services or products are described in the knowledge base?" },
  { label: "Pricing & packages", prompt: "What pricing or packages are mentioned in the documents?" },
  { label: "How to get started?", prompt: "How can someone get started based on the knowledge base?" },
  { label: "Key features", prompt: "What are the key features or highlights mentioned in the knowledge base?" },
  { label: "Contact & support", prompt: "What contact or support information is available?" },
  { label: "How to train RAG?", prompt: "How do I train the knowledge base with my own documents?" },
];

interface AIAssistantInterfaceProps {
  userName?: string | null;
}

export function AIAssistantInterface({ userName }: AIAssistantInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = React.useState<UploadedDoc[]>([]);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const hasMessages = messages.length > 0;

  const displayName = userName?.split(" ")[0] ?? "there";

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(prompt: string) {
    if (!prompt.trim() || isLoading) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: prompt.trim(), timestamp: new Date() };
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
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: data.reply!, timestamp: new Date() }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newDocs: UploadedDoc[] = Array.from(files).map((f) => ({ name: f.name, status: "uploading" }));
    setUploadedDocs((prev) => [...prev, ...newDocs]);
    const formData = new FormData();
    for (const file of Array.from(files)) formData.append("files", file);
    try {
      const res = await fetch("/api/social-bot/documents", { method: "POST", body: formData });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      setUploadedDocs((prev) =>
        prev.map((doc) => newDocs.find((d) => d.name === doc.name) ? { ...doc, status: res.ok && data.ok ? "done" : "error" } : doc)
      );
    } catch {
      setUploadedDocs((prev) =>
        prev.map((doc) => newDocs.find((d) => d.name === doc.name) ? { ...doc, status: "error" } : doc)
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {!hasMessages ? (
          /* ── Welcome state ── */
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col items-center justify-center px-4 pb-2 text-center"
          >
            {/* Logo */}
            <div className="relative mb-7">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-violet-600/30 blur-2xl" />
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30"
              >
                <BrainCircuit className="h-10 w-10 text-white" strokeWidth={1.5} />
                <div className="absolute inset-0 animate-ping rounded-3xl bg-indigo-400/20" style={{ animationDuration: "2.5s" }} />
              </motion.div>
            </div>

            {/* Pencerio Welcome heading */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-2">
              <h1
                className="bg-gradient-to-br from-slate-900 via-indigo-800 to-violet-700 bg-clip-text text-5xl font-black tracking-tight text-transparent dark:from-white dark:via-indigo-200 dark:to-violet-300 sm:text-6xl"
                style={{ fontFamily: "'Pencerio', 'DM Sans', system-ui, sans-serif", letterSpacing: "-0.02em" }}
              >
                Welcome{userName ? `,\u00A0${displayName}` : ""}
                <span className="text-indigo-500 dark:text-indigo-400">!</span>
              </h1>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }}
              className="mb-7 text-base font-medium text-slate-500 dark:text-slate-400">
              How can I assist you today?
            </motion.p>

            {/* Suggested questions */}
            <div className="mb-6 flex w-full max-w-xl flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button key={q.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                  onClick={() => sendMessage(q.prompt)}
                  className="rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-400/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300">
                  {q.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Messages ── */
          <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto px-4 py-5">
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "assistant" && (
                    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                      <BrainCircuit className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className={cn("max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "border border-slate-200/70 bg-white/90 text-slate-800 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.05] dark:text-slate-200")}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                    <BrainCircuit className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="flex h-10 items-center gap-1.5 rounded-2xl border border-slate-200/70 bg-white/90 px-4 shadow-sm dark:border-white/[0.07] dark:bg-white/[0.05]">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-indigo-500"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                </motion.div>
              )}
              {error && <p className="text-center text-xs text-rose-500">{error}</p>}
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input section with embedded upload ── */}
      <div className="shrink-0 px-4 pb-4">
        <div className="mx-auto max-w-2xl">

          {/* Uploaded docs list — shown above input when docs exist */}
          <AnimatePresence>
            {uploadedDocs.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-2 overflow-hidden">
                <div className="flex flex-wrap gap-1.5 rounded-2xl border border-indigo-100/70 bg-indigo-50/60 p-2 dark:border-indigo-400/20 dark:bg-indigo-500/[0.06]">
                  {uploadedDocs.map((doc, i) => (
                    <div key={`${doc.name}-${i}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 dark:border-white/[0.07] dark:bg-white/[0.05] dark:text-slate-300">
                      <FileText className="h-3 w-3 shrink-0 text-indigo-500" />
                      <span className="max-w-[120px] truncate">{doc.name}</span>
                      {doc.status === "uploading" && <LoaderCircle className="h-3 w-3 shrink-0 animate-spin text-indigo-400" />}
                      {doc.status === "done" && <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />}
                      {doc.status === "error" && <AlertCircle className="h-3 w-3 shrink-0 text-rose-500" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input card — upload button + textarea + send */}
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04]">
            {/* Top row: RAG training upload strip */}
            <div className="flex items-center gap-2 border-b border-slate-100/70 px-4 pt-3 pb-2 dark:border-white/[0.05]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-indigo-300/60 bg-indigo-50/60 px-3 py-1 text-[11px] font-semibold text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:border-indigo-400/60"
              >
                <Upload className="h-3 w-3" />
                Upload to train knowledge base
              </button>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">PDF · DOCX · TXT</span>
              {hasMessages && (
                <button onClick={() => { setMessages([]); setError(null); setInputValue(""); inputRef.current?.focus(); }}
                  className="ml-auto inline-flex items-center gap-1 text-[10px] text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                  <RefreshCw className="h-2.5 w-2.5" />
                  New chat
                </button>
              )}
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything from your knowledge base…"
                className="w-full resize-none bg-transparent px-5 py-3.5 pr-14 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                style={{ maxHeight: 160 }}
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  "absolute bottom-2.5 right-3 flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                  inputValue.trim() && !isLoading
                    ? "bg-slate-950 text-white shadow hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100"
                    : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-600"
                )}
              >
                {isLoading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ArrowUp className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Trained on your knowledge base · Press Enter to send
          </p>
        </div>

        <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.md,text/plain,application/pdf" className="hidden"
          onChange={(e) => { void handleFileUpload(e.target.files); }} />
      </div>
    </div>
  );
}
