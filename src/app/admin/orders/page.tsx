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
      <AdminShell title={t("adminOrdersTitle")} description="Track order flow and fulfillment.">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-8 text-white/40 text-sm">
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
    <AdminShell title={t("adminOrdersTitle")} eyebrow="Fulfillment" description="Track order flow and fulfillment status.">
      {/* Stats */}
      <section className="grid gap-px border border-slate-200 rounded-xl overflow-hidden bg-slate-200 dark:border-white/[0.06] dark:bg-white/[0.04] md:grid-cols-3">
        {[
          { label: t("dashboardPendingOrders"), value: pendingCount },
          { label: t("adminOrdersPaid"),        value: paidCount },
          { label: t("adminOrdersFulfilled"),   value: fulfilledCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white px-5 py-4 dark:bg-[#0d0d12]">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
            <p className="mt-1.5 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          </div>
        ))}
      </section>

      {/* Orders */}
      <section className="mt-4 rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-white/[0.06] dark:bg-[#0d0d12]">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-slate-400 dark:text-slate-500">
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
