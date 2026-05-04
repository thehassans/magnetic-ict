import { Bot, Globe2, Receipt, Server } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { getDomainOrdersForUser } from "@/lib/domain-db";
import { getManagedDomainsForUser } from "@/lib/domain-management-db";
import { userHasMagneticVpsAccess } from "@/lib/hosting-access";
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

  const [orders, domainOrders, managedDomains, hasMagneticVpsAccess, hasMagneticSocialBotAccess] = session?.user?.id
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
        userHasMagneticVpsAccess(session.user.id),
        userHasMagneticSocialBotAccess(session.user.id)
      ])
    : [[], [], [], false, false];

  const visibleOrders = orders.filter(
    (order: DashboardOrder) => order.status !== "FAILED" && order.status !== "CANCELLED"
  );
  const visibleDomainOrders = domainOrders.filter(
    (order) => order.status !== "failed" && order.status !== "cancelled"
  ).length;
  const activeDomains = managedDomains.filter((domain) => domain.status === "active").length;

  const purchasedServices = [
    ...(visibleOrders.length > 0
      ? [
          {
            key: "orders",
            title: "Orders & billing",
            description: `${visibleOrders.length} purchased order${visibleOrders.length === 1 ? "" : "s"}`,
            href: "/dashboard/orders",
            actionLabel: "Open orders",
            Icon: Receipt
          }
        ]
      : []),
    ...(managedDomains.length > 0 || visibleDomainOrders > 0
      ? [
          {
            key: "domains",
            title: "Domains",
            description: `${managedDomains.length} managed domain${managedDomains.length === 1 ? "" : "s"}`,
            href: "/dashboard/domains",
            actionLabel: "Manage domains",
            Icon: Globe2
          }
        ]
      : []),
    ...(hasMagneticVpsAccess
      ? [
          {
            key: "hosting",
            title: "Hosting",
            description: "Open your VPS workspace and access your hosting control panel",
            href: "/dashboard/hosting",
            actionLabel: "Open hosting",
            Icon: Server
          }
        ]
      : []),
    ...(hasMagneticSocialBotAccess
      ? [
          {
            key: "social-bot",
            title: "Magnetic Social Bot",
            description: "Open your connected inbox and automation workspace",
            href: "/dashboard/magnetic-social-bot",
            actionLabel: "Open workspace",
            Icon: Bot
          }
        ]
      : [])
  ];

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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">{t("dashboardEyebrow")}</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Purchased services</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">A clean view of the services you already bought and can manage from your dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/orders" locale={locale} className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
              Open orders
            </Link>
            <Link href="/dashboard/domains" locale={locale} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]">
              Open domains
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Purchased services</div>
        {purchasedServices.length === 0 ? (
          <div className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
            No purchased services are available in this workspace yet.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {purchasedServices.map(({ key, title, description, href, actionLabel, Icon }) => (
              <div key={key} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</div>
                <div className="mt-5">
                  <Link
                    href={href}
                    locale={locale}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    {actionLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Service summary</div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="text-sm text-slate-500 dark:text-slate-400">Purchased services</span>
              <span className="text-lg font-semibold text-slate-950 dark:text-white">{purchasedServices.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="text-sm text-slate-500 dark:text-slate-400">Managed domains</span>
              <span className="text-lg font-semibold text-slate-950 dark:text-white">{activeDomains}</span>
            </div>
            <div className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="text-sm text-slate-500 dark:text-slate-400">Active orders</span>
              <span className="text-lg font-semibold text-slate-950 dark:text-white">{visibleOrders.length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Quick actions</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link href="/dashboard/orders" locale={locale} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06]">
              View order history
            </Link>
            <Link href="/dashboard/domains" locale={locale} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06]">
              Manage domains
            </Link>
            <Link href="/domains" locale={locale} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06]">
              Search new domains
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">{t("dashboardRecentOrdersTitle")}</p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">{t("dashboardRecentOrdersDescription")}</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">{commerce("webhookPendingNote")}</p>

        {visibleOrders.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
            {t("dashboardEmptyOrders")}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {visibleOrders.map((order: DashboardOrder) => (
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

    </div>
  );
}
