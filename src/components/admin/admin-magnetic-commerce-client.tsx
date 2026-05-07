"use client";

import { useMemo, useState } from "react";

type Installation = {
  _id: string;
  orderId: string;
  userId: string;
  customerEmail: string;
  customerName: string | null;
  tierName: string;
  status: "pending_domain_assignment" | "integration_requested" | "active" | "failed";
  errorMessage: string | null;
  updatedAt: string;
  assignedDomainId: string | null;
  assignedDomain: string | null;
  storefrontUrl: string | null;
  adminUrl: string | null;
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

export function AdminMagneticCommerceClient({ installations }: { installations: Installation[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState(installations[0]?.orderId ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingDns, setIsApplyingDns] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const filteredInstallations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return installations.filter((installation) => {
      const matchesStatus = statusFilter === "all" || installation.status === statusFilter;
      const searchable = [
        installation.customerEmail,
        installation.customerName ?? "",
        installation.orderId,
        installation.assignedDomain ?? "",
        installation.configuration.businessName
      ].join(" ").toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [installations, query, statusFilter]);
  const selectedInstallation = useMemo(
    () => installations.find((installation) => installation.orderId === selectedOrderId) ?? filteredInstallations[0] ?? installations[0] ?? null,
    [filteredInstallations, installations, selectedOrderId]
  );
  const [formState, setFormState] = useState(() => ({
    status: installations[0]?.status ?? "pending_domain_assignment",
    errorMessage: installations[0]?.errorMessage ?? "",
    storefrontUrl: installations[0]?.storefrontUrl ?? "",
    adminUrl: installations[0]?.adminUrl ?? "",
    businessName: installations[0]?.configuration.businessName ?? "",
    brandColor: installations[0]?.configuration.brandColor ?? "",
    adminEmail: installations[0]?.configuration.adminEmail ?? "",
    supportEmail: installations[0]?.configuration.supportEmail ?? "",
    currency: installations[0]?.configuration.currency ?? "USD",
    logoUrl: installations[0]?.configuration.logoUrl ?? "",
    launchNotes: installations[0]?.configuration.launchNotes ?? ""
  }));

  function syncSelectedInstallation(nextInstallation: Installation | undefined) {
    if (!nextInstallation) {
      return;
    }

    setFormState({
      status: nextInstallation.status,
      errorMessage: nextInstallation.errorMessage ?? "",
      storefrontUrl: nextInstallation.storefrontUrl ?? "",
      adminUrl: nextInstallation.adminUrl ?? "",
      businessName: nextInstallation.configuration.businessName,
      brandColor: nextInstallation.configuration.brandColor,
      adminEmail: nextInstallation.configuration.adminEmail,
      supportEmail: nextInstallation.configuration.supportEmail,
      currency: nextInstallation.configuration.currency,
      logoUrl: nextInstallation.configuration.logoUrl,
      launchNotes: nextInstallation.configuration.launchNotes
    });
  }

  async function saveInstallation() {
    if (!selectedInstallation) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const response = await fetch(`/api/admin/magnetic-commerce/installations/${selectedInstallation.orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "update-management",
        status: formState.status,
        errorMessage: formState.errorMessage,
        storefrontUrl: formState.storefrontUrl,
        adminUrl: formState.adminUrl,
        configuration: {
          businessName: formState.businessName,
          brandColor: formState.brandColor,
          adminEmail: formState.adminEmail,
          supportEmail: formState.supportEmail,
          currency: formState.currency,
          logoUrl: formState.logoUrl,
          launchNotes: formState.launchNotes
        }
      })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setFeedback({ type: "error", message: payload.error ?? "Unable to update Magnetic Commerce right now." });
      setIsSaving(false);
      return;
    }

    setFeedback({ type: "success", message: "Magnetic Commerce installation updated." });
    setIsSaving(false);
    window.location.reload();
  }

  async function applyDns() {
    if (!selectedInstallation) {
      return;
    }

    setIsApplyingDns(true);
    setFeedback(null);

    const response = await fetch(`/api/admin/magnetic-commerce/installations/${selectedInstallation.orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "apply-dns",
        userId: selectedInstallation.userId
      })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setFeedback({ type: "error", message: payload.error ?? "Unable to apply DNS template right now." });
      setIsApplyingDns(false);
      return;
    }

    setFeedback({ type: "success", message: "Magnetic Commerce DNS template applied." });
    setIsApplyingDns(false);
    window.location.reload();
  }

  const stats = useMemo(() => ({
    total: installations.length,
    active: installations.filter((installation) => installation.status === "active").length,
    pending: installations.filter((installation) => installation.status === "integration_requested" || installation.status === "pending_domain_assignment").length,
    failed: installations.filter((installation) => installation.status === "failed").length
  }), [installations]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Installations" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Failed" value={stats.failed} />
      </section>

      {feedback ? (
        <div className={`rounded-[24px] border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {feedback.message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="grid gap-3">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by email, order, domain" className="h-11 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white">
              <option value="all">All statuses</option>
              <option value="pending_domain_assignment">Pending domain</option>
              <option value="integration_requested">Integration requested</option>
              <option value="active">Active</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="mt-4 space-y-3">
            {filteredInstallations.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No Magnetic Commerce installations match the current filters.</div>
            ) : filteredInstallations.map((installation) => {
              const active = installation.orderId === (selectedInstallation?.orderId ?? "");

              return (
                <button
                  key={installation._id}
                  type="button"
                  onClick={() => {
                    setSelectedOrderId(installation.orderId);
                    syncSelectedInstallation(installation);
                  }}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"}`}
                >
                  <div className="text-sm font-semibold">{installation.configuration.businessName || installation.customerEmail}</div>
                  <div className={`mt-1 text-xs ${active ? "text-white/70" : "text-slate-500"}`}>{installation.customerEmail}</div>
                  <div className={`mt-3 text-xs uppercase tracking-[0.22em] ${active ? "text-white/60" : "text-slate-400"}`}>{installation.status.replaceAll("_", " ")}</div>
                  <div className={`mt-2 text-xs ${active ? "text-white/70" : "text-slate-500"}`}>{installation.assignedDomain ?? "No domain assigned yet"}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {!selectedInstallation ? (
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
              Select a Magnetic Commerce installation to manage it.
            </div>
          ) : (
            <>
              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Order ID: {selectedInstallation.orderId}</div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">{selectedInstallation.configuration.businessName || "Magnetic Commerce installation"}</h2>
                    <p className="mt-2 text-sm text-slate-600">Customer: {selectedInstallation.customerName || selectedInstallation.customerEmail}</p>
                    <p className="mt-1 text-sm text-slate-600">Assigned domain: {selectedInstallation.assignedDomain ?? "Not assigned yet"}</p>
                  </div>
                  <button type="button" onClick={applyDns} disabled={isApplyingDns || !selectedInstallation.assignedDomainId} className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {isApplyingDns ? "Applying DNS..." : "Apply DNS template"}
                  </button>
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-700">Status</span>
                    <select value={formState.status} onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as Installation["status"] }))} className="h-11 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white">
                      <option value="pending_domain_assignment">Pending domain assignment</option>
                      <option value="integration_requested">Integration requested</option>
                      <option value="active">Active</option>
                      <option value="failed">Failed</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-700">Storefront URL</span>
                    <input value={formState.storefrontUrl} onChange={(event) => setFormState((current) => ({ ...current, storefrontUrl: event.target.value }))} className="h-11 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-700">Admin URL</span>
                    <input value={formState.adminUrl} onChange={(event) => setFormState((current) => ({ ...current, adminUrl: event.target.value }))} className="h-11 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
                  </label>
                  <label className="space-y-2 text-sm md:col-span-2">
                    <span className="font-semibold text-slate-700">Error or operator notes</span>
                    <textarea value={formState.errorMessage} onChange={(event) => setFormState((current) => ({ ...current, errorMessage: event.target.value }))} rows={3} className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
                  </label>
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Business name" value={formState.businessName} onChange={(value) => setFormState((current) => ({ ...current, businessName: value }))} />
                  <Field label="Brand color" value={formState.brandColor} onChange={(value) => setFormState((current) => ({ ...current, brandColor: value }))} />
                  <Field label="Admin email" value={formState.adminEmail} onChange={(value) => setFormState((current) => ({ ...current, adminEmail: value }))} />
                  <Field label="Support email" value={formState.supportEmail} onChange={(value) => setFormState((current) => ({ ...current, supportEmail: value }))} />
                  <Field label="Currency" value={formState.currency} onChange={(value) => setFormState((current) => ({ ...current, currency: value.toUpperCase() }))} />
                  <Field label="Logo URL" value={formState.logoUrl} onChange={(value) => setFormState((current) => ({ ...current, logoUrl: value }))} />
                  <label className="space-y-2 text-sm md:col-span-2">
                    <span className="font-semibold text-slate-700">Launch notes</span>
                    <textarea value={formState.launchNotes} onChange={(event) => setFormState((current) => ({ ...current, launchNotes: event.target.value }))} rows={4} className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
                  </label>
                </div>
                <div className="mt-4">
                  <button type="button" onClick={saveInstallation} disabled={isSaving} className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {isSaving ? "Saving..." : "Save installation"}
                  </button>
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
                <div className="text-sm font-semibold text-slate-950">Applied DNS records</div>
                <div className="mt-4 space-y-3">
                  {selectedInstallation.dns.records.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No Magnetic Commerce DNS records have been saved yet.</div>
                  ) : selectedInstallation.dns.records.map((record) => (
                    <div key={`${record.type}-${record.name}-${record.value}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <div className="font-semibold text-slate-950">{record.type} · {record.name}</div>
                      <div className="mt-1 break-all">{record.value}</div>
                      <div className="mt-1 text-slate-500">TTL {record.ttl}{record.priority ? ` · Priority ${record.priority}` : ""}</div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
    </label>
  );
}
