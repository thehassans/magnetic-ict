"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2, Clock, Globe2, Key, Loader2, Palette,
  ShoppingCart, Smartphone, Store, Workflow, XCircle, ExternalLink, Copy, Check
} from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

type DomainOption = { id: string; domain: string; status: string };

type Installation = {
  _id: string;
  orderId: string;
  tierName: string;
  status: "pending_domain_assignment" | "integration_requested" | "active" | "failed";
  assignedDomainId: string | null;
  assignedDomain: string | null;
  storefrontUrl: string | null;
  adminUrl: string | null;
  customerEmail: string;
  customerName: string | null;
  errorMessage: string | null;
  surfaces: { web: boolean; ios: boolean; android: boolean };
  configuration: {
    businessName: string;
    brandColor: string;
    adminEmail: string;
    supportEmail: string;
    currency: string;
    logoUrl: string;
    launchNotes: string;
  };
  dns: {
    lastAppliedAt: string | null;
    autoAppliedAt: string | null;
    records: Array<{
      recordId: string | null;
      type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
      name: string;
      value: string;
      ttl: number;
      priority: number | null;
    }>;
  };
};

const STATUS_MAP: Record<Installation["status"], { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  pending_domain_assignment: { label: "Awaiting domain", color: "text-amber-700 border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300", Icon: Clock },
  integration_requested:    { label: "Integration requested", color: "text-blue-700 border-blue-200 bg-blue-50 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300", Icon: Loader2 },
  active:                   { label: "Active", color: "text-emerald-700 border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300", Icon: CheckCircle2 },
  failed:                   { label: "Failed", color: "text-rose-700 border-rose-200 bg-rose-50 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300", Icon: XCircle },
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} title="Copy" className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export function CustomerMagneticCommerceWorkspace({
  installations,
  domains,
}: {
  installations: Installation[];
  domains: DomainOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedDomains, setSelectedDomains] = useState<Record<string, string>>(
    Object.fromEntries(installations.map((i) => [i.orderId, i.assignedDomainId ?? ""]))
  );
  const [customDomains, setCustomDomains] = useState<Record<string, string>>(
    Object.fromEntries(installations.map((i) => [i.orderId, ""]))
  );
  const [configurations, setConfigurations] = useState<Record<string, Installation["configuration"]>>(
    Object.fromEntries(installations.map((i) => [i.orderId, i.configuration]))
  );

  function notify(msg: string, isError = false) {
    if (isError) { setError(msg); setSuccess(""); }
    else { setSuccess(msg); setError(""); }
    setTimeout(() => { setError(""); setSuccess(""); }, 5000);
  }

  function updateField(orderId: string, field: keyof Installation["configuration"], value: string) {
    setConfigurations((c) => ({ ...c, [orderId]: { ...(c[orderId] ?? {}), [field]: value } as Installation["configuration"] }));
  }

  function assignDomain(orderId: string) {
    const domainId = selectedDomains[orderId];
    const customDomain = customDomains[orderId]?.trim();
    if (!domainId && !customDomain) { notify("Select a managed domain or enter a custom domain.", true); return; }
    startTransition(async () => {
      const body = domainId
        ? { domainId }
        : { customDomain };
      const res = await fetch(`/api/dashboard/magnetic-commerce/installations/${orderId}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { notify(data.error ?? "Unable to assign domain.", true); return; }
      notify("Domain assigned successfully."); router.refresh();
    });
  }

  function saveConfiguration(orderId: string) {
    const cfg = configurations[orderId];
    if (!cfg) return;
    startTransition(async () => {
      const res = await fetch(`/api/dashboard/magnetic-commerce/installations/${orderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-config", configuration: cfg }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { notify(data.error ?? "Unable to save settings.", true); return; }
      notify("Store settings saved."); router.refresh();
    });
  }

  function applyDns(orderId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/dashboard/magnetic-commerce/installations/${orderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply-dns" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { notify(data.error ?? "Unable to apply DNS.", true); return; }
      notify("DNS template applied."); router.refresh();
    });
  }

  if (installations.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200/70 bg-slate-50/80 p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
        <ShoppingCart className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">No installations yet</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Purchase Magnetic Commerce to unlock your workspace.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">{error}</div>}
      {success && <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">{success}</div>}

      {installations.map((inst) => {
        const cfg = configurations[inst.orderId] ?? inst.configuration;
        const { label: statusLabel, color: statusColor, Icon: StatusIcon } = STATUS_MAP[inst.status];
        const loginUrl = inst.adminUrl ?? "https://commerce.magnetic-ict.com/login";
        const storefrontUrl = inst.storefrontUrl ?? (inst.assignedDomain ? `https://${inst.assignedDomain}` : null);

        return (
          <section key={inst._id} className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/75 shadow-[0_8px_32px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/[0.03]">

            {/* ── Header ── */}
            <div className="flex flex-col gap-4 border-b border-slate-200/70 p-5 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between sm:p-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500">Order · {inst.orderId.slice(-8).toUpperCase()}</div>
                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Magnetic Commerce <span className="text-indigo-600 dark:text-indigo-400">· {inst.tierName}</span>
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {inst.customerName && <><span className="font-medium text-slate-700 dark:text-slate-300">{inst.customerName}</span> · </>}{inst.customerEmail}
                </p>
              </div>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold", statusColor)}>
                <StatusIcon className={cn("h-3.5 w-3.5", inst.status === "integration_requested" && "animate-spin")} />
                {statusLabel}
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-5">

              {/* ── Commerce Login URL (auto-generated) ── */}
              <div className="rounded-[24px] border border-indigo-200/60 bg-gradient-to-r from-indigo-50/80 to-violet-50/60 p-5 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-violet-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                    <Key className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-700 dark:text-indigo-400">Your Commerce Admin Login</p>
                    <p className="text-[11px] text-indigo-500 dark:text-indigo-500">Auto-generated when you purchased Magnetic Commerce</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-indigo-200/60 bg-white/80 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.05]">
                  <span className="flex-1 break-all font-mono text-sm font-semibold text-indigo-700 dark:text-indigo-300">{loginUrl}</span>
                  <CopyButton value={loginUrl} />
                  <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-200/60 bg-indigo-100/60 text-indigo-600 transition hover:bg-indigo-200 dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <p className="mt-2 text-[11px] text-indigo-500 dark:text-indigo-500">
                  Use this URL to access your Magnetic Commerce admin panel. Your login credentials were sent to <strong>{inst.customerEmail}</strong>.
                </p>
              </div>

              {/* ── 3-col info cards ── */}
              <div className="grid gap-4 lg:grid-cols-3">
                {/* Domain */}
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Storefront Domain</p>
                  {storefrontUrl ? (
                    <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                      {inst.assignedDomain} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No domain assigned yet</p>
                  )}
                  <div className="mt-3 space-y-2">
                    <select
                      value={selectedDomains[inst.orderId] ?? ""}
                      onChange={(e) => setSelectedDomains((c) => ({ ...c, [inst.orderId]: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    >
                      <option value="">Select managed domain</option>
                      {domains.map((d) => <option key={d.id} value={d.id}>{d.domain}</option>)}
                    </select>

                    {/* OR divider */}
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">or</span>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                    </div>

                    {/* Custom domain input */}
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={customDomains[inst.orderId] ?? ""}
                        onChange={(e) => setCustomDomains((c) => ({ ...c, [inst.orderId]: e.target.value }))}
                        placeholder="yourdomain.com"
                        className="h-10 w-full rounded-xl border border-dashed border-indigo-300/60 bg-indigo-50/40 px-3 text-sm outline-none transition focus:border-indigo-400 focus:bg-white dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-white dark:placeholder:text-slate-500"
                      />
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Type a domain you own but haven&apos;t added to managed domains yet</p>
                    </div>

                    <button onClick={() => assignDomain(inst.orderId)} disabled={isPending}
                      className="inline-flex h-9 w-full items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100">
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : inst.assignedDomain ? "Update domain" : "Assign domain"}
                    </button>
                  </div>
                </div>

                {/* Integration flow */}
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
                    <Workflow className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Integration flow</p>
                  <ol className="mt-3 space-y-2">
                    {[
                      "Purchase Magnetic Commerce ✓",
                      "Choose storefront domain",
                      "Magnetic ICT provisions admin panel",
                      "Storefront live on your domain",
                    ].map((step, i) => (
                      <li key={i} className={cn("flex items-start gap-2 text-sm", i === 0 ? "text-emerald-600 dark:text-emerald-400 line-through" : "text-slate-600 dark:text-slate-300")}>
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Surfaces */}
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
                    <Store className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Included surfaces</p>
                  <ul className="mt-3 space-y-2">
                    {([["Web storefront", inst.surfaces.web], ["iPhone app", inst.surfaces.ios], ["Android app", inst.surfaces.android]] as [string, boolean][]).map(([label, ok]) => (
                      <li key={label} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />}
                        {label}
                      </li>
                    ))}
                    <li className="flex items-center gap-1.5 pt-1 text-sm">
                      <Smartphone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500 dark:text-slate-400">Admin: <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">commerce.magnetic-ict.com</a></span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* ── Store configuration + DNS ── */}
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
                {/* Config form */}
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
                      <Palette className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Store configuration</p>
                  </div>

                  {/* Live brand preview */}
                  {(cfg.logoUrl || cfg.businessName || cfg.brandColor) && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                      {cfg.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cfg.logoUrl} alt="logo" className="h-8 w-8 rounded-lg object-contain" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold" style={{ background: cfg.brandColor || "#7c3aed" }}>
                          {(cfg.businessName || "M")[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-950 dark:text-white">{cfg.businessName || "Your Store"}</p>
                        <p className="text-[11px] text-slate-500">
                          Preview · <span className="font-mono" style={{ color: cfg.brandColor || "#7c3aed" }}>{cfg.brandColor || "#7c3aed"}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    {([
                      ["businessName", "Business name", "text"],
                      ["brandColor", "Brand color (#hex)", "text"],
                      ["adminEmail", "Admin email", "email"],
                      ["supportEmail", "Support email", "email"],
                      ["currency", "Currency (USD)", "text"],
                      ["logoUrl", "Logo URL", "url"],
                    ] as [keyof Installation["configuration"], string, string][]).map(([field, placeholder, type]) => (
                      <input key={field} type={type} value={cfg[field] ?? ""} placeholder={placeholder}
                        onChange={(e) => updateField(inst.orderId, field, field === "currency" ? e.target.value.toUpperCase() : e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white" />
                    ))}
                    <textarea value={cfg.launchNotes ?? ""} placeholder="Launch notes for Magnetic ICT team…"
                      onChange={(e) => updateField(inst.orderId, "launchNotes", e.target.value)}
                      rows={3} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white md:col-span-2" />
                  </div>
                  <button onClick={() => saveConfiguration(inst.orderId)} disabled={isPending}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60 dark:bg-white dark:text-slate-950">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save store settings
                  </button>
                  <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                    These settings sync to your commerce admin at <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">commerce.magnetic-ict.com/login</a>
                  </p>
                </div>

                {/* DNS */}
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
                      <Globe2 className="h-4 w-4" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">DNS template</p>
                  </div>
                  <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Last applied</span>
                      <span className="text-right font-medium text-slate-700 dark:text-slate-200">{inst.dns.lastAppliedAt ? new Date(inst.dns.lastAppliedAt).toLocaleDateString() : "Not yet"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-400">Auto-applied</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{inst.dns.autoAppliedAt ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  <button onClick={() => applyDns(inst.orderId)} disabled={isPending || !inst.assignedDomainId}
                    className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950">
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply DNS template"}
                  </button>
                  <div className="mt-3 space-y-2">
                    {inst.dns.records.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.03]">
                        No DNS records saved yet. Assign a domain first.
                      </div>
                    ) : inst.dns.records.map((r) => (
                      <div key={`${r.type}-${r.name}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
                        <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{r.type}</span>
                        <span className="ml-2 text-xs font-medium text-slate-700 dark:text-slate-200">{r.name}</span>
                        <p className="mt-1 break-all text-[11px] text-slate-500 dark:text-slate-400">{r.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error */}
              {inst.errorMessage && (
                <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
                  {inst.errorMessage}
                </div>
              )}

              {/* ── Domain Configuration & Integration Guide ── */}
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm dark:bg-white/[0.08] dark:text-slate-300">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-300">Domain Configuration & Integration Guide</p>
                    <p className="text-[11px] text-slate-400">Point your domain to Magnetic Commerce in 4 steps</p>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Left: Setup Steps */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Setup Steps</p>
                    {[
                      {
                        step: "1",
                        title: "Purchase Magnetic Commerce",
                        desc: "You've completed this step.",
                        done: true,
                      },
                      {
                        step: "2",
                        title: "Assign your storefront domain",
                        desc: inst.assignedDomain
                          ? `Assigned to ${inst.assignedDomain}`
                          : "Enter your domain in the Storefront Domain card above.",
                        done: !!inst.assignedDomain,
                      },
                      {
                        step: "3",
                        title: "Point DNS to Magnetic Commerce",
                        desc: `Add a CNAME record: www → shops.magnetic-ict.com and an A record for @ to our IP. Then click Apply DNS Template above.`,
                        done: inst.dns.lastAppliedAt !== null,
                      },
                      {
                        step: "4",
                        title: "Verify & go live",
                        desc: inst.status === "active"
                          ? "Your storefront is live!"
                          : "Magnetic ICT team will verify and activate your storefront (usually within 24h).",
                        done: inst.status === "active",
                      },
                    ].map(({ step, title, desc, done }) => (
                      <div key={step} className={cn(
                        "flex items-start gap-3 rounded-xl border px-4 py-3",
                        done
                          ? "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]"
                          : "border-slate-200/70 bg-white dark:border-white/10 dark:bg-white/[0.03]"
                      )}>
                        <span className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                        )}>
                          {done ? "✓" : step}
                        </span>
                        <div>
                          <p className={cn("text-sm font-semibold", done ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200")}>{title}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: DNS Records */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Required DNS Records</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Add these records at your domain registrar (e.g. Cloudflare, GoDaddy, Namecheap). Changes propagate within 24–48 hours.
                    </p>

                    {[
                      { type: "CNAME", name: "www", value: "shops.magnetic-ict.com", ttl: "Auto", note: "Storefront" },
                      { type: "CNAME", name: "admin", value: "commerce.magnetic-ict.com", ttl: "Auto", note: "Admin panel" },
                      { type: "TXT", name: "_magnetic-commerce", value: `managed-by=magnetic-commerce;domain=${inst.assignedDomain ?? "yourdomain.com"};order=${inst.orderId}`, ttl: "3600", note: "Verification" },
                    ].map((r) => (
                      <div key={r.type + r.name} className="rounded-xl border border-slate-200/70 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{r.type}</span>
                          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{r.name}</span>
                          <span className="ml-auto text-[10px] text-slate-400">{r.note}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="min-w-0 flex-1 break-all font-mono text-[11px] text-slate-500 dark:text-slate-400">{r.value}</span>
                          <CopyButton value={r.value} />
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">TTL: {r.ttl}</div>
                      </div>
                    ))}

                    {/* Domain status summary */}
                    <div className={cn(
                      "rounded-xl border px-4 py-3 text-xs",
                      inst.status === "active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                        : inst.assignedDomain
                        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300"
                        : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
                    )}>
                      {inst.status === "active" && "✓ Your storefront is live and DNS is verified."}
                      {inst.status === "integration_requested" && `Domain ${inst.assignedDomain} assigned. Magnetic ICT team is reviewing your integration request.`}
                      {inst.status === "pending_domain_assignment" && "Assign a domain above to begin the integration process."}
                      {inst.status === "failed" && "Integration failed. Check the error above and contact support."}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        );
      })}


      {domains.length === 0 && installations.every((i) => !i.assignedDomain) && (
        <div className="rounded-[24px] border border-dashed border-amber-200 bg-amber-50/60 p-5 text-sm text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
          No active managed domains found. You can still enter a custom domain directly in the field above, or purchase a domain from the Domains section.
        </div>
      )}

    </div>
  );
}
