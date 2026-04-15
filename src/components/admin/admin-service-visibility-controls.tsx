"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceOverride } from "@/lib/service-overrides";

export function AdminServiceVisibilityControls({ service, disabled }: { service: ServiceOverride; disabled: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateVisibility(payload: { enabled?: boolean; deleted?: boolean }) {
    setMessage("");
    setIsError(false);

    startTransition(async () => {
      const response = await fetch(`/api/admin/services/${service.id}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

      if (!response.ok) {
        setIsError(true);
        setMessage(result.error ?? "Unable to update service status.");
        return;
      }

      setIsError(false);
      setMessage(result.message ?? "Service status updated.");
      router.refresh();
    });
  }

  const isDeleted = service.visibility.deleted;
  const isEnabled = service.visibility.enabled && !isDeleted;

  function handleDeleteToggle() {
    const nextDeleted = !isDeleted;

    if (nextDeleted && typeof window !== "undefined") {
      const confirmed = window.confirm("Delete this service from the admin list and storefront? You can restore it later.");

      if (!confirmed) {
        return;
      }
    }

    updateVisibility({ deleted: nextDeleted, enabled: isDeleted });
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={isDeleted ? "Deleted" : isEnabled ? "Enabled" : "Disabled"} tone={isDeleted ? "rose" : isEnabled ? "emerald" : "amber"} />
        {!isDeleted ? (
          <button
            type="button"
            onClick={() => updateVisibility({ enabled: !isEnabled, deleted: false })}
            disabled={disabled || isPending}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isEnabled ? "Disable" : "Enable"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleDeleteToggle}
          disabled={disabled || isPending}
          className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleted ? "Restore service" : "Delete service"}
        </button>
      </div>
      {message ? <p className={`mt-3 text-sm ${isError ? "text-rose-600" : "text-emerald-600"}`}>{message}</p> : null}
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "emerald" | "amber" | "rose" }) {
  const toneClasses = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700"
  } as const;

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${toneClasses[tone]}`}>{label}</span>;
}
