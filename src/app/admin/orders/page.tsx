import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AdminOrdersClient } from "@/components/admin/admin-orders-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const adminLocale = "en";

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

export default async function AdminOrdersPage() {
  const t = await getTranslations("Pages");
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(`/admin?callback=${encodeURIComponent("/admin/orders")}`);
  }

  if (!hasDatabase) {
    return (
      <AdminShell title={t("adminOrdersTitle")} description="Track order flow and fulfillment." activePath="/admin/orders">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          {t("adminDatabaseRequired")}
        </div>
      </AdminShell>
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
    <AdminShell title={t("adminOrdersTitle")} description="Track order flow and fulfillment." activePath="/admin/orders">
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="text-sm text-slate-500">{t("dashboardPendingOrders")}</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950">{pendingCount}</div>
        </div>
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="text-sm text-slate-500">{t("adminOrdersPaid")}</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950">{paidCount}</div>
        </div>
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="text-sm text-slate-500">{t("adminOrdersFulfilled")}</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950">{fulfilledCount}</div>
        </div>
      </section>

      <section className="mt-8 rounded-[36px] border border-slate-200 bg-slate-950 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] sm:p-10">
        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
            {t("adminOrdersEmpty")}
          </div>
        ) : (
          <AdminOrdersClient
            locale={adminLocale}
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
    </AdminShell>
  );
}
