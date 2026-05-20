"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2, Moon, Sun, Trash2, Upload } from "lucide-react";
import type { BrandingConfig, BrandingLogoKey } from "@/lib/platform-settings";
import { cn } from "@/lib/utils";

type BrandingEditorProps = {
  value: BrandingConfig;
  onChange: (next: BrandingConfig) => void;
  disabled: boolean;
};

type LogoSlot = {
  key: BrandingLogoKey;
  label: string;
  themeIcon: "light" | "dark";
  hint: string;
};

const slots: { group: string; items: LogoSlot[] }[] = [
  {
    group: "Landing Page / Site",
    items: [
      { key: "siteLogoLight", label: "Light theme logo", themeIcon: "light", hint: "Shown in the public site header and footer on light backgrounds" },
      { key: "siteLogoDark",  label: "Dark theme logo",  themeIcon: "dark",  hint: "Shown in the public site header and footer on dark backgrounds" }
    ]
  },
  {
    group: "Admin Panel",
    items: [
      { key: "adminLogoLight", label: "Light theme logo", themeIcon: "light", hint: "Shown in the admin dashboard on light backgrounds" },
      { key: "adminLogoDark",  label: "Dark theme logo",  themeIcon: "dark",  hint: "Shown in the admin dashboard on dark backgrounds" }
    ]
  },
  {
    group: "Customer Panel",
    items: [
      { key: "customerLogoLight", label: "Light theme logo", themeIcon: "light", hint: "Shown in the customer portal on light backgrounds" },
      { key: "customerLogoDark",  label: "Dark theme logo",  themeIcon: "dark",  hint: "Shown in the customer portal on dark backgrounds" }
    ]
  },
  {
    group: "Magnetic Bot (Chatbot)",
    items: [
      { key: "chatbotLogoLight", label: "Light theme logo", themeIcon: "light", hint: "Shown in the chatbot sidebar when light mode is active" },
      { key: "chatbotLogoDark",  label: "Dark theme logo",  themeIcon: "dark",  hint: "Shown in the chatbot sidebar when dark mode is active" }
    ]
  }
];

function shouldBeUnoptimized(url: string) {
  return url.startsWith("http") || url.startsWith("/uploads/") || url.startsWith("/branding/") || url.toLowerCase().endsWith(".svg");
}

export function BrandingEditor({ value, onChange, disabled }: BrandingEditorProps) {
  const [uploading, setUploading] = useState<BrandingLogoKey | null>(null);
  const [deleting, setDeleting]   = useState<BrandingLogoKey | null>(null);
  const [feedback, setFeedback]   = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleUpload(logoKey: BrandingLogoKey, file: File | null) {
    if (!file) return;
    setUploading(logoKey);
    setFeedback(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch(`/api/admin/branding/${logoKey}`, { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { error?: string; logoUrl?: string; message?: string };
      if (!res.ok) { setFeedback({ type: "error", message: json.error ?? "Upload failed." }); return; }
      if (json.logoUrl) onChange({ ...value, [logoKey]: json.logoUrl });
      setFeedback({ type: "success", message: json.message ?? "Logo updated." });
    } catch {
      setFeedback({ type: "error", message: "Unable to upload logo right now." });
    } finally {
      setUploading(null);
    }
  }

  async function handleDelete(logoKey: BrandingLogoKey) {
    setDeleting(logoKey);
    setFeedback(null);
    try {
      const res  = await fetch(`/api/admin/branding/${logoKey}`, { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) { setFeedback({ type: "error", message: json.error ?? "Delete failed." }); return; }
      onChange({ ...value, [logoKey]: "" });
      setFeedback({ type: "success", message: json.message ?? "Logo removed." });
    } catch {
      setFeedback({ type: "error", message: "Unable to remove logo right now." });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-8">
      {feedback && (
        <div className={`rounded-[20px] border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {feedback.message}
        </div>
      )}

      {slots.map((section) => (
        <div key={section.group}>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">{section.group}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.items.map((slot) => {
              const logoUrl  = value[slot.key] ?? "";
              const busy     = uploading === slot.key || deleting === slot.key;
              const ThemeIcon = slot.themeIcon === "light" ? Sun : Moon;

              return (
                <div key={slot.key} className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50 shadow-[0_6px_24px_rgba(15,23,42,0.04)]">
                  {/* Preview */}
                  <div className={cn("flex h-[88px] items-center justify-center border-b border-slate-200 px-6", slot.themeIcon === "dark" ? "bg-slate-900" : "bg-white")}>
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={slot.label}
                        width={240}
                        height={60}
                        className="h-full max-h-14 w-auto object-contain"
                        unoptimized={shouldBeUnoptimized(logoUrl)}
                      />
                    ) : (
                      <p className={cn("text-xs font-medium", slot.themeIcon === "dark" ? "text-white/30" : "text-slate-400")}>
                        No logo uploaded
                      </p>
                    )}
                  </div>

                  {/* Info + Actions */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <ThemeIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <p className="text-[13px] font-semibold text-slate-800">{slot.label}</p>
                    </div>
                    <p className="text-[11px] leading-4 text-slate-500">{slot.hint}</p>
                    {logoUrl && (
                      <p className="break-all text-[10px] text-slate-400">{logoUrl}</p>
                    )}
                    <div className="flex gap-2">
                      <label className={cn("inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-[12px] font-semibold transition", busy || disabled ? "cursor-not-allowed bg-white text-slate-400" : "bg-slate-950 text-white hover:bg-slate-800")}>
                        {uploading === slot.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {uploading === slot.key ? "Uploading…" : "Upload"}
                        <input type="file" accept="image/*" className="hidden" disabled={busy || disabled} onChange={(e) => void handleUpload(slot.key, e.target.files?.[0] ?? null)} />
                      </label>
                      {logoUrl && (
                        <button type="button" disabled={busy || disabled} onClick={() => void handleDelete(slot.key)}
                          className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-[12px] font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50">
                          {deleting === slot.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
