"use client";

import { useState } from "react";
import { Globe2, Smartphone, Store, Building2, Mail, DollarSign, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

type Installation = {
  _id: string;
  orderId: string;
  userId: string;
  customerEmail: string;
  customerName: string | null;
  tierName: string;
  status: "pending_domain_assignment" | "integration_requested" | "active" | "failed";
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
  assignedDomainId: string | null;
  assignedDomain: string | null;
  assignedAt: string | null;
  storefrontUrl: string | null;
  adminUrl: string | null;
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

export function AdminMagneticCommerceClient({ installations }: { installations: Installation[] }) {
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "failed">("all");

  const filtered = installations.filter((installation) => {
    if (filter === "all") return true;
    if (filter === "pending") return installation.status === "pending_domain_assignment" || installation.status === "integration_requested";
    if (filter === "active") return installation.status === "active";
    if (filter === "failed") return installation.status === "failed";
    return true;
  });

  const pendingCount = installations.filter((i) => i.status === "pending_domain_assignment" || i.status === "integration_requested").length;
  const activeCount = installations.filter((i) => i.status === "active").length;
  const failedCount = installations.filter((i) => i.status === "failed").length;

  function getStatusBadge(status: Installation["status"]) {
    switch (status) {
      case "pending_domain_assignment":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" /> Domain assignment pending
          </span>
        );
      case "integration_requested":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <Clock className="h-3 w-3" /> Integration requested
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Active
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
            <AlertCircle className="h-3 w-3" /> Failed
          </span>
        );
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500">Total installations</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{installations.length}</div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500">Pending</div>
          <div className="mt-2 text-2xl font-semibold text-amber-600">{pendingCount}</div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500">Active</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600">{activeCount}</div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500">Failed</div>
          <div className="mt-2 text-2xl font-semibold text-rose-600">{failedCount}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filter === "all" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filter === "pending" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filter === "active" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("failed")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            filter === "failed" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Failed ({failedCount})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
          No installations found for the selected filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((installation) => (
            <div key={installation._id} className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(installation.status)}
                    <div className="text-xs text-slate-500">Order: {installation.orderId}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500">Customer</div>
                    <div className="mt-1 text-base font-medium text-slate-950">
                      {installation.customerName || installation.customerEmail}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-600">{installation.customerEmail}</div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm text-slate-500">Assigned domain</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Globe2 className="h-4 w-4 text-slate-400" />
                        <span className="text-base font-medium text-slate-950">
                          {installation.assignedDomain || "Not assigned"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Tier</div>
                      <div className="mt-1 text-base font-medium text-slate-950">{installation.tierName}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-sm text-slate-500">Business name</div>
                      <div className="mt-1 text-base font-medium text-slate-950 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        {installation.businessName || "Not set"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Admin email</div>
                      <div className="mt-1 text-base font-medium text-slate-950 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {installation.adminEmail || "Not set"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Currency</div>
                      <div className="mt-1 text-base font-medium text-slate-950 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        {installation.storeCurrency || "USD"}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-sm text-slate-500">App status</div>
                      <div className="mt-1 text-base font-medium text-slate-950">{installation.appStatus}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Storefront status</div>
                      <div className="mt-1 text-base font-medium text-slate-950">{installation.storefrontStatus}</div>
                    </div>
                  </div>

                  {installation.primaryColor ? (
                    <div>
                      <div className="text-sm text-slate-500">Primary color</div>
                      <div className="mt-1 flex items-center gap-2">
                        <div
                          className="h-6 w-6 rounded-full border border-slate-200"
                          style={{ backgroundColor: installation.primaryColor }}
                        />
                        <span className="text-base font-medium text-slate-950">{installation.primaryColor}</span>
                      </div>
                    </div>
                  ) : null}

                  {installation.logoUrl ? (
                    <div>
                      <div className="text-sm text-slate-500">Logo</div>
                      <div className="mt-1">
                        <div
                          className="h-12 w-auto rounded-lg border border-slate-200 bg-cover bg-center"
                          style={{ backgroundImage: `url(${installation.logoUrl})`, width: "48px" }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {installation.notes ? (
                    <div>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notes
                      </div>
                      <div className="mt-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{installation.notes}</div>
                    </div>
                  ) : null}

                  {installation.errorMessage ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                      Error: {installation.errorMessage}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Web: {installation.surfaces.web ? "Included" : "Not included"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      iOS: {installation.surfaces.ios ? "Included" : "Not included"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Android: {installation.surfaces.android ? "Included" : "Not included"}
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-600">
                    <div>Storefront: {installation.storefrontUrl || "Pending"}</div>
                    <div>Admin: {installation.adminUrl || "Pending"}</div>
                    <div>Created: {new Date(installation.createdAt).toLocaleDateString()}</div>
                    <div>Updated: {new Date(installation.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
