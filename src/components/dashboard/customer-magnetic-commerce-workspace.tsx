"use client";

import { useRouter } from "next/navigation";
import { Globe2, Smartphone, Store, Workflow } from "lucide-react";
import { useState, useTransition } from "react";

type DomainOption = {
  id: string;
  domain: string;
  status: string;
};

type Installation = {
  _id: string;
  orderId: string;
  tierName: string;
  status: "pending_domain_assignment" | "integration_requested" | "active" | "failed";
  assignedDomainId: string | null;
  assignedDomain: string | null;
  storefrontUrl: string | null;
  adminUrl: string | null;
  errorMessage: string | null;
  surfaces: {
    web: boolean;
    ios: boolean;
    android: boolean;
  };
  businessName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  adminEmail: string | null;
  storeCurrency: string | null;
  appStatus: "pending" | "deploying" | "live" | "maintenance" | "offline";
  storefrontStatus: "pending" | "deploying" | "live" | "maintenance" | "offline";
  notes: string | null;
};

export function CustomerMagneticCommerceWorkspace({
  installations,
  domains
}: {
  installations: Installation[];
  domains: DomainOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<Record<string, string>>(
    Object.fromEntries(installations.map((installation) => [installation.orderId, installation.assignedDomainId ?? ""]))
  );
  const [configData, setConfigData] = useState<Record<string, {
    businessName: string;
    logoUrl: string;
    primaryColor: string;
    adminEmail: string;
    storeCurrency: string;
    notes: string;
  }>>(
    Object.fromEntries(installations.map((installation) => [
      installation.orderId,
      {
        businessName: installation.businessName ?? "",
        logoUrl: installation.logoUrl ?? "",
        primaryColor: installation.primaryColor ?? "",
        adminEmail: installation.adminEmail ?? "",
        storeCurrency: installation.storeCurrency ?? "USD",
        notes: installation.notes ?? ""
      }
    ]))
  );

  function getStatusLabel(status: Installation["status"]) {
    switch (status) {
      case "pending_domain_assignment":
        return "Choose domain";
      case "integration_requested":
        return "Integration requested";
      case "active":
        return "Active";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  }

  function assignDomain(orderId: string) {
    const domainId = selectedDomains[orderId];

    if (!domainId) {
      setError("Select an active domain before requesting Magnetic Commerce integration.");
      return;
    }

    setError("");

    startTransition(async () => {
      const response = await fetch(`/api/dashboard/magnetic-commerce/installations/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          domainId,
          ...configData[orderId]
        })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to assign the selected domain right now.");
        return;
      }

      router.refresh();
    });
  }

  function updateConfig(orderId: string, field: keyof typeof configData[string], value: string) {
    setConfigData((current) => ({
      ...current,
      [orderId]: {
        ...current[orderId],
        [field]: value
      }
    }));
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {installations.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200/70 bg-slate-50/80 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
          You do not have any Magnetic Commerce installations yet. Purchase the service first to unlock domain assignment and workspace access.
        </div>
      ) : (
        <div className="space-y-4">
          {installations.map((installation) => (
            <section key={installation._id} className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Order ID: {installation.orderId}</div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    Magnetic Commerce · {installation.tierName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Select the active domain where you want Magnetic Commerce to be integrated. Admin fulfillment will only complete after this assignment is saved.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  {getStatusLabel(installation.status)}
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">Assigned domain</div>
                  <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <div>{installation.assignedDomain ?? "No domain assigned yet"}</div>
                    <select
                      value={selectedDomains[installation.orderId] ?? ""}
                      onChange={(event) =>
                        setSelectedDomains((current) => ({
                          ...current,
                          [installation.orderId]: event.target.value
                        }))
                      }
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    >
                      <option value="">Select active domain</option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.domain}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => assignDomain(installation.orderId)}
                      disabled={isPending}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
                    >
                      {isPending ? "Saving..." : installation.assignedDomain ? "Update domain" : "Assign domain"}
                    </button>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
                    <Workflow className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">Integration flow</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div>1. Purchase Magnetic Commerce</div>
                    <div>2. Choose your managed domain</div>
                    <div>3. Configure your store</div>
                    <div>4. Admin completes integration</div>
                    <div>5. Storefront and panel become active</div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">Available surfaces</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div>Web: {installation.surfaces.web ? "Included" : "Not included"}</div>
                    <div>iPhone: {installation.surfaces.ios ? "Included" : "Not included"}</div>
                    <div>Android: {installation.surfaces.android ? "Included" : "Not included"}</div>
                    <div>Storefront URL: {installation.storefrontUrl ?? "Pending"}</div>
                    <div>Admin URL: {installation.adminUrl ?? "Pending"}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-sm font-semibold text-slate-950 dark:text-white">Store configuration</div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Business name
                    </label>
                    <input
                      type="text"
                      value={configData[installation.orderId].businessName}
                      onChange={(event) => updateConfig(installation.orderId, "businessName", event.target.value)}
                      placeholder="Your business name"
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Admin email
                    </label>
                    <input
                      type="email"
                      value={configData[installation.orderId].adminEmail}
                      onChange={(event) => updateConfig(installation.orderId, "adminEmail", event.target.value)}
                      placeholder="admin@yourstore.com"
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Store currency
                    </label>
                    <select
                      value={configData[installation.orderId].storeCurrency}
                      onChange={(event) => updateConfig(installation.orderId, "storeCurrency", event.target.value)}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AED">AED</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Primary color
                    </label>
                    <input
                      type="color"
                      value={configData[installation.orderId].primaryColor}
                      onChange={(event) => updateConfig(installation.orderId, "primaryColor", event.target.value)}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={configData[installation.orderId].logoUrl}
                      onChange={(event) => updateConfig(installation.orderId, "logoUrl", event.target.value)}
                      placeholder="https://your-logo-url.com/logo.png"
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Notes
                    </label>
                    <textarea
                      value={configData[installation.orderId].notes}
                      onChange={(event) => updateConfig(installation.orderId, "notes", event.target.value)}
                      placeholder="Any additional notes for the admin team"
                      rows={3}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {installation.surfaces.ios || installation.surfaces.android ? (
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                  {installation.surfaces.ios ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                      <Smartphone className="h-4 w-4" /> iPhone app support
                    </span>
                  ) : null}
                  {installation.surfaces.android ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                      <Smartphone className="h-4 w-4" /> Android app support
                    </span>
                  ) : null}
                </div>
              ) : null}

              {installation.errorMessage ? (
                <div className="mt-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {installation.errorMessage}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      )}

      {domains.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200/70 bg-slate-50/80 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
          You need at least one active managed domain before Magnetic Commerce can be assigned. Purchase or activate a domain first.
        </div>
      ) : null}
    </div>
  );
}
