import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

type InvoiceOrder = {
  id: string;
  userId: string;
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
  paymentMethod: "UNKNOWN" | "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY" | "MANUAL";
  status: "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  createdAt: Date;
  paidAt: Date | null;
  user: {
    email: string;
    name: string | null;
  };
  events: Array<{
    id: string;
    type: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
    createdAt: Date;
  }>;
};

export default async function InvoicePage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("Pages");
  const commerce = await getTranslations("Commerce");
  const navigation = await getTranslations("Navigation");
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  if (!hasDatabase) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[36px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{t("invoiceTitle")}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">{t("adminDatabaseRequired")}</p>
        </section>
      </main>
    );
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
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          createdAt: true
        }
      }
    }
  })) as InvoiceOrder | null;

  if (!order) {
    notFound();
  }

  const isAdmin = session.user.role === "ADMIN";

  if (!isAdmin && order.userId !== session.user.id) {
    notFound();
  }

  const issueDate = order.paidAt ?? order.createdAt;

  const getStatusLabel = (status: InvoiceOrder["status"]) => {
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

  const getEventLabel = (eventType: InvoiceOrder["events"][number]["type"]) => {
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
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("invoiceEyebrow")}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{t("invoiceTitle")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">{t("invoiceDescription")}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-right dark:border-white/10 dark:bg-slate-950/50">
            <div className="text-sm text-slate-500 dark:text-slate-400">{t("dashboardInvoiceLabel")}</div>
            <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{order.invoiceNumber ?? t("invoicePending")}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950/40">
            <div className="text-sm text-slate-500 dark:text-slate-400">{t("invoiceCustomer")}</div>
            <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{order.user.name ?? order.user.email}</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{order.user.email}</div>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950/40">
            <div className="text-sm text-slate-500 dark:text-slate-400">{t("invoiceIssued")}</div>
            <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(issueDate)}</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("dashboardStatusLabel")}: {getStatusLabel(order.status)}</div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950/40">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">{t("invoiceService")}</div>
              <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
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
              <div className="text-sm text-slate-500 dark:text-slate-400">{t("invoiceTotal")}</div>
              <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">${order.amount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950/40">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">{t("dashboardTimelineLabel")}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {order.events.map((event) => (
              <span
                key={event.id}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                {getEventLabel(event.type)} · {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(event.createdAt)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            locale={locale}
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
          >
            {commerce("returnToDashboard")}
          </Link>
          {isAdmin ? (
            <Link
              href="/admin/orders"
              locale={locale}
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              {t("adminOrdersTitle")}
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
