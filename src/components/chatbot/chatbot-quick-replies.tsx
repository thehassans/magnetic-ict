"use client";

import { useState } from "react";
import {
  Clipboard,
  ClipboardCheck,
  Hash,
  MessageSquarePlus,
  Plus,
  Trash2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotQuickReply } from "@/lib/social-bot-types";

const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/25 focus:border-violet-400 dark:focus:border-violet-500/60 focus:bg-gray-50 dark:focus:bg-white/[0.06] transition";
const labelCls = "mb-1.5 block text-xs font-medium text-gray-500 dark:text-white/45";

export function ChatbotQuickReplies({ initialReplies }: { initialReplies: SocialBotQuickReply[] }) {
  const [replies, setReplies] = useState(initialReplies);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function resetForm() {
    setTitle("");
    setShortcut("");
    setBody("");
    setShowForm(false);
  }

  async function handleSave() {
    if (!title.trim() || !body.trim()) { showToast("err", "Title and message body are required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/social-bot/quick-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), shortcut: shortcut.trim(), body: body.trim() })
      });
      const json = (await res.json()) as { quickReplies?: SocialBotQuickReply[]; error?: string };
      if (res.ok && json.quickReplies) {
        setReplies(json.quickReplies);
        showToast("ok", "Quick reply saved.");
        resetForm();
      } else {
        showToast("err", json.error ?? "Save failed.");
      }
    } catch {
      showToast("err", "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch("/api/social-bot/quick-replies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const json = (await res.json()) as { quickReplies?: SocialBotQuickReply[]; error?: string };
      if (res.ok && json.quickReplies) {
        setReplies(json.quickReplies);
        showToast("ok", "Deleted.");
      } else {
        showToast("err", json.error ?? "Delete failed.");
      }
    } catch {
      showToast("err", "Delete failed.");
    } finally {
      setDeleting(null);
    }
  }

  function copyBody(id: string, text: string) {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
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

      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Quick Replies</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Canned response templates for faster agent replies</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition"
        >
          <Plus className="h-4 w-4" />
          New Reply
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {showForm && (
          <div className="rounded-2xl border border-violet-200 dark:border-violet-500/25 bg-violet-50 dark:bg-violet-500/[0.07] p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-white/80 flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-violet-500" />
              New Quick Reply
            </h2>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Greeting, Order Status" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Shortcut <span className="text-gray-400 dark:text-white/25">(optional)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-white/30"><Hash className="h-3.5 w-3.5" /></span>
                  <input value={shortcut} onChange={(e) => setShortcut(e.target.value)} placeholder="greeting" className={cn(inputCls, "pl-8")} />
                </div>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-white/25">Type this shortcut in the inbox to quickly insert this reply</p>
              </div>
              <div>
                <label className={labelCls}>Message Body *</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hello! Thanks for reaching out. How can I help you today?" rows={4} className={cn(inputCls, "resize-none")} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
              >
                <Zap className="h-3.5 w-3.5" />
                {saving ? "Saving…" : "Save Reply"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-4 py-2 text-sm font-medium text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {replies.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-500/10">
              <MessageSquarePlus className="h-6 w-6 text-violet-500 dark:text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-white/70">No quick replies yet</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-white/30">Create templates to speed up agent responses</p>
            <button onClick={() => setShowForm(true)} className="mt-4 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition">
              Create First Reply
            </button>
          </div>
        ) : (
          replies.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03]">
              <div className="border-b border-gray-100 dark:border-white/[0.05] px-5 py-3.5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30">Saved Replies</p>
                <span className="rounded-full bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400">{replies.length}</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {replies.map((r) => (
                  <div key={r._id} className="group flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                      <MessageSquarePlus className="h-4 w-4 text-violet-500 dark:text-violet-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white/85">{r.title}</span>
                        {r.shortcut && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 text-[11px] font-mono text-gray-500 dark:text-white/40">
                            <Hash className="h-2.5 w-2.5" />{r.shortcut}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-white/40 line-clamp-2">{r.body}</p>
                      <p className="mt-1 text-[11px] text-gray-300 dark:text-white/20">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={() => copyBody(r._id, r.body)}
                        title="Copy message"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-white transition"
                      >
                        {copied === r._id ? <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Clipboard className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { void handleDelete(r._id); }}
                        disabled={deleting === r._id}
                        title="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-white/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 transition disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/25">How it works</h3>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-white/40">
            <li className="flex items-start gap-2"><span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-violet-100 dark:bg-violet-500/15 text-center text-[10px] font-bold leading-4 text-violet-600 dark:text-violet-400">1</span>Create reply templates with an optional shortcut keyword</li>
            <li className="flex items-start gap-2"><span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-violet-100 dark:bg-violet-500/15 text-center text-[10px] font-bold leading-4 text-violet-600 dark:text-violet-400">2</span>In the inbox, copy any reply to your clipboard instantly</li>
            <li className="flex items-start gap-2"><span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-violet-100 dark:bg-violet-500/15 text-center text-[10px] font-bold leading-4 text-violet-600 dark:text-violet-400">3</span>Paste into any conversation for consistent, fast responses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
