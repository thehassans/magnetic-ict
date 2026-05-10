"use client";

import { useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, Clock, Link2, Server, Sparkles, X } from "lucide-react";
import type { HostingProvisionRecord } from "@/lib/hosting-db";

type Props = {
  userId: string;
  userEmail: string;
  provisions: HostingProvisionRecord[];
};

export function AdminAssignHostingForm({ userId, userEmail, provisions }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<HostingProvisionRecord | null>(provisions[0] ?? null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    panel: selected?.access.panel ?? "plesk" as "none" | "plesk" | "cpanel" | "directadmin" | "custom",
    panelLabel: selected?.access.panelLabel ?? "Plesk Control Panel",
    loginUrl: selected?.access.loginUrl ?? "",
    username: selected?.access.username ?? userEmail,
    isReady: selected?.access.isReady ?? false,
    notes: selected?.access.notes ?? ""
  });

  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function selectProvision(p: HostingProvisionRecord) {
    setSelected(p);
    setForm({
      panel: p.access.panel,
      panelLabel: p.access.panelLabel ?? "Plesk Control Panel",
      loginUrl: p.access.loginUrl ?? "",
      username: p.access.username ?? userEmail,
      isReady: p.access.isReady,
      notes: p.access.notes ?? ""
    });
    setSaveState("idle");
  }

  function save() {
    if (!selected) return;
    startTransition(async () => {
      setSaveState("idle");
      setErrorMsg("");
      try {
        const res = await fetch(`/api/admin/hosting/access?userId=${encodeURIComponent(userId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: selected.orderId,
            panel: form.panel,
            panelLabel: form.panelLabel,
            loginUrl: form.loginUrl,
            username: form.username,
            isReady: form.isReady,
            notes: form.notes
          })
        });
        if (!res.ok) {
          const data = await res.json() as { error?: string };
          throw new Error(data.error ?? "Failed to save");
        }
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 3000);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        setSaveState("error");
      }
    });
  }

  if (provisions.length === 0) {
    return (
      <div className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 text-[12px] text-slate-400">
        <Server className="h-3 w-3" />
        No VPS orders
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 px-3 text-[12px] font-semibold text-violet-700 shadow-sm transition hover:from-violet-100 hover:to-indigo-100"
      >
        <Sparkles className="h-3 w-3" />
        Assign hosting
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[420px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/60">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4">
            <div>
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-white/80" />
                <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">Assign Server Access</span>
              </div>
              <p className="mt-0.5 text-[12px] text-white/60 truncate max-w-[280px]">{userEmail}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Provision selector */}
            {provisions.length > 1 && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Select provision</label>
                <div className="mt-2 space-y-1.5">
                  {provisions.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => selectProvision(p)}
                      className={`flex w-full items-center gap-3 rounded-[16px] border px-3 py-2.5 text-left text-[12px] transition ${selected?._id === p._id ? "border-violet-400 bg-violet-50 text-violet-900" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"}`}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${p.status === "provisioned" ? "bg-emerald-500" : p.status === "failed" ? "bg-rose-500" : "bg-amber-400"}`} />
                      <span className="font-semibold">{p.tierName}</span>
                      <span className="ml-auto font-mono text-[10px] text-slate-400">{p.orderId.slice(0, 12)}…</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Panel type */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Panel type</label>
              <select
                value={form.panel}
                onChange={(e) => setForm((f) => ({ ...f, panel: e.target.value as typeof f.panel }))}
                className="mt-1.5 h-10 w-full rounded-[16px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white"
              >
                <option value="none">None</option>
                <option value="plesk">Plesk</option>
                <option value="cpanel">cPanel</option>
                <option value="directadmin">DirectAdmin</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Plesk / Panel URL — primary field */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700">
                <Link2 className="h-3 w-3" />
                Panel login URL
              </label>
              <input
                value={form.loginUrl}
                onChange={(e) => setForm((f) => ({ ...f, loginUrl: e.target.value }))}
                placeholder="https://your-plesk-server.com:8443"
                className="mt-1.5 h-10 w-full rounded-[16px] border-2 border-violet-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Panel label */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Button label (shown to customer)</label>
              <input
                value={form.panelLabel}
                onChange={(e) => setForm((f) => ({ ...f, panelLabel: e.target.value }))}
                placeholder="e.g. Open Plesk Panel"
                className="mt-1.5 h-10 w-full rounded-[16px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Customer username</label>
              <input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder={userEmail}
                className="mt-1.5 h-10 w-full rounded-[16px] border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Notes for customer</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="e.g. Use your email as username to log in."
                className="mt-1.5 w-full rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white resize-none"
              />
            </div>

            {/* Access ready toggle */}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isReady: !f.isReady }))}
              className={`flex w-full items-center gap-3 rounded-[16px] border px-4 py-3 text-sm font-semibold transition ${form.isReady ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-500/20" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"}`}
            >
              {form.isReady
                ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                : <Clock className="h-4 w-4 shrink-0 text-slate-400" />}
              {form.isReady ? "Access ready — customer can open their server" : "Pending — customer cannot access yet"}
            </button>

            {/* Preview hint */}
            {form.loginUrl && (
              <div className="flex items-center gap-2 rounded-[14px] border border-violet-100 bg-violet-50 px-3 py-2.5">
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-violet-600" />
                <span className="truncate font-mono text-[11px] text-violet-700">{form.loginUrl}</span>
              </div>
            )}

            {/* Save */}
            {saveState === "error" && (
              <p className="rounded-[12px] bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{errorMsg}</p>
            )}
            {saveState === "saved" && (
              <p className="rounded-[12px] bg-emerald-50 px-3 py-2 text-[12px] font-semibold text-emerald-700">
                ✓ Saved — customer can now see their server in the Server Management page
              </p>
            )}

            <button
              type="button"
              onClick={save}
              disabled={isPending || !selected}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save & assign hosting access"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
