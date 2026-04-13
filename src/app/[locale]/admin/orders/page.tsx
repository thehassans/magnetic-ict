import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AdminOrdersClient } from "@/components/admin/admin-orders-client";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

type AdminOrder = {
  id: string;
  amount: number;
  status: "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  paymentMethod: "UNKNOWN" | "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY" | "MANUAL";
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
  user: {
    email: string;
  };
  events: Array<{
    id: string;
    type: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
    createdAt: Date;
  }>;
};

export default async function AdminOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Pages");
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/${locale}/admin?callback=${encodeURIComponent("/admin/orders")}`);
  }

  if (!hasDatabase) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-2xl sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">{t("adminOrdersEyebrow")}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t("adminOrdersTitle")}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t("adminDatabaseRequired")}</p>
        </section>
      </main>
    );
  }

  const orders = (await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
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
          email: true
        }
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          type: true,
          createdAt: true
        }
      }
    }
  })) as AdminOrder[];

  const pendingCount = orders.filter((order) => order.status === "PENDING").length;
  const paidCount = orders.filter((order) => order.status === "PAID").length;
  const fulfilledCount = orders.filter((order) => order.status === "FULFILLED").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-2xl sm:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">{t("adminOrdersEyebrow")}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t("adminOrdersTitle")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{t("adminOrdersDescription")}</p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-[30px] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
          <div className="text-sm text-slate-400">{t("dashboardPendingOrders")}</div>
          <div className="mt-2 text-3xl font-semibold text-white">{pendingCount}</div>
        </div>
        <div className="rounded-[30px] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
          <div className="text-sm text-slate-400">{t("adminOrdersPaid")}</div>
          <div className="mt-2 text-3xl font-semibold text-white">{paidCount}</div>
        </div>
        <div className="rounded-[30px] border border-white/10 bg-slate-950/40 p-6 backdrop-blur-2xl">
          <div className="text-sm text-slate-400">{t("adminOrdersFulfilled")}</div>
          <div className="mt-2 text-3xl font-semibold text-white">{fulfilledCount}</div>
        </div>
      </section>

      <section className="mt-8 rounded-[36px] border border-white/10 bg-slate-950/40 p-8 backdrop-blur-2xl sm:p-10">
        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
            {t("adminOrdersEmpty")}
          </div>
        ) : (
          <AdminOrdersClient
            locale={locale}
            orders={orders.map((order) => ({
              id: order.id,
              userEmail: order.user.email,
              serviceNameSnapshot: order.serviceNameSnapshot,
              tierNameSnapshot: order.tierNameSnapshot,
              serviceCatalogKey: order.serviceTier?.service.catalogKey ?? null,
              tierCatalogKey: order.serviceTier?.catalogKey ?? null,
              amount: order.amount,
              status: order.status,
              paymentMethod: order.paymentMethod,
              invoiceNumber: order.invoiceNumber,
              createdAt: order.createdAt.toISOString(),
              events: order.events.map((event) => ({
                id: event.id,
                type: event.type,
                createdAt: event.createdAt.toISOString()
              }))
            }))}
          />
        )}
      </section>
    </main>
  );
}
