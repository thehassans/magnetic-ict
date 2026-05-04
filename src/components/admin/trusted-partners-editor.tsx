"use client";

import Image from "next/image";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import type { TrustedPartnersSettings } from "@/lib/platform-settings";
import { cn } from "@/lib/utils";

type TrustedPartnersEditorProps = {
  value: TrustedPartnersSettings;
  onChange: Dispatch<SetStateAction<TrustedPartnersSettings>>;
  disabled: boolean;
};

export function TrustedPartnersEditor({ value, onChange, disabled }: TrustedPartnersEditorProps) {
  const [uploadingPartnerId, setUploadingPartnerId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function updatePartner(partnerId: string, next: Partial<TrustedPartnersSettings["partners"][number]>) {
    onChange((current) => ({
      ...current,
      partners: current.partners.map((partner) => (partner.id === partnerId ? { ...partner, ...next } : partner))
    }));
  }

  async function handleLogoUpload(partnerId: string, file: File | null) {
    if (!file) {
      return;
    }

    setUploadingPartnerId(partnerId);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/admin/trusted-partners/${partnerId}/logo`, {
        method: "POST",
        body: formData
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; logoUrl?: string; message?: string };

      if (!response.ok) {
        setFeedback({ type: "error", message: payload.error ?? "Unable to upload this logo." });
        return;
      }

      if (payload.logoUrl) {
        updatePartner(partnerId, { logoUrl: payload.logoUrl });
      }

      setFeedback({ type: "success", message: payload.message ?? "Partner logo updated." });
    } catch {
      setFeedback({ type: "error", message: "Unable to upload this logo." });
    } finally {
      setUploadingPartnerId(null);
    }
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <div className={`rounded-[24px] border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {value.partners.map((partner) => {
          const isUploading = uploadingPartnerId === partner.id;
          return (
            <article key={partner.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 shadow-[0_14px_42px_rgba(15,23,42,0.04)]">
              <div className="flex items-start gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                  {partner.logoUrl ? (
                    <Image src={partner.logoUrl} alt={partner.name} fill className="object-contain p-2.5" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">{partner.name.slice(0, 2).toUpperCase()}</div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{partner.name}</div>
                    <div className="mt-1 break-all text-[11px] text-slate-500">{partner.logoUrl || "Upload a partner logo to begin."}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <label
                      className={cn(
                        "inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium transition",
                        isUploading || disabled
                          ? "cursor-not-allowed bg-white text-slate-400"
                          : "bg-slate-950 text-white hover:bg-slate-800"
                      )}
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isUploading ? "Uploading" : "Upload logo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={disabled || isUploading}
                        onChange={(event) => void handleLogoUpload(partner.id, event.target.files?.[0] ?? null)}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => updatePartner(partner.id, { enabled: !partner.enabled })}
                      disabled={disabled}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
                        partner.enabled
                          ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <Check className="h-4 w-4" />
                      {partner.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
