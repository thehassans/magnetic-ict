"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";

type AdminOrder = {
  id: string;
  userEmail: string;
  serviceNameSnapshot: string;
  tierNameSnapshot: string;
  serviceCatalogKey: string | null;
  tierCatalogKey: string | null;
  amount: number;
  status: "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  paymentMethod: "UNKNOWN" | "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY" | "MANUAL";
  invoiceNumber: string | null;
  createdAt: string;
  events: Array<{
    id: string;
    type: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
    createdAt: string;
  }>;
};

function getStatusTone(status: AdminOrder["status"]) {
  switch (status) {
    case "PAID":
    case "FULFILLED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "FAILED":
    case "CANCELLED":
      return "border-rose-400/20 bg-rose-400/10 text-rose-200";
    default:
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  }
}

function getStatusLabel(status: AdminOrder["status"], commerce: ReturnType<typeof useTranslations>) {
  switch (status) {
    case "PENDING":
      return commerce("statusPending");
    case "PAID":
      return commerce("statusPaid");
    case "FAILED":
      return commerce("statusFailed");
    case "CANCELLED":
      return commerce("statusCancelled");
    case "FULFILLED":
      return commerce("statusFulfilled");
    default:
      return status;
  }
}

function getEventLabel(eventType: AdminOrder["events"][number]["type"], commerce: ReturnType<typeof useTranslations>) {
  switch (eventType) {
    case "CREATED":
      return commerce("eventCreated");
    case "PAID":
      return commerce("statusPaid");
    case "FAILED":
      return commerce("statusFailed");
    case "CANCELLED":
      return commerce("statusCancelled");
    case "FULFILLED":
      return commerce("statusFulfilled");
    default:
      return eventType;
  }
}

export function AdminOrdersClient({ orders, locale }: { orders: AdminOrder[]; locale: string }) {
  const t = useTranslations("Pages");
  const commerce = useTranslations("Commerce");
  const navigation = useTranslations("Navigation");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminOrder["status"]>("ALL");

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        order.userEmail.toLowerCase().includes(normalizedQuery) ||
        order.serviceNameSnapshot.toLowerCase().includes(normalizedQuery) ||
        order.tierNameSnapshot.toLowerCase().includes(normalizedQuery) ||
        order.invoiceNumber?.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  function handleFulfill(orderId: string) {
    setError("");
    setActiveOrderId(orderId);

    startTransition(async () => {
      const response = await fetch(`/api/admin/orders/${orderId}/fulfill`, {
        method: "POST"
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? t("adminOrdersFulfillError"));
        setActiveOrderId(null);
        return;
      }

      setActiveOrderId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_220px]">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("adminOrdersSearchPlaceholder")}
          className="h-11 rounded-full border border-white/10 bg-slate-950/50 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "ALL" | AdminOrder["status"])}
          className="h-11 rounded-full border border-white/10 bg-slate-950/50 px-4 text-sm text-white outline-none transition focus:border-cyan-400/40"
        >
          <option value="ALL">{t("adminOrdersFilterAll")}</option>
          <option value="PENDING">{commerce("statusPending")}</option>
          <option value="PAID">{commerce("statusPaid")}</option>
          <option value="FAILED">{commerce("statusFailed")}</option>
          <option value="CANCELLED">{commerce("statusCancelled")}</option>
          <option value="FULFILLED">{commerce("statusFulfilled")}</option>
        </select>
      </div>
      <p className="text-sm text-slate-400">
        {t("adminOrdersFilteredSummary", { visible: filteredOrders.length, total: orders.length })}
      </p>
      {filteredOrders.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
          {t("adminOrdersFilteredEmpty")}
        </div>
      ) : null}
      {filteredOrders.map((order) => (
        <div key={order.id} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm text-slate-400">{order.userEmail}</div>
              <div className="mt-2 text-lg font-semibold text-white">
                {order.serviceCatalogKey ? getServiceTitle(navigation, order.serviceCatalogKey) : order.serviceNameSnapshot}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                {order.tierCatalogKey
                  ? getLocalizedTierName(commerce, order.tierCatalogKey, order.tierNameSnapshot)
                  : order.tierNameSnapshot}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-white">${order.amount.toFixed(2)}</div>
              <div className="mt-1 text-sm text-slate-400">
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(order.createdAt))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className={`rounded-full border px-3 py-1.5 ${getStatusTone(order.status)}`}>
              {t("dashboardStatusLabel")}: {getStatusLabel(order.status, commerce)}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200">
              {t("dashboardPaymentLabel")}: {order.paymentMethod}
            </span>
            {order.invoiceNumber ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-200">
                {t("dashboardInvoiceLabel")}: {order.invoiceNumber}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/admin/orders/${order.id}`}
              locale={locale}
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("adminOrderDetailOpen")}
            </Link>
            <Link
              href={`/dashboard/orders/${order.id}/invoice`}
              locale={locale}
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("dashboardViewInvoice")}
            </Link>
            <button
              type="button"
              onClick={() => handleFulfill(order.id)}
              disabled={isPending || activeOrderId === order.id || order.status !== "PAID"}
              className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeOrderId === order.id ? t("adminOrdersFulfilling") : t("adminOrdersFulfillAction")}
            </button>
          </div>

          {order.events.length > 0 ? (
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("dashboardTimelineLabel")}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.events.map((event) => (
                  <span
                    key={event.id}
                    className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1.5 text-xs text-slate-300"
                  >
                    {getEventLabel(event.type, commerce)} · {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(event.createdAt))}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
