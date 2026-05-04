import { Receipt, TimerReset } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";

type DashboardOrder = {
  id: string;
  userId: string;
  status: "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  paymentMethod: "UNKNOWN" | "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY" | "MANUAL";
  amount: number;
  serviceNameSnapshot: string;
  tierNameSnapshot: string;
  serviceTier: {
    catalogKey: string;
    service: {
      catalogKey: string;
    };
  } | null;
  invoiceNumber: string | null;
  createdAt: Date;
  events: Array<{
    id: string;
    type: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
    createdAt: Date;
  }>;
};

export default async function DashboardOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Pages");
  const commerce = await getTranslations("Commerce");
  const navigation = await getTranslations("Navigation");
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 24,
    include: {
      serviceTier: {
        select: {
          catalogKey: true,
          service: {
            select: {
              catalogKey: true
            }
          }
        }
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          type: true,
          createdAt: true
        }
      }
    }
  }) as DashboardOrder[];

  const visibleOrders = orders.filter((order) => order.status !== "FAILED" && order.status !== "CANCELLED");
  const paidOrders = visibleOrders.filter((order) => order.status === "PAID" || order.status === "FULFILLED").length;
  const pendingOrders = visibleOrders.filter((order) => order.status === "PENDING").length;

  const getStatusLabel = (status: DashboardOrder["status"]) => {
    switch (status) {
      case "PENDING":
        return commerce("statusPending");
      case "PAID":
        return commerce("statusPaid");
      case "FULFILLED":
        return commerce("statusFulfilled");
      default:
        return status;
    }
  };

  const getEventLabel = (eventType: DashboardOrder["events"][number]["type"]) => {
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
  };

  const getPaymentLabel = (paymentMethod: DashboardOrder["paymentMethod"]) => {
    switch (paymentMethod) {
      case "STRIPE":
        return commerce("paymentStripe");
      case "PAYPAL":
        return commerce("paymentPaypal");
      case "APPLE_PAY":
        return commerce("paymentApplePay");
      case "GOOGLE_PAY":
        return commerce("paymentGooglePay");
      case "MANUAL":
        return commerce("paymentManual");
      default:
        return commerce("paymentUnknown");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Assigned service</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Orders</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Track invoices, payment states, and service history from your workspace.</p>
          </div>
          <Link href="/dashboard" locale={locale} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]">
            Back to overview
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <Receipt className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          <div className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Visible orders</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{visibleOrders.length}</div>
        </div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <TimerReset className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          <div className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Pending</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{pendingOrders}</div>
        </div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <Receipt className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          <div className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Paid or fulfilled</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{paidOrders}</div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Recent activity</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Order history</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{commerce("webhookPendingNote")}</p>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
            {t("dashboardEmptyOrders")}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleOrders.map((order) => (
              <div key={order.id} className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-950 dark:text-white">
                      {order.serviceTier?.service.catalogKey
                        ? getServiceTitle(navigation as unknown as (key: string) => string, order.serviceTier.service.catalogKey)
                        : order.serviceNameSnapshot}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {order.serviceTier?.catalogKey
                        ? getLocalizedTierName(commerce as unknown as (key: string) => string, order.serviceTier.catalogKey, order.tierNameSnapshot)
                        : order.tierNameSnapshot}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-slate-950 dark:text-white">${order.amount.toFixed(2)}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {t("dashboardPlacedLabel")}: {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(order.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                    {t("dashboardStatusLabel")}: {getStatusLabel(order.status)}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                    {t("dashboardPaymentLabel")}: {getPaymentLabel(order.paymentMethod)}
                  </span>
                  {order.invoiceNumber ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                      {t("dashboardInvoiceLabel")}: {order.invoiceNumber}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/orders/${order.id}/invoice`}
                    locale={locale}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    {t("dashboardViewInvoice")}
                  </Link>
                </div>
                {order.events.length > 0 ? (
                  <div className="mt-4 border-t border-slate-200 pt-4 dark:border-white/10">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500">{t("dashboardTimelineLabel")}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.events.map((event) => (
                        <span
                          key={event.id}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300"
                        >
                          {getEventLabel(event.type)} · {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(event.createdAt)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
