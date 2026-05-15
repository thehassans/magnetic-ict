"use client";

import { useRef, useState } from "react";
import { Bot, Camera, CheckCircle2, FileText, Globe, Loader2, MessageCircle, Mic, Plus, Trash2, Wand2, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotAgent, SocialBotDocument, SocialChannel } from "@/lib/social-bot-types";

const CHANNELS: SocialChannel[] = ["WHATSAPP", "INSTAGRAM", "MESSENGER"];

const VOICE_CONFIG: Array<{ code: string; label: string; dialects: Array<{ id: string; label: string }> }> = [
  { code: "en-US", label: "English", dialects: [
    { id: "en-US", label: "US (General American)" },
    { id: "en-GB", label: "UK (British RP)" },
    { id: "en-AU", label: "Australian" },
    { id: "en-CA", label: "Canadian" },
    { id: "en-IN", label: "Indian" },
    { id: "en-NZ", label: "New Zealand" },
    { id: "en-ZA", label: "South African" },
    { id: "en-IE", label: "Irish" },
    { id: "en-SG", label: "Singaporean" },
    { id: "en-PH", label: "Filipino" },
  ]},
  { code: "ar-SA", label: "Arabic (\u0627\u0644\u0639\u0631\u0628\u064a\u0629)", dialects: [
    { id: "ar-SA", label: "Saudi Arabian" },
    { id: "ar-EG", label: "Egyptian" },
    { id: "ar-MA", label: "Moroccan (Darija)" },
    { id: "ar-DZ", label: "Algerian" },
    { id: "ar-TN", label: "Tunisian" },
    { id: "ar-SY", label: "Syrian (Levantine)" },
    { id: "ar-IQ", label: "Iraqi (Mesopotamian)" },
    { id: "ar-AE", label: "Emirati (Gulf)" },
    { id: "ar-JO", label: "Jordanian" },
    { id: "ar-LY", label: "Libyan" },
  ]},
  { code: "ur-PK", label: "Urdu (\u0627\u0631\u062f\u0648)", dialects: [
    { id: "ur-PK", label: "Pakistani Standard" },
    { id: "ur-IN", label: "Indian Urdu" },
    { id: "ur-PK", label: "Lahori" },
    { id: "ur-PK", label: "Karachi" },
    { id: "ur-PK", label: "Peshawari" },
    { id: "ur-PK", label: "Multani" },
    { id: "ur-PK", label: "Quetta" },
    { id: "ur-IN", label: "Lucknowi" },
    { id: "ur-IN", label: "Hyderabadi" },
    { id: "ur-IN", label: "Delhi" },
  ]},
  { code: "hi-IN", label: "Hindi (\u0939\u093f\u0902\u0926\u0940)", dialects: [
    { id: "hi-IN", label: "Standard (Delhi)" },
    { id: "hi-IN", label: "Mumbai Hindi" },
    { id: "hi-IN", label: "Kolkata Hindi" },
    { id: "hi-IN", label: "Lucknow Hindi" },
    { id: "hi-IN", label: "Bhopal Hindi" },
    { id: "hi-IN", label: "Jaipur Hindi" },
    { id: "hi-IN", label: "Varanasi Hindi" },
    { id: "hi-IN", label: "Patna Hindi" },
    { id: "hi-IN", label: "Hyderabad Hindi" },
    { id: "hi-IN", label: "Pune Hindi" },
  ]},
  { code: "bn-BD", label: "Bengali (\u09ac\u09be\u0982\u09b2\u09be)", dialects: [
    { id: "bn-BD", label: "Bangladeshi (Dhaka)" },
    { id: "bn-IN", label: "West Bengali (Kolkata)" },
    { id: "bn-BD", label: "Chittagong" },
    { id: "bn-BD", label: "Sylheti" },
    { id: "bn-BD", label: "Rajshahi" },
    { id: "bn-BD", label: "Barishal" },
    { id: "bn-BD", label: "Comilla" },
    { id: "bn-IN", label: "Murshidabad" },
    { id: "bn-IN", label: "Bardhaman" },
    { id: "bn-IN", label: "Tripura" },
  ]},
  { code: "fr-FR", label: "French", dialects: [
    { id: "fr-FR", label: "Metropolitan French" },
    { id: "fr-CA", label: "Canadian (Qu\u00e9b\u00e9cois)" },
    { id: "fr-BE", label: "Belgian" },
    { id: "fr-CH", label: "Swiss" },
    { id: "fr-MA", label: "Moroccan" },
    { id: "fr-TN", label: "Tunisian" },
    { id: "fr-DZ", label: "Algerian" },
    { id: "fr-SN", label: "Senegalese" },
    { id: "fr-CM", label: "Cameroonian" },
    { id: "fr-CI", label: "Ivorian" },
  ]},
  { code: "es-ES", label: "Spanish", dialects: [
    { id: "es-ES", label: "Castilian (Spain)" },
    { id: "es-MX", label: "Mexican" },
    { id: "es-AR", label: "Argentine" },
    { id: "es-CO", label: "Colombian" },
    { id: "es-CL", label: "Chilean" },
    { id: "es-PE", label: "Peruvian" },
    { id: "es-VE", label: "Venezuelan" },
    { id: "es-EC", label: "Ecuadorian" },
    { id: "es-GT", label: "Guatemalan" },
    { id: "es-CU", label: "Cuban" },
  ]},
  { code: "de-DE", label: "German", dialects: [
    { id: "de-DE", label: "Standard German" },
    { id: "de-AT", label: "Austrian" },
    { id: "de-CH", label: "Swiss German" },
    { id: "de-DE", label: "Bavarian" },
    { id: "de-DE", label: "Saxon" },
    { id: "de-DE", label: "Berlin" },
    { id: "de-DE", label: "Hamburg" },
    { id: "de-DE", label: "Ruhrgebiet" },
    { id: "de-AT", label: "Viennese" },
    { id: "de-CH", label: "Zurich" },
  ]},
  { code: "zh-CN", label: "Chinese (\u4e2d\u6587)", dialects: [
    { id: "zh-CN", label: "Mandarin (Mainland)" },
    { id: "zh-TW", label: "Taiwanese Mandarin" },
    { id: "zh-HK", label: "Cantonese (Hong Kong)" },
    { id: "zh-MO", label: "Macanese" },
    { id: "zh-SG", label: "Singaporean Chinese" },
    { id: "zh-CN", label: "Beijing Hua" },
    { id: "zh-CN", label: "Shanghai Hua" },
    { id: "zh-CN", label: "Sichuan Hua" },
    { id: "zh-TW", label: "Taipei Mandarin" },
    { id: "zh-HK", label: "Guangzhou Cantonese" },
  ]},
  { code: "pt-BR", label: "Portuguese", dialects: [
    { id: "pt-BR", label: "Brazilian (S\u00e3o Paulo)" },
    { id: "pt-PT", label: "European Portuguese" },
    { id: "pt-BR", label: "Brazilian (Rio)" },
    { id: "pt-BR", label: "Brazilian (Ba\u00eda)" },
    { id: "pt-BR", label: "Brazilian (Minas)" },
    { id: "pt-BR", label: "Brazilian (Porto Alegre)" },
    { id: "pt-AO", label: "Angolan" },
    { id: "pt-MZ", label: "Mozambican" },
    { id: "pt-CV", label: "Cape Verdean" },
    { id: "pt-PT", label: "Lisbon Portuguese" },
  ]},
  { code: "tr-TR", label: "Turkish", dialects: [
    { id: "tr-TR", label: "Standard Turkish" },
    { id: "tr-TR", label: "Istanbul" },
    { id: "tr-TR", label: "Ankara" },
    { id: "tr-TR", label: "Izmir" },
    { id: "tr-TR", label: "Black Sea (Karadeniz)" },
    { id: "tr-TR", label: "Eastern Anatolian" },
    { id: "tr-TR", label: "Aegean" },
    { id: "tr-TR", label: "Mediterranean" },
    { id: "tr-TR", label: "Central Anatolian" },
    { id: "tr-TR", label: "Thracian" },
  ]},
  { code: "ru-RU", label: "Russian", dialects: [
    { id: "ru-RU", label: "Standard Russian (Moscow)" },
    { id: "ru-RU", label: "Saint Petersburg" },
    { id: "ru-RU", label: "Siberian" },
    { id: "ru-RU", label: "Ural" },
    { id: "ru-RU", label: "Volga" },
    { id: "ru-RU", label: "Southern" },
    { id: "ru-RU", label: "Northern" },
    { id: "ru-RU", label: "Far Eastern" },
    { id: "ru-RU", label: "Caucasian" },
    { id: "ru-RU", label: "Central" },
  ]},
];

const emptyForm = { name: "", description: "", instructions: "", avatarDataUrl: "", channels: [] as SocialChannel[], documentIds: [] as string[], isActive: true, language: "en-US", voiceId: "en-US" };

export function ChatbotAgents({ initialAgents, initialDocuments }: { initialAgents: SocialBotAgent[]; initialDocuments: SocialBotDocument[] }) {
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
    setForm({ name: agent.name, description: agent.description, instructions: agent.instructions, avatarDataUrl: agent.avatarDataUrl, channels: [...agent.channels], documentIds: [...(agent.documentIds ?? [])], isActive: agent.isActive, language: agent.language || "en-US", voiceId: agent.voiceId || "en-US" });
    setModal({ open: true, editing: agent });
  }

  function toggleDoc(docId: string) {
    setForm((f) => ({ ...f, documentIds: f.documentIds.includes(docId) ? f.documentIds.filter((d) => d !== docId) : [...f.documentIds, docId] }));
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
        showToast("ok", "Agent created. Assign to a chat to start responding.");
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

  const inputCls = "w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/25 focus:border-violet-400 dark:focus:border-violet-500/60 focus:bg-gray-50 dark:focus:bg-white/[0.06] transition";

  return (
    <div className="min-h-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">AI Agents</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Create and manage intelligent agents for each channel</p>
        </div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] transition hover:from-violet-500 hover:to-purple-500">
          <Plus className="h-4 w-4" />
          New Agent
        </button>
      </div>

      {toast && (
        <div className={cn("rounded-xl border px-4 py-3 text-sm", toast.type === "ok" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-rose-500/20 bg-rose-500/10 text-rose-300")}>
          {toast.msg}
        </div>
      )}

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.1] py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15">
            <Bot className="h-7 w-7 text-violet-300" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-600 dark:text-white/70">No agents yet</p>
            <p className="mt-1 text-sm text-gray-400 dark:text-white/30">Create your first AI agent to start automating conversations</p>
          </div>
          <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:from-violet-500 hover:to-purple-500 transition">
            <Wand2 className="h-4 w-4" /> Create Agent
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent._id} className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-5 shadow-sm transition hover:border-gray-300 dark:hover:border-white/[0.12] hover:bg-gray-50 dark:hover:bg-white/[0.05]">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-600/10 blur-2xl" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {agent.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={agent.avatarDataUrl} alt={agent.name} className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20">
                      <Bot className="h-5 w-5 text-violet-300" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white/90">{agent.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full", agent.isActive ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.7)]" : "bg-white/20")} />
                      <span className="text-[11px] text-gray-500 dark:text-white/35">{agent.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button type="button" onClick={() => openEdit(agent)} className="rounded-lg p-1.5 text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/[0.07] hover:text-violet-600 dark:hover:text-violet-300">
                    <Zap className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => void deleteAgent(agent._id)} disabled={deleting === agent._id} className="rounded-lg p-1.5 text-gray-400 dark:text-white/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-300">
                    {deleting === agent._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              {agent.description && <p className="mt-3 text-[13px] text-gray-500 dark:text-white/35 line-clamp-2">{agent.description}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {(agent.language || agent.voiceId) && (
                  <span className="flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400/80">
                    <Globe className="h-2.5 w-2.5" />{VOICE_CONFIG.find((v) => v.dialects.some((d) => d.id === (agent.voiceId || agent.language)))?.dialects.find((d) => d.id === (agent.voiceId || agent.language))?.label ?? agent.voiceId ?? agent.language}
                  </span>
                )}
                {agent.channels.map((ch) => (
                  <span key={ch} className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-white/50">
                    <MessageCircle className="h-2.5 w-2.5" />{ch}
                  </span>
                ))}
                {(agent.documentIds?.length ?? 0) > 0 && (
                  <span className="flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400/80">
                    <FileText className="h-2.5 w-2.5" />{agent.documentIds.length} trained
                  </span>
                )}
              </div>
              <button type="button" onClick={() => void toggleActive(agent)} className={cn("mt-4 w-full rounded-xl py-2 text-xs font-semibold transition", agent.isActive ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20" : "bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/[0.08] hover:text-gray-700 dark:hover:text-white/60")}>
                {agent.isActive ? <><CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />Active — click to deactivate</> : "Activate agent"}
              </button>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setModal({ open: false, editing: null })} />
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#0e0e22] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-violet-600/15 blur-3xl" />
            </div>
            <div className="relative flex items-center justify-between border-b border-gray-200 dark:border-white/[0.07] px-5 py-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">{modal.editing ? "Edit Agent" : "New AI Agent"}</h2>
              <button type="button" onClick={() => setModal({ open: false, editing: null })} className="rounded-lg p-1.5 text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/[0.07] hover:text-gray-700 dark:hover:text-white/70">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative space-y-5 p-5">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => fileRef.current?.click()} className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/[0.12] bg-gray-50 dark:bg-white/[0.03] text-gray-400 dark:text-white/25 transition hover:border-violet-400 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/10">
                  {form.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.avatarDataUrl} alt="avatar" className="h-full w-full rounded-2xl object-cover" />
                  ) : <Camera className="h-6 w-6" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Agent Name *</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Sales Agent" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Description</label>
                    <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What does this agent do?" className={inputCls} />
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">AI Instructions</label>
                <textarea value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} rows={5} placeholder="You are a helpful support agent for [company]…" className={`${inputCls} resize-none`} />
                <p className="mt-1.5 text-right text-[10px] text-gray-400 dark:text-white/20">{form.instructions.length}/4000</p>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Channels</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((ch) => (
                    <button key={ch} type="button" onClick={() => toggleChannel(ch)}
                      className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                        form.channels.includes(ch) ? "border-violet-500/40 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300" : "border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/[0.12]")}>
                      <MessageCircle className="h-3 w-3" />{ch}
                    </button>
                  ))}
                </div>
              </div>
              {initialDocuments.length > 0 && (
                <div>
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Training Documents</label>
                  <p className="mb-2 text-[11px] text-gray-400 dark:text-white/25">Select docs this agent will use as knowledge source</p>
                  <div className="space-y-1.5">
                    {initialDocuments.map((doc) => (
                      <button key={doc._id} type="button" onClick={() => toggleDoc(doc._id)}
                        className={cn("flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[12px] transition",
                          form.documentIds.includes(doc._id)
                            ? "border-violet-500/40 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-200"
                            : "border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] text-gray-600 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/[0.12] hover:text-gray-800 dark:hover:text-white/70")}>
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1 truncate">{doc.fileName}</span>
                        {doc.status === "READY" ? (
                          <span className="shrink-0 text-[9px] font-semibold text-emerald-400/70">READY</span>
                        ) : (
                          <span className="shrink-0 text-[9px] font-semibold text-amber-400/60">{doc.status}</span>
                        )}
                        {form.documentIds.includes(doc._id) && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-violet-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40"><Globe className="inline h-3 w-3 mr-1" />Language</label>
                <div className="flex flex-wrap gap-1.5">
                  {VOICE_CONFIG.map((lang) => (
                    <button key={lang.code} type="button"
                      onClick={() => setForm((f) => ({ ...f, language: lang.code, voiceId: lang.dialects[0].id }))}
                      className={cn("rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition",
                        form.language === lang.code
                          ? "border-violet-500/40 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300"
                          : "border-gray-200 dark:border-white/[0.07] text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/[0.12]")}>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
              {(() => {
                const activeLang = VOICE_CONFIG.find((v) => v.code === form.language);
                if (!activeLang) return null;
                return (
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40"><Mic className="inline h-3 w-3 mr-1" />Voice / Accent</label>
                    <div className="flex flex-wrap gap-1.5">
                      {activeLang.dialects.map((d, i) => (
                        <button key={`${d.id}-${i}`} type="button"
                          onClick={() => setForm((f) => ({ ...f, voiceId: d.id }))}
                          className={cn("rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition",
                            form.voiceId === d.id && i === activeLang.dialects.findIndex((x) => x.id === form.voiceId)
                              ? "border-violet-500/40 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300"
                              : "border-gray-200 dark:border-white/[0.07] text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/[0.12]")}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[10px] text-gray-400 dark:text-white/20">Language code: <span className="font-mono">{form.voiceId}</span> — used for speech recognition and voice output.</p>
                  </div>
                );
              })()}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors", form.isActive ? "bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.4)]" : "bg-gray-200 dark:bg-white/10")}>
                  <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5", form.isActive ? "translate-x-5" : "translate-x-0.5")} />
                </button>
                <span className="text-sm text-gray-500 dark:text-white/50">Active</span>
              </div>
            </div>
            <div className="relative flex justify-end gap-3 border-t border-gray-200 dark:border-white/[0.07] px-5 py-4">
              <button type="button" onClick={() => setModal({ open: false, editing: null })} className="rounded-xl border border-gray-200 dark:border-white/[0.08] px-4 py-2 text-sm font-semibold text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition">
                Cancel
              </button>
              <button type="button" onClick={() => void save()} disabled={saving} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_14px_rgba(124,58,237,0.4)] hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 transition">
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
