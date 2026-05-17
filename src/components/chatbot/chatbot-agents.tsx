"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, Camera, CheckCircle2, ChevronDown, ChevronUp, FileText, Globe, Link2, Loader2, MessageCircle, Mic, Plus, Search, Send, Trash2, Upload, Wand2, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotAgent, SocialBotDocument, SocialChannel } from "@/lib/social-bot-types";

const CHANNELS: SocialChannel[] = ["WHATSAPP", "INSTAGRAM", "MESSENGER"];

const VOICE_CONFIG: Array<{ code: string; label: string; dialects: Array<{ id: string; label: string }> }> = [
  { code: "en-US", label: "English", dialects: [{ id: "en-US", label: "US (General American)" }, { id: "en-GB", label: "UK (British RP)" }, { id: "en-AU", label: "Australian" }, { id: "en-CA", label: "Canadian" }, { id: "en-IN", label: "Indian" }, { id: "en-NZ", label: "New Zealand" }, { id: "en-ZA", label: "South African" }, { id: "en-IE", label: "Irish" }, { id: "en-SG", label: "Singaporean" }, { id: "en-PH", label: "Filipino" }] },
  { code: "ar-SA", label: "Arabic (العربية)", dialects: [{ id: "ar-SA", label: "Saudi Arabian" }, { id: "ar-EG", label: "Egyptian" }, { id: "ar-MA", label: "Moroccan (Darija)" }, { id: "ar-DZ", label: "Algerian" }, { id: "ar-TN", label: "Tunisian" }, { id: "ar-SY", label: "Syrian (Levantine)" }, { id: "ar-IQ", label: "Iraqi (Mesopotamian)" }, { id: "ar-AE", label: "Emirati (Gulf)" }, { id: "ar-JO", label: "Jordanian" }, { id: "ar-LY", label: "Libyan" }] },
  { code: "ur-PK", label: "Urdu (اردو)", dialects: [{ id: "ur-PK", label: "Pakistani Standard" }, { id: "ur-IN", label: "Indian Urdu" }, { id: "ur-PK", label: "Lahori" }, { id: "ur-PK", label: "Karachi" }, { id: "ur-PK", label: "Peshawari" }, { id: "ur-PK", label: "Multani" }, { id: "ur-PK", label: "Quetta" }, { id: "ur-IN", label: "Lucknowi" }, { id: "ur-IN", label: "Hyderabadi" }, { id: "ur-IN", label: "Delhi" }] },
  { code: "hi-IN", label: "Hindi (हिंदी)", dialects: [{ id: "hi-IN", label: "Standard (Delhi)" }, { id: "hi-IN", label: "Mumbai Hindi" }, { id: "hi-IN", label: "Kolkata Hindi" }, { id: "hi-IN", label: "Lucknow Hindi" }, { id: "hi-IN", label: "Bhopal Hindi" }, { id: "hi-IN", label: "Jaipur Hindi" }, { id: "hi-IN", label: "Varanasi Hindi" }, { id: "hi-IN", label: "Patna Hindi" }, { id: "hi-IN", label: "Hyderabad Hindi" }, { id: "hi-IN", label: "Pune Hindi" }] },
  { code: "bn-BD", label: "Bengali (বাংলা)", dialects: [{ id: "bn-BD", label: "Bangladeshi (Dhaka)" }, { id: "bn-IN", label: "West Bengali (Kolkata)" }, { id: "bn-BD", label: "Chittagong" }, { id: "bn-BD", label: "Sylheti" }, { id: "bn-BD", label: "Rajshahi" }, { id: "bn-BD", label: "Barishal" }, { id: "bn-BD", label: "Comilla" }, { id: "bn-IN", label: "Murshidabad" }, { id: "bn-IN", label: "Bardhaman" }, { id: "bn-IN", label: "Tripura" }] },
  { code: "fr-FR", label: "French", dialects: [{ id: "fr-FR", label: "Metropolitan French" }, { id: "fr-CA", label: "Canadian (Québécois)" }, { id: "fr-BE", label: "Belgian" }, { id: "fr-CH", label: "Swiss" }, { id: "fr-MA", label: "Moroccan" }, { id: "fr-TN", label: "Tunisian" }, { id: "fr-DZ", label: "Algerian" }, { id: "fr-SN", label: "Senegalese" }, { id: "fr-CM", label: "Cameroonian" }, { id: "fr-CI", label: "Ivorian" }] },
  { code: "es-ES", label: "Spanish", dialects: [{ id: "es-ES", label: "Castilian (Spain)" }, { id: "es-MX", label: "Mexican" }, { id: "es-AR", label: "Argentine" }, { id: "es-CO", label: "Colombian" }, { id: "es-CL", label: "Chilean" }, { id: "es-PE", label: "Peruvian" }, { id: "es-VE", label: "Venezuelan" }, { id: "es-EC", label: "Ecuadorian" }, { id: "es-GT", label: "Guatemalan" }, { id: "es-CU", label: "Cuban" }] },
  { code: "de-DE", label: "German", dialects: [{ id: "de-DE", label: "Standard German" }, { id: "de-AT", label: "Austrian" }, { id: "de-CH", label: "Swiss German" }, { id: "de-DE", label: "Bavarian" }, { id: "de-DE", label: "Saxon" }, { id: "de-DE", label: "Berlin" }, { id: "de-DE", label: "Hamburg" }, { id: "de-DE", label: "Ruhrgebiet" }, { id: "de-AT", label: "Viennese" }, { id: "de-CH", label: "Zurich" }] },
  { code: "zh-CN", label: "Chinese (中文)", dialects: [{ id: "zh-CN", label: "Mandarin (Mainland)" }, { id: "zh-TW", label: "Taiwanese Mandarin" }, { id: "zh-HK", label: "Cantonese (Hong Kong)" }, { id: "zh-MO", label: "Macanese" }, { id: "zh-SG", label: "Singaporean Chinese" }, { id: "zh-CN", label: "Beijing Hua" }, { id: "zh-CN", label: "Shanghai Hua" }, { id: "zh-CN", label: "Sichuan Hua" }, { id: "zh-TW", label: "Taipei Mandarin" }, { id: "zh-HK", label: "Guangzhou Cantonese" }] },
  { code: "pt-BR", label: "Portuguese", dialects: [{ id: "pt-BR", label: "Brazilian (São Paulo)" }, { id: "pt-PT", label: "European Portuguese" }, { id: "pt-BR", label: "Brazilian (Rio)" }, { id: "pt-BR", label: "Brazilian (Baía)" }, { id: "pt-BR", label: "Brazilian (Minas)" }, { id: "pt-BR", label: "Brazilian (Porto Alegre)" }, { id: "pt-AO", label: "Angolan" }, { id: "pt-MZ", label: "Mozambican" }, { id: "pt-CV", label: "Cape Verdean" }, { id: "pt-PT", label: "Lisbon Portuguese" }] },
  { code: "tr-TR", label: "Turkish", dialects: [{ id: "tr-TR", label: "Standard Turkish" }, { id: "tr-TR", label: "Istanbul" }, { id: "tr-TR", label: "Ankara" }, { id: "tr-TR", label: "Izmir" }, { id: "tr-TR", label: "Black Sea (Karadeniz)" }, { id: "tr-TR", label: "Eastern Anatolian" }, { id: "tr-TR", label: "Aegean" }, { id: "tr-TR", label: "Mediterranean" }, { id: "tr-TR", label: "Central Anatolian" }, { id: "tr-TR", label: "Thracian" }] },
  { code: "ru-RU", label: "Russian", dialects: [{ id: "ru-RU", label: "Standard Russian (Moscow)" }, { id: "ru-RU", label: "Saint Petersburg" }, { id: "ru-RU", label: "Siberian" }, { id: "ru-RU", label: "Ural" }, { id: "ru-RU", label: "Volga" }, { id: "ru-RU", label: "Southern" }, { id: "ru-RU", label: "Northern" }, { id: "ru-RU", label: "Far Eastern" }, { id: "ru-RU", label: "Caucasian" }, { id: "ru-RU", label: "Central" }] },
];

const emptyForm = { name: "", description: "", instructions: "", avatarDataUrl: "", channels: [] as SocialChannel[], documentIds: [] as string[], isActive: true, language: "en-US", voiceId: "en-US" };

type ChatMsg = { id: string; role: "user" | "assistant"; text: string };

function TestAgentPanel({ documentIds, agentName }: { documentIds: string[]; agentName: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  async function send() {
    const text = input.trim();
    if (!text || thinking) return;
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", text };
    const history = messages.map((m) => ({ role: m.role as "user" | "assistant", text: m.text }));
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/social-bot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, documentIds: documentIds.length ? documentIds : undefined })
      });
      const d = await res.json() as { reply?: string; error?: string };
      setMessages((p) => [...p, { id: `a-${Date.now()}`, role: "assistant", text: d.reply ?? d.error ?? "No response." }]);
    } catch {
      setMessages((p) => [...p, { id: `err-${Date.now()}`, role: "assistant", text: "Error — check your AI configuration." }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="flex flex-col h-full border-l border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[#08080f]">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.07] px-4 py-3 shrink-0">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Test AI Agent</p>
          <p className="text-[10px] text-gray-400 dark:text-white/25 mt-0.5">Actions here won&apos;t impact your live setup</p>
        </div>
        <button type="button" onClick={() => setMessages([])} className="rounded-lg border border-gray-200 dark:border-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition">
          Reset Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
              <Bot className="h-5 w-5 text-violet-400" />
            </div>
            <p className="text-xs text-gray-400 dark:text-white/25">
              Send a message to test <span className="font-semibold text-gray-600 dark:text-white/50">{agentName || "this agent"}</span>
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
              m.role === "user"
                ? "bg-violet-600 text-white"
                : "bg-gray-100 dark:bg-white/[0.07] text-gray-800 dark:text-white/80"
            )}>
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-gray-100 dark:bg-white/[0.07] px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-white/30 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-gray-200 dark:border-white/[0.07] p-3 shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Enter message here"
            className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-violet-400 dark:focus:border-violet-500/60 transition"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!input.trim() || thinking}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] hover:bg-violet-500 disabled:opacity-40 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function KnowledgeSourceModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [type, setType] = useState<"file" | "website">("website");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [resync, setResync] = useState("never");
  const [loadSitemap, setLoadSitemap] = useState(true);
  const [maxDepth, setMaxDepth] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const inputCls = "w-full rounded-xl border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-white/[0.04] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/25 focus:border-violet-400 dark:focus:border-violet-500/50 transition";

  async function handleAdd() {
    if (busy) return;
    setBusy(true);
    setStatus("");
    setDone(false);
    try {
      if (type === "website") {
        const rawUrl = url.trim();
        if (!rawUrl) { setStatus("URL is required."); setBusy(false); return; }
        const res = await fetch("/api/social-bot/documents/crawl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: rawUrl, maxPages: maxDepth * 20 })
        });
        const reader = res.body?.getReader();
        const dec = new TextDecoder();
        if (!reader) { setStatus("Stream unavailable."); setBusy(false); return; }
        let buf = "";
        let finished = false;
        while (!finished) {
          const { done: d, value } = await reader.read();
          finished = d;
          if (value) buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const ev = JSON.parse(line.slice(6)) as { type: string; message?: string; title?: string; url?: string };
              if (ev.type === "crawling") setStatus(`Crawling ${ev.url ?? ""}…`);
              if (ev.type === "indexed") setStatus(`Indexed: ${ev.title ?? ev.url ?? ""}`);
              if (ev.type === "done") { setStatus(ev.message ?? "Done!"); setDone(true); finished = true; }
              if (ev.type === "error") { setStatus(`Error: ${ev.message ?? "Unknown"}`); finished = true; }
            } catch { /* parse error */ }
          }
        }
        if (done) { onAdded(); }
      } else {
        const files = fileRef.current?.files;
        if (!files?.length) { setStatus("Select at least one file."); setBusy(false); return; }
        const fd = new FormData();
        Array.from(files).forEach((f) => fd.append("files", f));
        setStatus("Uploading…");
        const r = await fetch("/api/social-bot/documents", { method: "POST", body: fd });
        if (r.ok) { setStatus("Uploaded successfully!"); setDone(true); onAdded(); }
        else { const d = await r.json() as { error?: string }; setStatus(d.error ?? "Upload failed."); }
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#0e0e22] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="relative flex items-center justify-between border-b border-gray-200 dark:border-white/[0.07] px-5 py-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Add AI Knowledge Source</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/[0.07]"><X className="h-4 w-4" /></button>
        </div>
        <div className="relative p-5 space-y-4">
          <p className="text-[12px] text-gray-500 dark:text-white/35">Upload files, articles, help guides, URLs, or any documents related to your business to improve your AI responses.</p>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add knowledge source name" className={inputCls} />
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["file", "website"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                    type === t
                      ? "border-violet-500/40 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300"
                      : "border-gray-200 dark:border-white/[0.07] text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/[0.12]")}>
                  {t === "file" ? <Upload className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                  {t === "file" ? "Upload file" : "Add website"}
                </button>
              ))}
            </div>
          </div>

          {type === "website" ? (
            <>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Website URL</label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com" className={inputCls} />
                <p className="mt-1 text-[10px] text-gray-400 dark:text-white/20">You can add more URLs in Advanced Settings.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Set resync schedule</label>
                <div className="relative">
                  <select value={resync} onChange={(e) => setResync(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                    {["never", "daily", "weekly", "monthly"].map((v) => <option key={v} value={v} className="capitalize bg-white dark:bg-[#0e0e22]">{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-white/25" />
                </div>
              </div>
              <div>
                <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500">
                  Advanced settings {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {showAdvanced && (
                  <div className="mt-3 space-y-3 rounded-xl border border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-white/70">Load URLs from sitemap</span>
                      <button type="button" onClick={() => setLoadSitemap((v) => !v)}
                        className={cn("relative h-5 w-9 rounded-full transition-colors", loadSitemap ? "bg-violet-600" : "bg-gray-300 dark:bg-white/[0.12]")}>
                        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", loadSitemap ? "left-[18px]" : "left-0.5")} />
                      </button>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Max crawling depth</label>
                      <input type="number" min={1} max={10} value={maxDepth} onChange={(e) => setMaxDepth(Math.max(1, parseInt(e.target.value) || 1))} className={inputCls} />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40">Files</label>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.09] bg-gray-50 dark:bg-white/[0.02] px-4 py-8 text-sm text-gray-400 dark:text-white/25 transition hover:border-violet-300 dark:hover:border-violet-500/40 hover:text-violet-500 dark:hover:text-violet-400">
                <Upload className="h-6 w-6" />
                <span>Click to select files</span>
                <span className="text-[10px]">PDF, DOCX, TXT supported</span>
              </button>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.csv" multiple className="hidden" onChange={() => setBusy(false)} />
            </div>
          )}

          {status && (
            <div className={cn("rounded-xl px-3 py-2.5 text-[12px]", done ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-gray-50 dark:bg-white/[0.04] text-gray-500 dark:text-white/50")}>
              {busy && <Loader2 className="inline h-3 w-3 animate-spin mr-1.5" />}
              {status}
            </div>
          )}
        </div>
        <div className="relative flex justify-end gap-3 border-t border-gray-200 dark:border-white/[0.07] px-5 py-4">
          {!done && (
            <>
              <p className="mr-auto self-center text-[10px] text-gray-400 dark:text-white/20">0.00 B / 1.00 MB</p>
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 dark:border-white/[0.08] px-4 py-2 text-sm font-semibold text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition">Cancel</button>
              <button type="button" onClick={() => void handleAdd()} disabled={busy}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_14px_rgba(124,58,237,0.4)] hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 transition">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Done
              </button>
            </>
          )}
          {done && (
            <button type="button" onClick={onClose} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white transition">
              <CheckCircle2 className="h-4 w-4" /> Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatbotAgents({ initialAgents, initialDocuments }: { initialAgents: SocialBotAgent[]; initialDocuments: SocialBotDocument[] }) {
  const [agents, setAgents] = useState(initialAgents);
  const [documents, setDocuments] = useState(initialDocuments);
  const [view, setView] = useState<"list" | "detail">("list");
  const [editingAgent, setEditingAgent] = useState<SocialBotAgent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [docSearch, setDocSearch] = useState("");
  const [showKsModal, setShowKsModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function refreshDocs() {
    const r = await fetch("/api/social-bot/documents", { cache: "no-store" });
    if (r.ok) setDocuments(await r.json() as SocialBotDocument[]);
  }

  function openCreate() {
    setForm(emptyForm);
    setEditingAgent(null);
    setView("detail");
  }

  function openEdit(agent: SocialBotAgent) {
    setForm({ name: agent.name, description: agent.description, instructions: agent.instructions, avatarDataUrl: agent.avatarDataUrl, channels: [...agent.channels], documentIds: [...(agent.documentIds ?? [])], isActive: agent.isActive, language: agent.language || "en-US", voiceId: agent.voiceId || "en-US" });
    setEditingAgent(agent);
    setView("detail");
  }

  function toggleDoc(docId: string) {
    setForm((f) => ({ ...f, documentIds: f.documentIds.includes(docId) ? f.documentIds.filter((d) => d !== docId) : [...f.documentIds, docId] }));
  }

  function toggleChannel(ch: SocialChannel) {
    setForm((f) => ({ ...f, channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch] }));
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 150000) { showToast("err", "Image too large. Max 150 KB."); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatarDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!form.name.trim()) { showToast("err", "Agent name is required."); return; }
    setSaving(true);
    try {
      if (editingAgent) {
        await fetch("/api/social-bot/agents", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: editingAgent._id, ...form }) });
        setAgents((prev) => prev.map((a) => a._id === editingAgent._id ? { ...a, ...form } : a));
        showToast("ok", "Agent saved.");
      } else {
        const r = await fetch("/api/social-bot/agents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        const created = await r.json() as SocialBotAgent;
        setAgents((prev) => [created, ...prev]);
        setEditingAgent(created);
        showToast("ok", "Agent created.");
      }
    } catch { showToast("err", "Failed to save agent."); }
    finally { setSaving(false); }
  }

  async function deleteAgent(id: string) {
    setDeleting(id);
    await fetch("/api/social-bot/agents", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: id }) });
    setAgents((prev) => prev.filter((a) => a._id !== id));
    setDeleting(null);
    setView("list");
  }

  async function toggleActive(agent: SocialBotAgent) {
    await fetch("/api/social-bot/agents", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: agent._id, isActive: !agent.isActive }) });
    setAgents((prev) => prev.map((a) => a._id === agent._id ? { ...a, isActive: !a.isActive } : a));
  }

  const inputCls = "w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/25 focus:border-violet-400 dark:focus:border-violet-500/60 focus:bg-gray-50 dark:focus:bg-white/[0.06] transition";
  const filteredDocs = documents.filter((d) => d.fileName.toLowerCase().includes(docSearch.toLowerCase()) || (d.sourceUrl ?? "").toLowerCase().includes(docSearch.toLowerCase()));

  if (view === "detail") {
    const activeLang = VOICE_CONFIG.find((v) => v.code === form.language);
    return (
      <div className="flex h-full min-h-screen bg-gray-50 dark:bg-[#07070e]">
        {showKsModal && (
          <KnowledgeSourceModal
            onClose={() => setShowKsModal(false)}
            onAdded={() => { void refreshDocs(); setShowKsModal(false); }}
          />
        )}

        {/* ── Left panel ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-white/[0.07] bg-white dark:bg-[#07070e] px-6 py-3.5">
            <button type="button" onClick={() => setView("list")} className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/80 transition">
              <ArrowLeft className="h-4 w-4" />
              Agents
            </button>
            <div className="flex items-center gap-2">
              {toast && (
                <span className={cn("text-xs font-medium px-3 py-1 rounded-lg", toast.type === "ok" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10")}>
                  {toast.msg}
                </span>
              )}
              {editingAgent && (
                <button type="button" onClick={() => void deleteAgent(editingAgent._id)} disabled={deleting === editingAgent._id}
                  className="rounded-xl border border-gray-200 dark:border-white/[0.07] px-3 py-2 text-sm font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition">
                  {deleting === editingAgent._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                </button>
              )}
              <button type="button" onClick={() => void save()} disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 transition">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {editingAgent ? "Save Changes" : "Create Agent"}
              </button>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6 max-w-2xl">
            {/* Agent profile */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.025] p-5 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-white/30">Agent Profile</p>
              <div className="flex items-start gap-4">
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
                <p className="mt-1 text-right text-[10px] text-gray-400 dark:text-white/20">{form.instructions.length}/4000</p>
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
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-white/40"><Globe className="inline h-3 w-3 mr-1" />Language</label>
                <div className="flex flex-wrap gap-1.5">
                  {VOICE_CONFIG.map((lang) => (
                    <button key={lang.code} type="button"
                      onClick={() => setForm((f) => ({ ...f, language: lang.code, voiceId: lang.dialects[0].id }))}
                      className={cn("rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition",
                        form.language === lang.code ? "border-violet-500/40 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300" : "border-gray-200 dark:border-white/[0.07] text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/[0.12]")}>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
              {activeLang && (
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
                </div>
              )}
              <div className="flex items-center gap-3 pt-1">
                <button type="button" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors", form.isActive ? "bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.4)]" : "bg-gray-200 dark:bg-white/10")}>
                  <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5", form.isActive ? "translate-x-5" : "translate-x-0.5")} />
                </button>
                <span className="text-sm text-gray-500 dark:text-white/50">Active</span>
              </div>
            </div>

            {/* Train your AI Agent */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.025] overflow-hidden">
              <div className="border-b border-gray-200 dark:border-white/[0.07] px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Train your AI Agent</h2>
                <p className="mt-0.5 text-[12px] text-gray-500 dark:text-white/35">To improve accuracy, we recommend training your AI Agent with company-specific documents and links.</p>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-white/25" />
                    <input value={docSearch} onChange={(e) => setDocSearch(e.target.value)} placeholder="Search" className="w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 outline-none focus:border-violet-400 dark:focus:border-violet-500/50 transition" />
                  </div>
                  <button type="button" onClick={() => setShowKsModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_12px_rgba(124,58,237,0.3)] hover:from-violet-500 hover:to-purple-500 transition whitespace-nowrap">
                    <Plus className="h-3.5 w-3.5" /> Add AI Knowledge Source
                  </button>
                </div>
                {filteredDocs.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Wand2 className="h-7 w-7 text-gray-300 dark:text-white/15" />
                    <p className="text-sm text-gray-400 dark:text-white/25">No knowledge sources yet</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredDocs.map((doc) => {
                      const enabled = form.documentIds.includes(doc._id);
                      return (
                        <div key={doc._id} className={cn("flex items-center gap-3 rounded-xl border px-3.5 py-3 transition", enabled ? "border-violet-500/20 bg-violet-50/50 dark:bg-violet-500/[0.07]" : "border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02]")}>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.06]">
                            {doc.sourceUrl ? <Globe className="h-3.5 w-3.5 text-sky-500" /> : <FileText className="h-3.5 w-3.5 text-violet-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-gray-800 dark:text-white/80 truncate">{doc.fileName}</p>
                            {doc.sourceUrl && (
                              <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-sky-500 hover:underline truncate block">{doc.sourceUrl}</a>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn("text-[9px] font-bold uppercase tracking-[0.1em]", doc.status === "READY" ? "text-emerald-500" : doc.status === "PROCESSING" ? "text-amber-500" : "text-rose-400")}>{doc.status}</span>
                              {doc.chunkCount > 0 && <span className="text-[9px] text-gray-400 dark:text-white/20">{doc.chunkCount} chunks</span>}
                            </div>
                          </div>
                          <button type="button" onClick={() => toggleDoc(doc._id)}
                            className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", enabled ? "bg-violet-600" : "bg-gray-200 dark:bg-white/[0.12]")}>
                            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", enabled ? "left-[22px]" : "left-0.5")} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel: Test Agent ─────────────────────────────────────── */}
        <div className="w-[400px] shrink-0 sticky top-0 h-screen flex flex-col">
          <TestAgentPanel documentIds={form.documentIds} agentName={form.name} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">AI Agents</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">Create and manage intelligent agents for each channel</p>
        </div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] transition hover:from-violet-500 hover:to-purple-500">
          <Plus className="h-4 w-4" /> New Agent
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
                  <button type="button" onClick={() => void toggleActive(agent)} className="rounded-lg p-1.5 text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/[0.07] hover:text-emerald-600 dark:hover:text-emerald-300">
                    <Zap className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => void deleteAgent(agent._id)} disabled={deleting === agent._id} className="rounded-lg p-1.5 text-gray-400 dark:text-white/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-300">
                    {deleting === agent._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              {agent.description && <p className="mt-3 text-[13px] text-gray-500 dark:text-white/35 line-clamp-2">{agent.description}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
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
              <button type="button" onClick={() => openEdit(agent)} className="mt-4 w-full rounded-xl bg-gray-100 dark:bg-white/[0.05] py-2 text-xs font-semibold text-gray-600 dark:text-white/50 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300 transition">
                Train &amp; Test Agent
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
