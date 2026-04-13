import Link from "next/link";
import { ArrowRight, BarChart3, CreditCard, Layers3, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

type DashboardOrder = {
  id: string;
  amount: number;
  status: "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  paymentMethod: "UNKNOWN" | "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY" | "MANUAL";
  serviceNameSnapshot: string;
  createdAt: Date;
};

type TopService = {
  name: string;
  count: number;
  revenue: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default async function AdminDashboardPage() {
  await requireAdmin("/admin/dashboard");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Admin dashboard"
        description="Monitor revenue, fulfillment, users, and platform activity from a single executive overview."
        activePath="/admin/dashboard"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` and sync Prisma to unlock live admin analytics.
        </div>
      </AdminShell>
    );
  }

  const [orders, usersCount, servicesCount] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        serviceNameSnapshot: true,
        createdAt: true
      }
    }),
    prisma.user.count(),
    prisma.service.count()
  ]);

  const typedOrders = orders as DashboardOrder[];
  const revenueOrders = typedOrders.filter((order) => order.status === "PAID" || order.status === "FULFILLED");
  const pendingOrders = typedOrders.filter((order) => order.status === "PENDING");
  const revenue = revenueOrders.reduce((sum: number, order: DashboardOrder) => sum + order.amount, 0);

  const topServices = [...revenueOrders.reduce((map: Map<string, TopService>, order: DashboardOrder) => {
    const current = map.get(order.serviceNameSnapshot) ?? { name: order.serviceNameSnapshot, count: 0, revenue: 0 };
    current.count += 1;
    current.revenue += order.amount;
    map.set(order.serviceNameSnapshot, current);
    return map;
  }, new Map<string, { name: string; count: number; revenue: number }>()).values()].sort((left, right) => right.revenue - left.revenue).slice(0, 5);

  const monthlyTrend = Array.from({ length: 6 }).map((_, index) => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - (5 - index));
    const key = `${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth()}`;

    const monthOrders = revenueOrders.filter((order: DashboardOrder) => {
      const orderDate = new Date(order.createdAt);
      return `${orderDate.getUTCFullYear()}-${orderDate.getUTCMonth()}` === key;
    });

    const monthRevenue = monthOrders.reduce((sum: number, order: DashboardOrder) => sum + order.amount, 0);

    return {
      label: currentDate.toLocaleString("en-US", { month: "short" }),
      revenue: monthRevenue,
      orders: monthOrders.length
    };
  });

  const maxRevenue = Math.max(...monthlyTrend.map((month) => month.revenue), 1);
  const paymentMix = ["STRIPE", "PAYPAL", "APPLE_PAY", "GOOGLE_PAY"].map((method) => ({
    method,
    count: typedOrders.filter((order: DashboardOrder) => order.paymentMethod === method).length
  }));

  return (
    <AdminShell
      title="Admin dashboard"
      description="A premium command center for revenue, order velocity, customer growth, and service demand."
      activePath="/admin/dashboard"
      actions={
        <Link
          href="/admin/orders"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Review orders
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total revenue" value={formatCurrency(revenue)} Icon={CreditCard} tone="violet" />
        <MetricCard label="Paid or fulfilled orders" value={String(revenueOrders.length)} Icon={BarChart3} tone="cyan" />
        <MetricCard label="Pending fulfillment queue" value={String(pendingOrders.length)} Icon={Layers3} tone="amber" />
        <MetricCard label="Registered users" value={String(usersCount)} Icon={Users} tone="emerald" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Revenue trend</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Last 6 months</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              {formatCurrency(revenue)} total
            </div>
          </div>

          <div className="mt-8 grid grid-cols-6 items-end gap-3">
            {monthlyTrend.map((month) => (
              <div key={month.label} className="space-y-3 text-center">
                <div className="flex h-56 items-end justify-center rounded-[24px] bg-slate-50 px-2 py-3">
                  <div
                    className="w-full rounded-[18px] bg-gradient-to-t from-slate-950 via-violet-700 to-cyan-500"
                    style={{ height: `${Math.max((month.revenue / maxRevenue) * 100, month.revenue > 0 ? 12 : 4)}%` }}
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-950">{month.label}</div>
                  <div className="text-xs text-slate-500">{formatCurrency(month.revenue)}</div>
                  <div className="text-xs text-slate-400">{month.orders} orders</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Platform footprint</div>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <StatsRow label="Catalog services" value={String(servicesCount)} />
              <StatsRow label="Total orders" value={String(orders.length)} />
              <StatsRow label="Conversion-ready customers" value={String(usersCount)} />
              <StatsRow label="Average order value" value={formatCurrency(revenueOrders.length ? revenue / revenueOrders.length : 0)} />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Payment mix</div>
            <div className="mt-5 space-y-4">
              {paymentMix.map((entry) => (
                <div key={entry.method} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{entry.method.replace("_", " ")}</span>
                    <span className="font-semibold text-slate-950">{entry.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-950"
                      style={{ width: `${orders.length ? (entry.count / orders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Most sold services</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Demand leaders</h2>
          </div>
          <Link href="/admin/services" className="text-sm font-semibold text-slate-950 transition hover:text-violet-700">
            Open services
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {topServices.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-600">
              No paid orders yet. Revenue insights will populate after the first completed checkout.
            </div>
          ) : (
            topServices.map((service, index) => (
              <div key={service.name} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">{index + 1}</div>
                  <div>
                    <div className="font-semibold text-slate-950">{service.name}</div>
                    <div className="text-sm text-slate-500">{service.count} completed purchases</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-slate-950">{formatCurrency(service.revenue)}</div>
                  <div className="text-sm text-slate-500">Gross revenue</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AdminShell>
  );
}

function MetricCard({
  label,
  value,
  Icon,
  tone
}: {
  label: string;
  value: string;
  Icon: typeof CreditCard;
  tone: "violet" | "cyan" | "amber" | "emerald";
}) {
  const toneClasses = {
    violet: "bg-violet-50 text-violet-700",
    cyan: "bg-cyan-50 text-cyan-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700"
  } as const;

  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-5 text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}

function StatsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
      <span>{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}
