"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  FileType,
  Layers,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotDocument } from "@/lib/social-bot-types";

const ACCEPTED = ".pdf,.txt,.md,.csv,.docx,.doc,.xlsx,.xls,.json";

function fileIcon(mimeType: string) {
  if (mimeType.includes("pdf"))   return { icon: FileType,  color: "text-rose-400",    bg: "bg-rose-500/10" };
  if (mimeType.includes("word") || mimeType.includes("doc")) return { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" };
  if (mimeType.includes("sheet") || mimeType.includes("excel") || mimeType.includes("xls")) return { icon: Layers, color: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (mimeType.includes("csv"))   return { icon: Layers,    color: "text-teal-400",    bg: "bg-teal-500/10" };
  if (mimeType.includes("json"))  return { icon: FileText,  color: "text-amber-400",   bg: "bg-amber-500/10" };
  return                                { icon: FileText,   color: "text-violet-400",  bg: "bg-violet-500/10" };
}

function StatusBadge({ status }: { status: SocialBotDocument["status"] }) {
  if (status === "READY")      return <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400"><CheckCircle2 className="h-2.5 w-2.5" />Ready</span>;
  if (status === "PROCESSING") return <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-400"><Loader2 className="h-2.5 w-2.5 animate-spin" />Processing</span>;
  return                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-400"><AlertCircle className="h-2.5 w-2.5" />Failed</span>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatbotKnowledge({ initialDocuments }: { initialDocuments: SocialBotDocument[] }) {
  const [docs, setDocs]             = useState(initialDocuments);
  const [uploading, setUploading]   = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const [toast, setToast]           = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [progress, setProgress]     = useState<{ current: number; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.size > 0);
    if (!arr.length) return;
    setUploading(true);
    setProgress({ current: 0, total: arr.length });
    let done = 0;

    for (const file of arr) {
      const fd = new FormData();
      fd.append("files", file);
      try {
        const res = await fetch("/api/social-bot/documents", { method: "POST", body: fd });
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) { showToast("err", json.error ?? `Failed to upload ${file.name}`); }
      } catch {
        showToast("err", `Failed to upload ${file.name}`);
      }
      done++;
      setProgress({ current: done, total: arr.length });
    }

    const refreshRes = await fetch("/api/social-bot/workspace").catch(() => null);
    if (refreshRes?.ok) {
      const data = (await refreshRes.json().catch(() => null)) as { documents?: SocialBotDocument[] } | null;
      if (data?.documents) setDocs(data.documents);
    }

    setUploading(false);
    setProgress(null);
    showToast("ok", `${done} file${done === 1 ? "" : "s"} uploaded and indexed.`);
  }

  async function deleteDoc(docId: string) {
    setDeleting(docId);
    try {
      const res = await fetch("/api/social-bot/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId })
      });
      const json = (await res.json().catch(() => ({}))) as { documents?: SocialBotDocument[]; error?: string };
      if (res.ok && json.documents) { setDocs(json.documents); showToast("ok", "Document removed."); }
      else showToast("err", json.error ?? "Delete failed.");
    } catch {
      showToast("err", "Delete failed.");
    } finally {
      setDeleting(null);
    }
  }

  async function retrain() {
    setRetraining(true);
    try {
      const res = await fetch("/api/social-bot/documents/retrain", { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { message?: string; documents?: SocialBotDocument[]; error?: string };
      if (res.ok) {
        if (json.documents) setDocs(json.documents);
        showToast("ok", json.message ?? "Retraining complete.");
      } else {
        showToast("err", json.error ?? "Retraining failed.");
      }
    } catch {
      showToast("err", "Retraining failed.");
    } finally {
      setRetraining(false);
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void uploadFiles(e.dataTransfer.files);
  }, []);

  const totalChunks = docs.reduce((s, d) => s + d.chunkCount, 0);
  const readyDocs   = docs.filter((d) => d.status === "READY").length;

  return (
    <div className="min-h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Knowledge Base</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Train your AI with documents — PDFs, text files, spreadsheets and more</p>
        </div>
        <button
          type="button"
          onClick={() => void retrain()}
          disabled={retraining || docs.length === 0}
          className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-600 dark:text-violet-400 transition hover:bg-violet-100 dark:hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {retraining ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {retraining ? "Retraining…" : "Retrain AI"}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
          toast.type === "ok" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-rose-500/20 bg-rose-500/10 text-rose-300")}>
          {toast.type === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Documents", value: docs.length,   icon: BookOpen,     color: "text-violet-400",  glow: "bg-violet-500/10" },
          { label: "Ready",           value: readyDocs,      icon: CheckCircle2, color: "text-emerald-400", glow: "bg-emerald-500/10" },
          { label: "Knowledge Chunks", value: totalChunks,  icon: Zap,          color: "text-amber-400",   glow: "bg-amber-500/10" }
        ].map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-4">
            <div className={cn("mb-2 flex h-9 w-9 items-center justify-center rounded-xl", s.glow)}>
              <s.icon className={cn("h-4 w-4", s.color)} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-white/40">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition",
          dragOver
            ? "border-violet-500/60 bg-violet-500/[0.07]"
            : "border-gray-200 dark:border-white/[0.1] hover:border-violet-400 dark:hover:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/[0.05]"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className={cn("mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition", dragOver ? "bg-violet-500/20" : "bg-gray-100 dark:bg-white/[0.05]")}>
          {uploading
            ? <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
            : <UploadCloud className={cn("h-7 w-7 transition", dragOver ? "text-violet-300" : "text-gray-400 dark:text-white/30")} />
          }
        </div>
        {uploading && progress ? (
          <>
            <p className="font-semibold text-gray-700 dark:text-white/80">Uploading {progress.current} / {progress.total}…</p>
            <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-white/[0.08]">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
            </div>
          </>
        ) : (
          <>
            <p className="font-semibold text-gray-700 dark:text-white/70">Drag & drop files here</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-white/30">PDF, TXT, MD, CSV, DOCX, XLSX, JSON — up to 10 MB each</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] transition hover:from-violet-500 hover:to-purple-500"
            >
              <UploadCloud className="h-4 w-4" />
              Browse files
            </button>
          </>
        )}
        <input ref={fileRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={(e) => { if (e.target.files) void uploadFiles(e.target.files); e.target.value = ""; }} />
      </div>

      {/* Documents list */}
      {docs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.1] py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/[0.04]">
            <BookOpen className="h-6 w-6 text-gray-300 dark:text-white/20" />
          </div>
          <p className="text-sm text-gray-400 dark:text-white/30">No documents yet — upload your first training file above</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-white/30">Training documents</p>
            <p className="text-[11px] text-gray-400 dark:text-white/25">{docs.length} file{docs.length !== 1 ? "s" : ""}</p>
          </div>
          {docs.map((doc) => {
            const fi = fileIcon(doc.mimeType);
            const Icon = fi.icon;
            return (
              <div key={doc._id} className="group flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-4 py-3.5 shadow-sm transition hover:border-gray-300 dark:hover:border-white/[0.12] hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                {/* File icon */}
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", fi.bg)}>
                  <Icon className={cn("h-5 w-5", fi.color)} />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[13px] font-semibold text-gray-800 dark:text-white/90">{doc.fileName}</p>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-400 dark:text-white/30">
                    {doc.chunkCount > 0 && (
                      <span className="flex items-center gap-1"><Layers className="h-2.5 w-2.5" />{doc.chunkCount} chunks</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  {doc.textPreview && (
                    <p className="mt-1.5 line-clamp-1 text-[11px] text-gray-400 dark:text-white/20">{doc.textPreview}</p>
                  )}
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => void deleteDoc(doc._id)}
                  disabled={deleting === doc._id}
                  className="shrink-0 rounded-lg p-2 text-gray-300 dark:text-white/20 opacity-0 transition hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 group-hover:opacity-100 disabled:opacity-50"
                >
                  {deleting === doc._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Retrain info panel */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.02] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
            <Zap className="h-5 w-5 text-violet-500 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-700 dark:text-white/80">How retraining works</p>
            <p className="mt-1 text-[12px] leading-5 text-gray-500 dark:text-white/35">
              When you click <strong className="text-gray-700 dark:text-white/50">Retrain AI</strong>, the system re-generates vector embeddings for all your knowledge chunks using the latest Gemini embedding model. This improves retrieval accuracy without re-uploading files. Run after adding new documents or if AI responses seem outdated.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["PDF Training", "Text & Markdown", "CSV / Excel", "DOCX Support", "Auto-chunking", "Semantic Search"].map((tag) => (
                <span key={tag} className="rounded-full border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-white/40">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Retrain inline progress */}
      {retraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#0e0e22] p-8 shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15">
              <RefreshCw className="h-7 w-7 animate-spin text-violet-500 dark:text-violet-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">Retraining in progress…</p>
            <p className="text-center text-sm text-gray-500 dark:text-white/40">Re-generating embeddings for all chunks.<br />This may take a moment.</p>
          </div>
        </div>
      )}
    </div>
  );
}
