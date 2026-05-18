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
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 hover:border-amber-500/20 transition">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">{t("dashboardPendingOrders")}</p>
          <p className="text-3xl font-black text-white">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 hover:border-emerald-500/20 transition">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">{t("adminOrdersPaid")}</p>
          <p className="text-3xl font-black text-white">{paidCount}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 hover:border-violet-500/20 transition">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">{t("adminOrdersFulfilled")}</p>
          <p className="text-3xl font-black text-white">{fulfilledCount}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden">
        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/[0.06] p-6 text-sm text-white/30 m-4">
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
