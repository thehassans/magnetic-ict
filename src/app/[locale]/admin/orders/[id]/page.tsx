import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { AdminOrderDetailActions } from "@/components/admin/admin-order-detail-actions";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

type AdminOrderDetail = {
  id: string;
  user: {
    email: string;
    name: string | null;
  };
  status: "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  paymentMethod: "UNKNOWN" | "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY" | "MANUAL";
  paymentReference: string | null;
  invoiceNumber: string | null;
  serviceNameSnapshot: string;
  tierNameSnapshot: string;
  serviceTier: {
    catalogKey: string;
    service: {
      catalogKey: string;
    };
  } | null;
  amount: number;
  currency: string;
  createdAt: Date;
  paidAt: Date | null;
  failedAt: Date | null;
  cancelledAt: Date | null;
  fulfilledAt: Date | null;
  events: Array<{
    id: string;
    type: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
    paymentRef: string | null;
    createdAt: Date;
  }>;
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = await getTranslations("Pages");
  const commerce = await getTranslations("Commerce");
  const navigation = await getTranslations("Navigation");
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/customer/sign-in?callback=${encodeURIComponent(`/admin/orders/${id}`)}&mode=admin`);
  }

  if (!hasDatabase) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-2xl sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">{t("adminOrdersEyebrow")}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t("adminOrderDetailTitle")}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t("adminDatabaseRequired")}</p>
        </section>
      </main>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    notFound();
  }

  const order = (await prisma.order.findUnique({
    where: { id },
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
      user: {
        select: {
          email: true,
          name: true
        }
      },
      events: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          paymentRef: true,
          createdAt: true
        }
      }
    }
  })) as AdminOrderDetail | null;

  if (!order) {
    notFound();
  }

  const getStatusLabel = (status: AdminOrderDetail["status"]) => {
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
  };

  const getEventLabel = (eventType: AdminOrderDetail["events"][number]["type"]) => {
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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-2xl sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">{t("adminOrdersEyebrow")}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t("adminOrderDetailTitle")}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t("adminOrderDetailDescription")}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-5 text-right">
            <div className="text-sm text-slate-400">{t("dashboardInvoiceLabel")}</div>
            <div className="mt-2 text-xl font-semibold text-white">{order.invoiceNumber ?? t("invoicePending")}</div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <div className="text-sm text-slate-400">{t("invoiceCustomer")}</div>
                <div className="mt-2 text-lg font-semibold text-white">{order.user.name ?? order.user.email}</div>
                <div className="mt-1 text-sm text-slate-400">{order.user.email}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">{t("dashboardStatusLabel")}</div>
                <div className="mt-2 text-lg font-semibold text-white">{getStatusLabel(order.status)}</div>
                <div className="mt-1 text-sm text-slate-400">{t("dashboardPaymentLabel")}: {order.paymentMethod}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">{t("invoiceService")}</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {order.serviceTier?.service.catalogKey
                    ? getServiceTitle(navigation as unknown as (key: string) => string, order.serviceTier.service.catalogKey)
                    : order.serviceNameSnapshot}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {order.serviceTier?.catalogKey
                    ? getLocalizedTierName(commerce as unknown as (key: string) => string, order.serviceTier.catalogKey, order.tierNameSnapshot)
                    : order.tierNameSnapshot}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">{t("invoiceTotal")}</div>
                <div className="mt-2 text-lg font-semibold text-white">${order.amount.toFixed(2)}</div>
                <div className="mt-1 text-sm text-slate-400">{order.currency}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-500">{t("adminOrderDetailTimeline")}</div>
            <div className="mt-4 space-y-3">
              {order.events.map((event) => (
                <div key={event.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm font-semibold text-white">{getEventLabel(event.type)}</div>
                    <div className="text-xs text-slate-400">{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(event.createdAt)}</div>
                  </div>
                  {event.paymentRef ? <div className="mt-2 text-xs text-slate-500">{t("adminOrderDetailPaymentRef")}: {event.paymentRef}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-500">{t("adminOrderDetailActions")}</div>
            <div className="mt-4">
              <AdminOrderDetailActions orderId={order.id} status={order.status} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/dashboard/orders/${order.id}/invoice`}
                locale={locale}
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t("dashboardViewInvoice")}
              </Link>
              <Link
                href="/admin/orders"
                locale={locale}
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t("adminOrdersBack")}
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-500">{t("adminOrderDetailMilestones")}</div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div>{t("invoiceIssued")}: {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(order.createdAt)}</div>
              {order.paidAt ? <div>{commerce("statusPaid")}: {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(order.paidAt)}</div> : null}
              {order.failedAt ? <div>{commerce("statusFailed")}: {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(order.failedAt)}</div> : null}
              {order.cancelledAt ? <div>{commerce("statusCancelled")}: {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(order.cancelledAt)}</div> : null}
              {order.fulfilledAt ? <div>{commerce("statusFulfilled")}: {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(order.fulfilledAt)}</div> : null}
              {order.paymentReference ? <div>{t("adminOrderDetailPaymentRef")}: {order.paymentReference}</div> : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
