"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, CheckCircle2, Clock, Link2, Plus, Server, Sparkles, X } from "lucide-react";
import type { HostingProvisionRecord } from "@/lib/hosting-db";

type PanelType = "none" | "plesk" | "cpanel" | "directadmin" | "custom";

type Props = {
  userId: string;
  userEmail: string;
  provisions: HostingProvisionRecord[];
};

const defaultForm = (email: string) => ({
  tierName: "Manual VPS",
  panel: "plesk" as PanelType,
  panelLabel: "Open Plesk Panel",
  loginUrl: "",
  username: email,
  password: "",
  isReady: true,
  notes: ""
});

export function AdminAssignHostingForm({ userId, userEmail, provisions: initialProvisions }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [provisions, setProvisions] = useState(initialProvisions);
  const [selected, setSelected] = useState<HostingProvisionRecord | null>(initialProvisions[0] ?? null);
  const [mode, setMode] = useState<"edit" | "create">(initialProvisions.length === 0 ? "create" : "edit");
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState(() =>
    initialProvisions[0]
      ? {
          tierName: initialProvisions[0].tierName,
          panel: initialProvisions[0].access.panel,
          panelLabel: initialProvisions[0].access.panelLabel ?? "Plesk Control Panel",
          loginUrl: initialProvisions[0].access.loginUrl ?? "",
          username: initialProvisions[0].access.username ?? userEmail,
          password: initialProvisions[0].access.password ?? "",
          isReady: initialProvisions[0].access.isReady,
          notes: initialProvisions[0].access.notes ?? ""
        }
      : defaultForm(userEmail)
  );

  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function selectProvision(p: HostingProvisionRecord) {
    setSelected(p);
    setMode("edit");
    setForm({
      tierName: p.tierName,
      panel: p.access.panel,
      panelLabel: p.access.panelLabel ?? "Plesk Control Panel",
      loginUrl: p.access.loginUrl ?? "",
      username: p.access.username ?? userEmail,
      password: p.access.password ?? "",
      isReady: p.access.isReady,
      notes: p.access.notes ?? ""
    });
    setSaveState("idle");
  }

  function startCreate() {
    setSelected(null);
    setMode("create");
    setForm(defaultForm(userEmail));
    setSaveState("idle");
  }

  function save() {
    startTransition(async () => {
      setSaveState("idle");
      setErrorMsg("");
      try {
        if (mode === "create") {
          const res = await fetch("/api/admin/hosting/manual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              tierName: form.tierName,
              panel: form.panel,
              panelLabel: form.panelLabel,
              loginUrl: form.loginUrl,
              username: form.username,
              password: form.password,
              isReady: form.isReady,
              notes: form.notes
            })
          });
          if (!res.ok) {
            const data = await res.json() as { error?: string };
            throw new Error(data.error ?? "Failed to create");
          }
          const data = await res.json() as { provision: HostingProvisionRecord };
          setProvisions((prev) => [data.provision, ...prev]);
          setSelected(data.provision);
          setMode("edit");
        } else {
          if (!selected) return;
          const res = await fetch(`/api/admin/hosting/access?userId=${encodeURIComponent(userId)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: selected.orderId,
              panel: form.panel,
              panelLabel: form.panelLabel,
              loginUrl: form.loginUrl,
              username: form.username,
              password: form.password,
              isReady: form.isReady,
              notes: form.notes
            })
          });
          if (!res.ok) {
            const data = await res.json() as { error?: string };
            throw new Error(data.error ?? "Failed to save");
          }
        }
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 4000);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        setSaveState("error");
      }
    });
  }

  const modal = open && mounted ? createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-lg rounded-[28px] bg-white shadow-[0_32px_100px_rgba(0,0,0,0.25)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-[28px] bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-white/80" />
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70">
                {mode === "create" ? "Create & Assign Server Access" : "Update Server Access"}
              </span>
            </div>
            <p className="mt-1 text-[13px] font-semibold text-white">{userEmail}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto rounded-b-[28px] p-6">
          <div className="space-y-5">

            {/* Provision tabs */}
            <div className="flex flex-wrap gap-2">
              {provisions.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => selectProvision(p)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                    selected?._id === p._id && mode === "edit"
                      ? "border-violet-500 bg-violet-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${p.status === "provisioned" ? "bg-emerald-400" : p.status === "failed" ? "bg-rose-400" : "bg-amber-400"}`} />
                  {p.tierName}
                </button>
              ))}
              <button
                type="button"
                onClick={startCreate}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                  mode === "create" && !selected
                    ? "border-violet-500 bg-violet-600 text-white"
                    : "border-dashed border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100"
                }`}
              >
                <Plus className="h-3 w-3" />
                New provision
              </button>
            </div>

            {/* Plan name (create only) */}
            {mode === "create" && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Server / plan name</label>
                <input
                  value={form.tierName}
                  onChange={(e) => setForm((f) => ({ ...f, tierName: e.target.value }))}
                  placeholder="e.g. Magnetic VPS Pro"
                  className="mt-1.5 block h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
              </div>
            )}

            {/* Panel type */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Panel type</label>
              <select
                value={form.panel}
                onChange={(e) => setForm((f) => ({ ...f, panel: e.target.value as PanelType }))}
                className="mt-1.5 block h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white"
              >
                <option value="none">None</option>
                <option value="plesk">Plesk</option>
                <option value="cpanel">cPanel</option>
                <option value="directadmin">DirectAdmin</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Login URL */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700">
                <Link2 className="h-3 w-3" />
                Panel login URL (Plesk link)
              </label>
              <input
                value={form.loginUrl}
                onChange={(e) => setForm((f) => ({ ...f, loginUrl: e.target.value }))}
                placeholder="https://your-plesk-server.com:8443"
                className="mt-1.5 block h-11 w-full rounded-2xl border-2 border-violet-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Panel label */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Button label (shown to customer)</label>
              <input
                value={form.panelLabel}
                onChange={(e) => setForm((f) => ({ ...f, panelLabel: e.target.value }))}
                placeholder="e.g. Open Plesk Panel"
                className="mt-1.5 block h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Customer username</label>
              <input
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder={userEmail}
                className="mt-1.5 block h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Login password</label>
              <input
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                type="text"
                placeholder="e.g. MySecureP@ssw0rd"
                className="mt-1.5 block h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 font-mono text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Notes for customer</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="e.g. Use your email as your username to log in."
                className="mt-1.5 block w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-violet-400 focus:bg-white"
              />
            </div>

            {/* Access ready toggle */}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isReady: !f.isReady }))}
              className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-semibold transition ${
                form.isReady
                  ? "border-emerald-500 bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
              }`}
            >
              {form.isReady
                ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                : <Clock className="h-4 w-4 shrink-0 text-slate-400" />}
              {form.isReady ? "Access ready — customer can open their server" : "Pending — customer cannot access yet"}
            </button>

            {/* URL preview */}
            {form.loginUrl && (
              <div className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-violet-600" />
                <span className="truncate font-mono text-[12px] text-violet-700">{form.loginUrl}</span>
              </div>
            )}

            {/* Feedback */}
            {saveState === "error" && (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{errorMsg}</p>
            )}
            {saveState === "saved" && (
              <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
                ✓ {mode === "create" ? "Provision created" : "Access updated"} — customer can now see their server
              </p>
            )}

            {/* Save */}
            <button
              type="button"
              onClick={save}
              disabled={isPending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {isPending
                ? "Saving…"
                : mode === "create"
                ? "Create & assign server access"
                : "Save hosting access"}
            </button>

          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 px-3 text-[12px] font-semibold text-violet-700 shadow-sm transition hover:from-violet-100 hover:to-indigo-100"
      >
        <Sparkles className="h-3 w-3" />
        Assign hosting
      </button>
      {modal}
    </>
  );
}
