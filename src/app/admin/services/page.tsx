import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminServiceEditor } from "@/components/admin/admin-service-editor";
import { AdminServiceVisibilityControls } from "@/components/admin/admin-service-visibility-controls";
import { AdminSyncServicesButton } from "@/components/admin/admin-sync-services-button";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getServiceCatalogWithOverrides, type ServiceOverride } from "@/lib/service-overrides";

const hasDatabase = Boolean(process.env.DATABASE_URL);

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
        description="Sync, edit, hide, or restore services."
        activePath="/admin/services"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` and sync Prisma to unlock service management.
        </div>
      </AdminShell>
    );
  }

  const [services, orders] = await Promise.all([
    getServiceCatalogWithOverrides(),
    prisma.order.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        serviceTierId: true
      }
    })
  ]);

  const typedOrders = orders as ServiceOrder[];

  return (
    <AdminShell
      title="Manage services"
      description="Edit pricing and control storefront visibility."
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
        <StatCard label="Catalog services" value={String(services.length)} />
        <StatCard label="Hidden or deleted" value={String(services.filter((service: ServiceOverride) => !service.visibility.enabled || service.visibility.deleted).length)} />
        <StatCard label="Total tiers" value={String(services.reduce((sum: number, service: ServiceOverride) => sum + service.tiers.length, 0))} />
      </section>

      <section className="space-y-4">
        {services.map((service: ServiceOverride) => {
          const tierIds = new Set(service.tiers.map((tier: ServiceOverride["tiers"][number]) => tier.id));
          const serviceOrders = typedOrders.filter((order) => tierIds.has(order.serviceTierId) && (order.status === "PAID" || order.status === "FULFILLED"));
          const grossRevenue = serviceOrders.reduce((sum, order) => sum + order.amount, 0);

          return (
            <div key={service.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{service.category}</div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{service.name}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {!service.visibility.enabled && !service.visibility.deleted ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Disabled</span> : null}
                    {service.visibility.deleted ? <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-800">Deleted</span> : null}
                    {service.overrides.title ? <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">Title override</span> : null}
                    {service.overrides.description ? <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">Description override</span> : null}
                    {Object.values(service.overrides.tierPrices).some(Boolean) ? <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Pricing override</span> : null}
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-right">
                  <div className="text-sm text-slate-500">Completed revenue</div>
                  <div className="mt-1 text-2xl font-semibold text-slate-950">{formatCurrency(grossRevenue)}</div>
                  <div className="mt-1 text-sm text-slate-500">{serviceOrders.length} sold tiers</div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
                {service.imageUrl ? (
                  <div className="relative aspect-[16/7] w-full">
                    <Image src={service.imageUrl} alt={service.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" unoptimized />
                  </div>
                ) : (
                  <div className="flex aspect-[16/7] items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.14),transparent_24%),#f8fafc] text-sm text-slate-500">
                    No service image uploaded yet.
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {service.tiers.map((tier: ServiceOverride["tiers"][number]) => {
                  const tierOrders = typedOrders.filter((order) => order.serviceTierId === tier.id && (order.status === "PAID" || order.status === "FULFILLED"));

                  return (
                    <div key={tier.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{tier.id}</div>
                      <div className="mt-3 text-xl font-semibold text-slate-950">{tier.name}</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{formatCurrency(tier.price)}</div>
                      <div className="mt-3 text-sm text-slate-500">{tierOrders.length} completed purchases</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <AdminServiceVisibilityControls service={service} disabled={!hasDatabase} />
              </div>

              <AdminServiceEditor service={service} disabled={!hasDatabase} />
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
