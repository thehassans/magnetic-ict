"use client";

import { useMemo, useState } from "react";

type HostingProvision = {
  _id: string;
  orderId: string;
  userId: string;
  customerEmail: string;
  customerName: string | null;
  tierName: string;
  status: string;
  errorMessage: string | null;
  updatedAt: string;
  configuration: {
    operatingSystemName: string | null;
    controlPanelName: string | null;
    addonNames: string[];
    locationName: string | null;
    extraMonthlyPrice: number;
    summaryLines: string[];
  } | null;
  domain?: {
    mode: "none" | "register";
    name: string | null;
    years: number;
    privacyProtection: boolean;
    totalPrice: number;
    status: string;
    registrarReference: string | null;
    errorMessage: string | null;
  };
  reseller: {
    contractId: string | null;
    adminId: string | null;
  };
  cloud: {
    datacenterId: string | null;
    serverId: string | null;
    volumeId: string | null;
    location: string | null;
  };
  access: {
    panel: "none" | "plesk" | "cpanel" | "directadmin" | "custom";
    panelLabel: string | null;
    loginUrl: string | null;
    username: string | null;
    isReady: boolean;
    notes: string | null;
  };
};

function getTone(status: string) {
  switch (status) {
    case "provisioned":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export function AdminHostingClient({ provisions }: { provisions: HostingProvision[] }) {
  const [selectedProvisionId, setSelectedProvisionId] = useState(provisions[0]?._id ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const selectedProvision = useMemo(
    () => provisions.find((provision) => provision._id === selectedProvisionId) ?? provisions[0] ?? null,
    [provisions, selectedProvisionId]
  );
  const [formState, setFormState] = useState(() => ({
    orderId: provisions[0]?.orderId ?? "",
    userId: provisions[0]?.userId ?? "",
    panel: provisions[0]?.access.panel ?? "none",
    panelLabel: provisions[0]?.access.panelLabel ?? "",
    loginUrl: provisions[0]?.access.loginUrl ?? "",
    username: provisions[0]?.access.username ?? "",
    isReady: provisions[0]?.access.isReady ?? false,
    notes: provisions[0]?.access.notes ?? ""
  }));

  async function saveAccess() {
    if (!selectedProvision) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const response = await fetch(`/api/admin/hosting/access?userId=${encodeURIComponent(selectedProvision.userId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formState)
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setFeedback({ type: "error", message: payload.error ?? "Unable to update hosting access." });
      setIsSaving(false);
      return;
    }

    setFeedback({ type: "success", message: "Hosting access updated." });
    setIsSaving(false);
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <div className={`rounded-[24px] border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {feedback.message}
        </div>
      ) : null}
      {provisions.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          No Magnetic VPS Hosting provisions yet. Fulfilled hosting orders will appear here.
        </div>
      ) : null}
      {selectedProvision ? (
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-700">Choose hosting customer</span>
              <select
                value={selectedProvisionId}
                onChange={(event) => {
                  const nextProvision = provisions.find((provision) => provision._id === event.target.value);
                  setSelectedProvisionId(event.target.value);
                  if (nextProvision) {
                    setFormState({
                      orderId: nextProvision.orderId,
                      userId: nextProvision.userId,
                      panel: nextProvision.access.panel,
                      panelLabel: nextProvision.access.panelLabel ?? "",
                      loginUrl: nextProvision.access.loginUrl ?? "",
                      username: nextProvision.access.username ?? "",
                      isReady: nextProvision.access.isReady,
                      notes: nextProvision.access.notes ?? ""
                    });
                  }
                }}
                className="h-12 min-w-[280px] rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
              >
                {provisions.map((provision) => (
                  <option key={provision._id} value={provision._id}>
                    {(provision.customerName || provision.customerEmail)} · {provision.tierName}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void saveAccess()}
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save hosting access"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-700">Panel type</span>
              <select
                value={formState.panel}
                onChange={(event) => setFormState((current) => ({ ...current, panel: event.target.value as typeof current.panel }))}
                className="h-12 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
              >
                <option value="none">None</option>
                <option value="plesk">Plesk</option>
                <option value="cpanel">cPanel</option>
                <option value="directadmin">DirectAdmin</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-700">Panel label</span>
              <input
                value={formState.panelLabel}
                onChange={(event) => setFormState((current) => ({ ...current, panelLabel: event.target.value }))}
                className="h-12 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
              />
            </label>
            <label className="space-y-2 text-sm lg:col-span-2">
              <span className="font-semibold text-slate-700">Login URL</span>
              <input
                value={formState.loginUrl}
                onChange={(event) => setFormState((current) => ({ ...current, loginUrl: event.target.value }))}
                className="h-12 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-700">Username</span>
              <input
                value={formState.username}
                onChange={(event) => setFormState((current) => ({ ...current, username: event.target.value }))}
                className="h-12 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-700">Access ready</span>
              <button
                type="button"
                onClick={() => setFormState((current) => ({ ...current, isReady: !current.isReady }))}
                className={`flex h-12 w-full items-center rounded-[20px] border px-4 text-sm font-medium transition ${formState.isReady ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}
              >
                {formState.isReady ? "Ready for customer login" : "Still pending"}
              </button>
            </label>
            <label className="space-y-2 text-sm lg:col-span-2">
              <span className="font-semibold text-slate-700">Customer notes</span>
              <textarea
                value={formState.notes}
                onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
                className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
              />
            </label>
          </div>
        </section>
      ) : null}
      {provisions.map((provision) => {
        const configuration = provision.configuration ?? {
          operatingSystemName: null,
          controlPanelName: null,
          addonNames: [],
          locationName: null,
          extraMonthlyPrice: 0,
          summaryLines: []
        };
        const domain = provision.domain ?? {
          mode: "none" as const,
          name: null,
          years: 1,
          privacyProtection: true,
          totalPrice: 0,
          status: "not_requested",
          registrarReference: null,
          errorMessage: null
        };

        return <section key={provision._id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm text-slate-500">{provision.customerEmail}</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Magnetic VPS Hosting · {provision.tierName}</h2>
              <p className="mt-2 text-sm text-slate-600">Order ID: {provision.orderId}</p>
            </div>
            <div className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold ${getTone(provision.status)}`}>
              {provision.status}
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-950">Configuration</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Operating system: {configuration.operatingSystemName ?? "Default"}</div>
                <div>Control panel: {configuration.controlPanelName ?? "None"}</div>
                <div>Region: {configuration.locationName ?? "Default"}</div>
                <div>Configuration uplift: ${configuration.extraMonthlyPrice.toFixed(2)}</div>
                <div>Add-ons: {configuration.addonNames.length ? configuration.addonNames.join(", ") : "None"}</div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-950">Domain</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Mode: {domain.mode === "register" ? "Register with VPS" : "No domain attached"}</div>
                <div>Domain: {domain.name ?? "None"}</div>
                <div>Years: {domain.mode === "register" ? domain.years : "-"}</div>
                <div>Status: {domain.status}</div>
                <div>Registrar reference: {domain.registrarReference ?? "Pending"}</div>
                <div>Charge: ${domain.totalPrice.toFixed(2)}</div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-950">Reseller</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Contract ID: {provision.reseller.contractId ?? "Pending"}</div>
                <div>Admin ID: {provision.reseller.adminId ?? "Pending"}</div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-950">Cloud</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Location: {provision.cloud.location ?? "Pending"}</div>
                <div>Data center ID: {provision.cloud.datacenterId ?? "Pending"}</div>
                <div>Server ID: {provision.cloud.serverId ?? "Pending"}</div>
                <div>Volume ID: {provision.cloud.volumeId ?? "Pending"}</div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 lg:col-span-2">
              <div className="text-sm font-semibold text-slate-950">Customer panel access</div>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <div>Panel: {provision.access.panelLabel ?? provision.access.panel}</div>
                <div>Ready: {provision.access.isReady ? "Yes" : "No"}</div>
                <div>Username: {provision.access.username ?? "Pending"}</div>
                <div>Login URL: {provision.access.loginUrl ?? "Pending"}</div>
              </div>
              {provision.access.notes ? <div className="mt-3 text-sm text-slate-600">{provision.access.notes}</div> : null}
            </div>
          </div>
          {provision.errorMessage ? (
            <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {provision.errorMessage}
            </div>
          ) : null}
          {domain.errorMessage ? (
            <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {domain.errorMessage}
            </div>
          ) : null}
          <div className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-400">
            Last updated {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(provision.updatedAt))}
          </div>
        </section>;
      })}
    </div>
  );
}
