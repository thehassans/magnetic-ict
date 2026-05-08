"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, BrainCircuit, FileText, LoaderCircle, RefreshCw, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
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
  const [showUpload, setShowUpload] = React.useState(false);
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

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newDocs: UploadedDoc[] = Array.from(files).map((f) => ({
      name: f.name,
      status: "uploading" as const,
    }));
    setUploadedDocs((prev) => [...prev, ...newDocs]);

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    try {
      const res = await fetch("/api/social-bot/documents", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      setUploadedDocs((prev) =>
        prev.map((doc) => {
          const justUploaded = newDocs.find((d) => d.name === doc.name);
          if (!justUploaded) return doc;
          return { ...doc, status: res.ok && data.ok ? ("done" as const) : ("error" as const) };
        })
      );

      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
    } catch (e) {
      setUploadedDocs((prev) =>
        prev.map((doc) => {
          const justUploaded = newDocs.find((d) => d.name === doc.name);
          if (!justUploaded) return doc;
          return { ...doc, status: "error" as const };
        })
      );
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
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
            className="flex flex-1 flex-col items-center justify-center px-4 pb-4 text-center"
          >
            {/* Premium logo */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-violet-600/30 blur-2xl" />
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30"
              >
                <BrainCircuit className="h-10 w-10 text-white" strokeWidth={1.5} />
                {/* Pulsing ring */}
                <div className="absolute inset-0 animate-ping rounded-3xl bg-indigo-400/20" style={{ animationDuration: "2.5s" }} />
              </motion.div>
            </div>

            {/* Ultra-premium Welcome heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-2"
            >
              <h1
                className="bg-gradient-to-br from-slate-900 via-indigo-800 to-violet-700 bg-clip-text text-4xl font-black tracking-tight text-transparent dark:from-white dark:via-indigo-200 dark:to-violet-300 sm:text-5xl"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: "-0.03em" }}
              >
                Welcome{userName ? `,\u00A0${displayName}` : ""}
                <span className="text-indigo-500 dark:text-indigo-400">!</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mb-8 text-base font-medium text-slate-500 dark:text-slate-400"
            >
              How can I assist you today?
            </motion.p>

            {/* Suggested questions */}
            <div className="mb-8 flex w-full max-w-xl flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button
                  key={q.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                  onClick={() => sendMessage(q.prompt)}
                  className="rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-400/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                >
                  {q.label}
                </motion.button>
              ))}
            </div>

            {/* Upload / RAG training card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="w-full max-w-xl"
            >
              <button
                onClick={() => setShowUpload((v) => !v)}
                className="flex w-full items-center justify-between rounded-2xl border border-dashed border-indigo-200/60 bg-indigo-50/50 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:border-indigo-400/40"
              >
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Train knowledge base · Upload PDF, DOCX or TXT
                </span>
                <span className="text-[11px] font-normal text-indigo-400 dark:text-indigo-500">
                  {showUpload ? "Hide" : "Show"}
                </span>
              </button>

              <AnimatePresence>
                {showUpload && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <UploadPanel docs={uploadedDocs} fileInputRef={fileInputRef} onUpload={handleFileUpload} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : (
          /* ── Messages ── */
          <motion.div
            key="messages"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto px-4 py-5"
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
                    <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                      <BrainCircuit className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
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

              {isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                    <BrainCircuit className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
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

              {error && <p className="text-center text-xs text-rose-500 dark:text-rose-400">{error}</p>}
              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom bar (input + optional upload toggle when chatting) ── */}
      <div className="shrink-0 px-4 pb-4">
        <div className="mx-auto max-w-2xl space-y-2">
          {/* Upload toggle inside chat */}
          {hasMessages && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpload((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/60 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-300"
              >
                <Upload className="h-3 w-3" />
                Train KB
              </button>
              <button onClick={resetChat} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/[0.06]">
                <RefreshCw className="h-3 w-3" />
                New chat
              </button>
            </div>
          )}

          {/* Upload panel inside chat */}
          <AnimatePresence>
            {hasMessages && showUpload && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <UploadPanel docs={uploadedDocs} fileInputRef={fileInputRef} onUpload={handleFileUpload} compact />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="relative rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04]">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything from your knowledge base…"
              className="w-full resize-none rounded-3xl bg-transparent px-5 py-4 pr-16 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
              style={{ maxHeight: 180 }}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className={cn(
                "absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
                inputValue.trim() && !isLoading
                  ? "bg-slate-950 text-white shadow-md hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100"
                  : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-600"
              )}
            >
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
            Trained on your knowledge base · Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Upload Panel component ── */
function UploadPanel({
  docs,
  fileInputRef,
  onUpload,
  compact = false,
}: {
  docs: UploadedDoc[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (files: FileList | null) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("mt-2 rounded-2xl border border-dashed border-indigo-200/60 bg-indigo-50/40 p-4 dark:border-indigo-400/20 dark:bg-indigo-500/[0.06]", compact && "mt-1 rounded-xl p-3")}>
      {!compact && (
        <div className="mb-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">RAG Knowledge Training</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Upload your business documents to train the AI. The bot will only answer from these files. Supported: PDF, DOCX, TXT, MD.
          </p>
        </div>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        <Upload className="h-3.5 w-3.5" />
        Choose files to upload
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.md,text/plain,application/pdf"
        className="hidden"
        onChange={(e) => onUpload(e.target.files)}
      />

      {docs.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {docs.map((doc, i) => (
            <div key={`${doc.name}-${i}`} className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/80 px-3 py-2 text-xs dark:border-white/[0.07] dark:bg-white/[0.04]">
              <FileText className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
              <span className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-300">{doc.name}</span>
              {doc.status === "uploading" && <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-indigo-400" />}
              {doc.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
              {doc.status === "error" && <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
