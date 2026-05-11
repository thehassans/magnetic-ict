"use client";

import { useRef, useState } from "react";
import { Bot, Camera, CheckCircle2, Loader2, MessageCircle, Plus, Trash2, Wand2, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotAgent, SocialChannel } from "@/lib/social-bot-types";

const CHANNELS: SocialChannel[] = ["WHATSAPP", "INSTAGRAM", "MESSENGER"];

const emptyForm = { name: "", description: "", instructions: "", avatarDataUrl: "", channels: [] as SocialChannel[], isActive: true };

export function ChatbotAgents({ initialAgents }: { initialAgents: SocialBotAgent[] }) {
  const [agents, setAgents] = useState(initialAgents);
  const [modal, setModal] = useState<{ open: boolean; editing: SocialBotAgent | null }>({ open: false, editing: null });
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function openCreate() {
    setForm(emptyForm);
    setModal({ open: true, editing: null });
  }

  function openEdit(agent: SocialBotAgent) {
    setForm({ name: agent.name, description: agent.description, instructions: agent.instructions, avatarDataUrl: agent.avatarDataUrl, channels: [...agent.channels], isActive: agent.isActive });
    setModal({ open: true, editing: agent });
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 150000) { showToast("err", "Image too large. Max 150 KB."); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatarDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function toggleChannel(ch: SocialChannel) {
    setForm((f) => ({ ...f, channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch] }));
  }

  async function save() {
    if (!form.name.trim()) { showToast("err", "Agent name is required."); return; }
    setSaving(true);
    try {
      if (modal.editing) {
        await fetch("/api/social-bot/agents", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: modal.editing._id, ...form })
        });
        setAgents((prev) => prev.map((a) => a._id === modal.editing!._id ? { ...a, ...form } : a));
        showToast("ok", "Agent updated.");
      } else {
        const r = await fetch("/api/social-bot/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        const created = await r.json() as SocialBotAgent;
        setAgents((prev) => [created, ...prev]);
        showToast("ok", "Agent created.");
      }
      setModal({ open: false, editing: null });
    } catch {
      showToast("err", "Failed to save agent.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAgent(id: string) {
    setDeleting(id);
    await fetch("/api/social-bot/agents", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: id }) });
    setAgents((prev) => prev.filter((a) => a._id !== id));
    setDeleting(null);
    showToast("ok", "Agent deleted.");
  }

  async function toggleActive(agent: SocialBotAgent) {
    await fetch("/api/social-bot/agents", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: agent._id, isActive: !agent.isActive }) });
    setAgents((prev) => prev.map((a) => a._id === agent._id ? { ...a, isActive: !a.isActive } : a));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">AI Agents</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and manage intelligent agents for each channel.</p>
        </div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700">
          <Plus className="h-4 w-4" />
          New Agent
        </button>
      </div>

      {toast && (
        <div className={cn("rounded-xl px-4 py-3 text-sm", toast.type === "ok" ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200" : "border border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200")}>
          {toast.msg}
        </div>
      )}

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 py-20 dark:border-white/20">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-400/10">
            <Bot className="h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-700 dark:text-slate-200">No agents yet</p>
            <p className="mt-1 text-sm text-slate-400">Create your first AI agent to start automating conversations.</p>
          </div>
          <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
            <Wand2 className="h-4 w-4" /> Create Agent
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent._id} className="group rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {agent.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={agent.avatarDataUrl} alt={agent.name} className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{agent.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn("h-2 w-2 rounded-full", agent.isActive ? "bg-emerald-400" : "bg-slate-300")} />
                      <span className="text-xs text-slate-400">{agent.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button type="button" onClick={() => openEdit(agent)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10">
                    <Zap className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => void deleteAgent(agent._id)} disabled={deleting === agent._id} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-400/10">
                    {deleting === agent._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              {agent.description && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{agent.description}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {agent.channels.map((ch) => (
                  <span key={ch} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    <MessageCircle className="h-2.5 w-2.5" />{ch}
                  </span>
                ))}
              </div>
              <button type="button" onClick={() => void toggleActive(agent)} className={cn("mt-4 w-full rounded-xl py-2 text-xs font-semibold transition", agent.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400")}>
                {agent.isActive ? <><CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />Active — click to deactivate</> : "Activate agent"}
              </button>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal({ open: false, editing: null })} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <h2 className="font-semibold text-slate-950 dark:text-white">{modal.editing ? "Edit Agent" : "New AI Agent"}</h2>
              <button type="button" onClick={() => setModal({ open: false, editing: null })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-5 p-5">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => fileRef.current?.click()} className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-violet-400 hover:bg-violet-50 dark:border-white/20 dark:bg-white/5">
                  {form.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.avatarDataUrl} alt="avatar" className="h-full w-full rounded-2xl object-cover" />
                  ) : <Camera className="h-6 w-6" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Agent Name *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Sales Agent" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none focus:border-violet-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                    <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What does this agent do?" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none focus:border-violet-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">AI Instructions</label>
                <textarea value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} rows={5} placeholder="You are a helpful support agent for [company]. Your job is to..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-950 outline-none focus:border-violet-400 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <p className="mt-1 text-xs text-slate-400">{form.instructions.length}/4000 characters</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">Channels</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((ch) => (
                    <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                      className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                        form.channels.includes(ch) ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-400/40 dark:bg-violet-400/10 dark:text-violet-300" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400")}>
                      <MessageCircle className="h-3 w-3" />{ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full border transition", form.isActive ? "border-violet-500 bg-violet-500" : "border-slate-300 bg-slate-100 dark:border-white/20 dark:bg-white/10")}>
                  <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", form.isActive ? "translate-x-5" : "translate-x-0.5")} />
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-300">Active</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-white/10">
              <button type="button" onClick={() => setModal({ open: false, editing: null })} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300">
                Cancel
              </button>
              <button type="button" onClick={() => void save()} disabled={saving} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {modal.editing ? "Save changes" : "Create agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
