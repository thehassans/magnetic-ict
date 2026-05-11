"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Check, ExternalLink, Globe, Loader2, Moon, Plus, Save, Sun, Trash2, Upload, X } from "lucide-react";
import type { PortfolioSite, SocialLink } from "@/lib/portfolio-db";
import { cn } from "@/lib/utils";

type Props = {
  initialSite: PortfolioSite | null;
  userId: string;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/20";
const textareaCls = inputCls + " min-h-[100px] resize-none";

export function PortfolioWorkspace({ initialSite, userId }: Props) {
  const [site, setSite] = useState<PortfolioSite | null>(initialSite);
  const [form, setForm] = useState(initialSite ?? {
    name: "", tagline: "", about: "", phone: "", email: "", address: "",
    subdomain: "", customDomain: "", accentColor: "#6366f1", skills: [] as string[],
    selectedTemplate: "aurora", status: "DRAFT" as const, socialLinks: [] as SocialLink[]
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<"light" | "dark" | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [newSiteMode, setNewSiteMode] = useState(!initialSite);
  const lightRef = useRef<HTMLInputElement>(null);
  const darkRef = useRef<HTMLInputElement>(null);

  function set(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    if (!form.name.trim() || !form.subdomain.trim()) {
      setFeedback({ type: "error", message: "Name and subdomain are required." });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, subdomain: form.subdomain })
      });
      const json = (await res.json()) as { site?: PortfolioSite; error?: string };
      if (!res.ok) { setFeedback({ type: "error", message: json.error ?? "Failed." }); return; }
      setSite(json.site!);
      setForm(json.site!);
      setNewSiteMode(false);
      setFeedback({ type: "success", message: "Portfolio site created!" });
    } finally { setSaving(false); }
  }

  async function handleSave() {
    if (!site) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/portfolio/${site._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = (await res.json()) as { site?: PortfolioSite; error?: string };
      if (!res.ok) { setFeedback({ type: "error", message: json.error ?? "Save failed." }); return; }
      setSite(json.site!);
      setFeedback({ type: "success", message: "Changes saved." });
    } finally { setSaving(false); }
  }

  async function handleLogoUpload(mode: "light" | "dark", file: File | null) {
    if (!file || !site) return;
    setUploadingLogo(mode);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mode", mode);
      const res = await fetch(`/api/portfolio/${site._id}/logo`, { method: "POST", body: fd });
      const json = (await res.json()) as { logoUrl?: string; error?: string };
      if (!res.ok) { setFeedback({ type: "error", message: json.error ?? "Upload failed." }); return; }
      const updated = mode === "light" ? { logoLight: json.logoUrl! } : { logoDark: json.logoUrl! };
      setSite((prev) => prev ? { ...prev, ...updated } : prev);
      setForm((prev) => ({ ...prev, ...updated }));
      setFeedback({ type: "success", message: `${mode === "light" ? "Light" : "Dark"} logo uploaded.` });
    } finally { setUploadingLogo(null); }
  }

  async function handleLogoDelete(mode: "light" | "dark") {
    if (!site) return;
    const res = await fetch(`/api/portfolio/${site._id}/logo?mode=${mode}`, { method: "DELETE" });
    if (res.ok) {
      const updated = mode === "light" ? { logoLight: "" } : { logoDark: "" };
      setSite((prev) => prev ? { ...prev, ...updated } : prev);
      setForm((prev) => ({ ...prev, ...updated }));
    }
  }

  function addSkill() {
    const s = skillInput.trim();
    if (!s || (form.skills ?? []).includes(s)) return;
    set("skills", [...(form.skills ?? []), s]);
    setSkillInput("");
  }

  function removeSkill(s: string) {
    set("skills", (form.skills ?? []).filter((x) => x !== s));
  }

  const siteUrl = site ? `https://${site.subdomain}.magnetic-ict.com` : null;
  const logoLight = site?.logoLight ?? "";
  const logoDark  = site?.logoDark  ?? "";

  if (newSiteMode) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-8 shadow-[0_6px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Set up your portfolio</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a name and subdomain to get started.</p>
          <div className="mt-6 space-y-4">
            <Field label="Your name / business name">
              <input className={inputCls} placeholder="Jane Doe" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Subdomain" hint="yourname.magnetic-ict.com">
              <div className="flex items-center gap-0">
                <input
                  className="flex-1 rounded-l-2xl border border-r-0 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  placeholder="yourname"
                  value={form.subdomain}
                  onChange={(e) => set("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
                <span className="rounded-r-2xl border border-l-0 border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">.magnetic-ict.com</span>
              </div>
            </Field>
          </div>
          {feedback && (
            <p className={cn("mt-4 text-sm", feedback.type === "error" ? "text-rose-600" : "text-emerald-600")}>{feedback.message}</p>
          )}
          <button
            onClick={handleCreate}
            disabled={saving}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-950 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Create portfolio</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div className={cn("rounded-[18px] border px-4 py-3 text-sm", feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300")}>
          {feedback.message}
        </div>
      )}

      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200/70 bg-white/80 px-5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <span className={cn("inline-flex h-2 w-2 rounded-full", form.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-400")} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {form.status === "ACTIVE" ? "Live" : "Draft"}
          </span>
          {siteUrl && (
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline dark:text-violet-400">
              {siteUrl} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => set("status", form.status === "ACTIVE" ? "DRAFT" : "ACTIVE")}
            className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition",
              form.status === "ACTIVE"
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-400/10 dark:text-amber-300"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300"
            )}
          >
            {form.status === "ACTIVE" ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Save</>}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left col */}
        <div className="space-y-5">
          {/* Logos */}
          <div className="rounded-[26px] border border-slate-200/70 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">Logos</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["light", "dark"] as const).map((mode) => {
                const url = mode === "light" ? logoLight : logoDark;
                const uploading = uploadingLogo === mode;
                const ref = mode === "light" ? lightRef : darkRef;
                return (
                  <div key={mode} className={cn("overflow-hidden rounded-[20px] border", mode === "dark" ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white")}>
                    <div className={cn("flex h-20 items-center justify-center", mode === "dark" ? "bg-slate-900" : "bg-slate-50")}>
                      {url ? (
                        <Image src={url} alt={`${mode} logo`} width={160} height={50} className="max-h-12 w-auto object-contain" unoptimized />
                      ) : (
                        <p className="text-xs text-slate-400">{mode === "dark" ? "Dark logo" : "Light logo"}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {mode === "light" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                        {mode === "light" ? "Light" : "Dark"}
                      </span>
                      <label className={cn("ml-auto inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition", "bg-slate-950 text-white hover:bg-violet-700 dark:bg-white dark:text-slate-950")}>
                        {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        {uploading ? "…" : "Upload"}
                        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => void handleLogoUpload(mode, e.target.files?.[0] ?? null)} />
                      </label>
                      {url && (
                        <button onClick={() => void handleLogoDelete(mode)} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-400/10">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Identity */}
          <div className="rounded-[26px] border border-slate-200/70 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">Identity</h3>
            <div className="space-y-4">
              <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Tagline"><input className={inputCls} placeholder="Full-stack developer & designer" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
              <Field label="About"><textarea className={textareaCls} value={form.about} onChange={(e) => set("about", e.target.value)} /></Field>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">
          {/* Contact */}
          <div className="rounded-[26px] border border-slate-200/70 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">Contact</h3>
            <div className="space-y-4">
              <Field label="Phone"><input className={inputCls} type="tel" placeholder="+880 17XX XXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
              <Field label="Email"><input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="Address"><input className={inputCls} placeholder="Dhaka, Bangladesh" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
            </div>
          </div>

          {/* Domain */}
          <div className="rounded-[26px] border border-slate-200/70 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
              <Globe className="h-4 w-4 text-violet-500" /> Domain
            </h3>
            <div className="space-y-4">
              <Field label="Subdomain" hint="Free · yourname.magnetic-ict.com">
                <div className="flex items-center">
                  <input
                    className="flex-1 rounded-l-2xl border border-r-0 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    value={form.subdomain}
                    onChange={(e) => set("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  />
                  <span className="rounded-r-2xl border border-l-0 border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-400 dark:border-white/10 dark:bg-white/[0.04]">.magnetic-ict.com</span>
                </div>
              </Field>
              <Field label="Custom domain" hint="Connect your own domain (CNAME: portfolio.magnetic-ict.com)">
                <input className={inputCls} placeholder="yourdomain.com" value={form.customDomain} onChange={(e) => set("customDomain", e.target.value)} />
              </Field>
              {form.customDomain && (
                <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/60 p-3 text-xs text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300">
                  Add a CNAME record: <strong>{form.customDomain}</strong> → <strong>portfolio.magnetic-ict.com</strong>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-[26px] border border-slate-200/70 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">Skills</h3>
            <div className="flex gap-2">
              <input
                className={cn(inputCls, "flex-1")}
                placeholder="e.g. React"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              />
              <button onClick={addSkill} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white hover:bg-violet-700 dark:bg-white dark:text-slate-950">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {(form.skills ?? []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(form.skills ?? []).map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Accent color */}
          <div className="rounded-[26px] border border-slate-200/70 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-white">Accent colour</h3>
            <div className="flex items-center gap-3">
              <input type="color" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0" />
              <input className={cn(inputCls, "flex-1")} value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Save bar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-8 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(15,23,42,0.12)] transition hover:bg-violet-700 disabled:opacity-60 dark:bg-white dark:text-slate-950"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Save changes</>}
        </button>
      </div>
    </div>
  );
}
