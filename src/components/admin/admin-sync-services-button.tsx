"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export function AdminSyncServicesButton({ disabled }: { disabled: boolean }) {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSync() {
    setMessage("");
    setIsError(false);

    startTransition(async () => {
      const response = await fetch("/api/admin/services/sync", {
        method: "POST"
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

      if (!response.ok) {
        setIsError(true);
        setMessage(payload.error ?? "Unable to sync services right now.");
        return;
      }

      setIsError(false);
      setMessage(payload.message ?? "Service catalog synced.");
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleSync}
        disabled={disabled || isPending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        Sync catalog to Prisma
      </button>
      {message ? (
        <p className={`text-sm ${isError ? "text-rose-600" : "text-emerald-600"}`}>{message}</p>
      ) : null}
    </div>
  );
}
