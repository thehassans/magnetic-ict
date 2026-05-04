import { Activity, BarChart3, Globe2, Receipt } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { getDomainOrdersForUser } from "@/lib/domain-db";
import { getManagedDomainsForUser } from "@/lib/domain-management-db";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";
import { prisma } from "@/lib/prisma";
import { userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";

type DashboardOrder = {
  id: string;
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

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Pages");
  const commerce = await getTranslations("Commerce");
  const navigation = await getTranslations("Navigation");
  const session = await auth();

  const [orders, domainOrders, managedDomains, hasMagneticSocialBotAccess] = session?.user?.id
    ? await Promise.all([
        prisma.order.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 6,
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
        }),
        getDomainOrdersForUser(session.user.id),
        getManagedDomainsForUser(session.user.id),
        userHasMagneticSocialBotAccess(session.user.id)
      ])
    : [[], [], [], false];

  const visibleOrders = orders.filter(
    (order: DashboardOrder) => order.status !== "FAILED" && order.status !== "CANCELLED"
  );
  const visibleDomainOrders = domainOrders.filter(
    (order) => order.status !== "failed" && order.status !== "cancelled"
  ).length;
  const activeServices = visibleOrders.filter((order: DashboardOrder) => order.status === "PAID" || order.status === "FULFILLED").length;
  const pendingOrders = visibleOrders.filter((order: DashboardOrder) => order.status === "PENDING").length;
  const activeDomains = managedDomains.filter((domain) => domain.status === "active").length;

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
      <section className="rounded-[36px] border border-slate-200/80 bg-white/88 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{t("dashboardEyebrow")}</div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Customer workspace</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Manage active services, open invoices, and purchased domains from one proper client panel.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/orders" locale={locale} className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
              Open orders
            </Link>
            <Link href="/dashboard/domains" locale={locale} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]">
              Open domains
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[30px] border border-slate-200/80 bg-white/88 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72">
          <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          <div className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Active services</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{activeServices}</div>
        </div>
        <div className="rounded-[30px] border border-slate-200/80 bg-white/88 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72">
          <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          <div className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Pending orders</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{pendingOrders}</div>
        </div>
        <div className="rounded-[30px] border border-slate-200/80 bg-white/88 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72">
          <Globe2 className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          <div className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Managed domains</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{managedDomains.length}</div>
        </div>
        <div className="rounded-[30px] border border-slate-200/80 bg-white/88 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72">
          <Receipt className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          <div className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">Visible orders</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{visibleOrders.length}</div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-[36px] border border-slate-200/80 bg-white/88 p-7 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Workspace shortcuts</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Everything important in one place</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Use the sidebar to move through your workspace, or jump directly into the areas you use most.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/orders" locale={locale} className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
              View order history
            </Link>
            <Link href="/dashboard/domains" locale={locale} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]">
              Manage domains
            </Link>
            <Link href="/domains" locale={locale} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]">
              Search new domains
            </Link>
          </div>
        </div>

        <div className="rounded-[36px] border border-slate-200/80 bg-white/88 p-7 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Account snapshot</div>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="text-sm text-slate-500 dark:text-slate-400">Active domains</span>
              <span className="text-lg font-semibold text-slate-950 dark:text-white">{activeDomains}</span>
            </div>
            <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="text-sm text-slate-500 dark:text-slate-400">Visible domain orders</span>
              <span className="text-lg font-semibold text-slate-950 dark:text-white">{visibleDomainOrders}</span>
            </div>
            <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="text-sm text-slate-500 dark:text-slate-400">Recent service orders</span>
              <span className="text-lg font-semibold text-slate-950 dark:text-white">{visibleOrders.length}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-slate-200/80 bg-white/88 p-7 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 sm:p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("dashboardRecentOrdersTitle")}</p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">{t("dashboardRecentOrdersDescription")}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">{commerce("webhookPendingNote")}</p>

        {visibleOrders.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
            {t("dashboardEmptyOrders")}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleOrders.map((order: DashboardOrder) => (
              <div
                key={order.id}
                className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]"
              >
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
                    href="/dashboard/orders"
                    locale={locale}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    Open all orders
                  </Link>
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

      {hasMagneticSocialBotAccess ? (
        <section className="rounded-[36px] border border-violet-100 bg-white/90 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/40 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Unlocked</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Magnetic Social Bot</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            Open your onboarding wizard, connect channels, upload business documents, and manage the unified inbox.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/magnetic-social-bot"
              locale={locale}
              className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Open Command Center
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
