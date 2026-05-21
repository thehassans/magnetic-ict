"use client";

import { useMemo, useState, useTransition } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminSmsSender } from "@/components/admin/admin-sms-sender";
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

const STATUS_META: Record<AdminOrder["status"], { dot: string; label: string }> = {
  CART:      { dot: "bg-slate-400",   label: "Cart" },
  PENDING:   { dot: "bg-amber-400",   label: "Pending" },
  PAID:      { dot: "bg-sky-400",     label: "Paid" },
  FULFILLED: { dot: "bg-emerald-400", label: "Fulfilled" },
  FAILED:    { dot: "bg-rose-400",    label: "Failed" },
  CANCELLED: { dot: "bg-slate-500",   label: "Cancelled" },
};

function StatusDot({ status }: { status: AdminOrder["status"] }) {
  const { dot, label } = STATUS_META[status] ?? { dot: "bg-slate-400", label: status };
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
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
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchQuery =
        !q ||
        o.userEmail.toLowerCase().includes(q) ||
        o.serviceNameSnapshot.toLowerCase().includes(q) ||
        o.tierNameSnapshot.toLowerCase().includes(q) ||
        o.invoiceNumber?.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [orders, query, statusFilter]);

  function handleFulfill(orderId: string) {
    setError("");
    setActiveOrderId(orderId);
    startTransition(async () => {
      const res = await fetch(`/api/admin/orders/${orderId}/fulfill`, { method: "POST" });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(payload.error ?? t("adminOrdersFulfillError"));
        setActiveOrderId(null);
        return;
      }
      setActiveOrderId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 border-b border-slate-100 p-4 dark:border-white/[0.06] sm:flex-row sm:items-center sm:gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("adminOrdersSearchPlaceholder")}
          className="h-9 flex-1 rounded-lg border border-slate-200 bg-transparent px-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-white/[0.08] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "ALL" | AdminOrder["status"])}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none transition focus:border-slate-400 dark:border-white/[0.08] dark:bg-slate-950 dark:text-slate-300 dark:focus:border-white/20"
        >
          <option value="ALL">{t("adminOrdersFilterAll")}</option>
          <option value="PENDING">{commerce("statusPending")}</option>
          <option value="PAID">{commerce("statusPaid")}</option>
          <option value="FAILED">{commerce("statusFailed")}</option>
          <option value="CANCELLED">{commerce("statusCancelled")}</option>
          <option value="FULFILLED">{commerce("statusFulfilled")}</option>
        </select>
      </div>

      {/* Count */}
      <div className="px-4 py-2.5 text-[11px] text-slate-400 dark:text-slate-500">
        {t("adminOrdersFilteredSummary", { visible: filteredOrders.length, total: orders.length })}
      </div>

      {error && (
        <p className="px-4 py-2 text-[12px] text-rose-500">{error}</p>
      )}

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="px-4 py-12 text-center text-[13px] text-slate-400 dark:text-slate-500">
          {t("adminOrdersFilteredEmpty")}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
          {filteredOrders.map((order) => {
            const isFulfilling = activeOrderId === order.id;
            const canFulfill = order.status === "PAID" && !isPending;
            const serviceName = order.serviceCatalogKey
              ? getServiceTitle(navigation, order.serviceCatalogKey)
              : order.serviceNameSnapshot;
            const tierName = order.tierCatalogKey
              ? getLocalizedTierName(commerce, order.tierCatalogKey, order.tierNameSnapshot)
              : order.tierNameSnapshot;

            return (
              <div key={order.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] text-slate-400 dark:text-slate-500">{order.userEmail}</p>
                    <p className="mt-0.5 truncate text-[13.5px] font-medium text-slate-900 dark:text-white">{serviceName}</p>
                    <p className="truncate text-[12px] text-slate-500 dark:text-slate-400">{tierName}</p>
                  </div>
                  {/* Right */}
                  <div className="shrink-0 text-right">
                    <p className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                      ${order.amount.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(order.createdAt))}
                    </p>
                  </div>
                </div>

                {/* Status row */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StatusDot status={order.status} />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {order.paymentMethod}
                  </span>
                  {order.invoiceNumber && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      #{order.invoiceNumber}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <NextLink
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2.5 text-[11.5px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                  >
                    {t("adminOrderDetailOpen")}
                  </NextLink>
                  <Link
                    href={`/dashboard/orders/${order.id}/invoice`}
                    locale="en"
                    className="inline-flex h-7 items-center rounded-md border border-slate-200 bg-white px-2.5 text-[11.5px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
                  >
                    {t("dashboardViewInvoice")}
                  </Link>
                  <AdminSmsSender recipientLabel={order.userEmail} />
                  {canFulfill && (
                    <button
                      type="button"
                      onClick={() => handleFulfill(order.id)}
                      disabled={isPending}
                      className="inline-flex h-7 items-center rounded-md bg-slate-900 px-2.5 text-[11.5px] font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                      {isFulfilling ? t("adminOrdersFulfilling") : t("adminOrdersFulfillAction")}
                    </button>
                  )}
                </div>

                {/* Timeline */}
                {order.events.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {order.events.map((ev) => (
                      <span
                        key={ev.id}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10.5px] text-slate-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-slate-500"
                      >
                        {ev.type} · {new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(new Date(ev.createdAt))}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
