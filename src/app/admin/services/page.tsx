import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminSyncServicesButton } from "@/components/admin/admin-sync-services-button";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { serviceCatalog } from "@/lib/service-catalog";

const hasDatabase = Boolean(process.env.DATABASE_URL);

type AdminService = {
  id: string;
  catalogKey: string;
  name: string;
  category: string;
  description: string;
  tiers: Array<{
    id: string;
    catalogKey: string;
    name: string;
    price: number;
  }>;
};

type ServiceOrder = {
  id: string;
  amount: number;
  status: "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  serviceTierId: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default async function AdminServicesPage() {
  await requireAdmin("/admin/services");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Manage services"
        description="Inspect your synchronized service catalog, price architecture, and what customers are purchasing most."
        activePath="/admin/services"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` and sync Prisma to unlock service management.
        </div>
      </AdminShell>
    );
  }

  const [services, orders] = await Promise.all([
    prisma.service.findMany({
      orderBy: { name: "asc" },
      include: {
        tiers: {
          orderBy: { price: "asc" },
          select: {
            id: true,
            catalogKey: true,
            name: true,
            price: true
          }
        }
      }
    }),
    prisma.order.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        serviceTierId: true
      }
    })
  ]);

  const typedServices = services as AdminService[];
  const typedOrders = orders as ServiceOrder[];

  return (
    <AdminShell
      title="Manage services"
      description="Your service catalog currently syncs from the static product definition into Prisma. This workspace gives operators visibility into pricing blocks, categories, and purchase demand."
      activePath="/admin/services"
      actions={
        <div className="flex flex-wrap gap-3">
          <AdminSyncServicesButton disabled={!hasDatabase} />
          <Link
            href="/en/services"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-6 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Open storefront services
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      }
    >
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard label="Static catalog services" value={String(serviceCatalog.length)} />
        <StatCard label="Persisted services" value={String(typedServices.length)} />
        <StatCard label="Total tiers" value={String(typedServices.reduce((sum, service) => sum + service.tiers.length, 0))} />
      </section>

      <section className="space-y-4">
        {typedServices.map((service) => {
          const tierIds = new Set(service.tiers.map((tier) => tier.id));
          const serviceOrders = typedOrders.filter((order) => tierIds.has(order.serviceTierId) && (order.status === "PAID" || order.status === "FULFILLED"));
          const grossRevenue = serviceOrders.reduce((sum, order) => sum + order.amount, 0);

          return (
            <div key={service.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{service.category}</div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{service.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-right">
                  <div className="text-sm text-slate-500">Completed revenue</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-950">{formatCurrency(grossRevenue)}</div>
                  <div className="mt-1 text-sm text-slate-500">{serviceOrders.length} sold tiers</div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {service.tiers.map((tier) => {
                  const tierOrders = typedOrders.filter((order) => order.serviceTierId === tier.id && (order.status === "PAID" || order.status === "FULFILLED"));

                  return (
                    <div key={tier.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{tier.catalogKey}</div>
                      <div className="mt-3 text-xl font-semibold text-slate-950">{tier.name}</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{formatCurrency(tier.price)}</div>
                      <div className="mt-3 text-sm text-slate-500">{tierOrders.length} completed purchases</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </AdminShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}
