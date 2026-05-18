import Link from "next/link";
import { ArrowUpRight, CreditCard, Layers3, TrendingUp, Users, Zap } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

type DashboardOrder = {
  id: string; amount: number;
  status: "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  paymentMethod: "UNKNOWN" | "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY" | "MANUAL";
  serviceNameSnapshot: string;
  createdAt: Date;
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-100   text-amber-700   dark:bg-amber-500/15   dark:text-amber-400",
  PAID:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  FULFILLED: "bg-violet-100  text-violet-700  dark:bg-violet-500/15  dark:text-violet-400",
  FAILED:    "bg-rose-100    text-rose-700    dark:bg-rose-500/15    dark:text-rose-400",
  CANCELLED: "bg-slate-100   text-slate-500   dark:bg-zinc-500/15    dark:text-zinc-400",
  CART:      "bg-slate-50    text-slate-400   dark:bg-zinc-500/10    dark:text-zinc-500",
};

const CARD = "rounded-2xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.025]";

export default async function AdminDashboardPage() {
  await requireAdmin("/admin/dashboard");

  if (!hasDatabase) {
    return (
      <AdminShell title="Dashboard" eyebrow="Operations">
        <div className={`${CARD} p-8 text-slate-500 dark:text-white/40 text-sm`}>
          Configure DATABASE_URL to unlock live analytics.
        </div>
      </AdminShell>
    );
  }

  const [orders, usersCount, servicesCount] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, amount: true, status: true, paymentMethod: true, serviceNameSnapshot: true, createdAt: true }
    }),
    prisma.user.count(),
    prisma.service.count()
  ]);

  const typedOrders = orders as DashboardOrder[];
  const revenueOrders = typedOrders.filter(o => o.status === "PAID" || o.status === "FULFILLED");
  const pendingOrders = typedOrders.filter(o => o.status === "PENDING");
  const revenue = revenueOrders.reduce((s, o) => s + o.amount, 0);
  const aov = revenueOrders.length ? revenue / revenueOrders.length : 0;

  const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    const monthOrders = revenueOrders.filter(o => {
      const od = new Date(o.createdAt);
      return `${od.getUTCFullYear()}-${od.getUTCMonth()}` === key;
    });
    return { label, revenue: monthOrders.reduce((s, o) => s + o.amount, 0), count: monthOrders.length };
  });
  const maxRevenue = Math.max(...monthlyTrend.map(m => m.revenue), 1);
  const recentOrders = typedOrders.slice(0, 8);

  return (
    <AdminShell title="Dashboard" eyebrow="Operations" description="Revenue, orders, and platform health at a glance">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: fmt(revenue), icon: CreditCard, sub: "All time" },
          { label: "Avg Order Value", value: fmt(aov), icon: TrendingUp, sub: `${revenueOrders.length} orders` },
          { label: "Pending Queue", value: String(pendingOrders.length), icon: Layers3, sub: "Awaiting fulfillment" },
          { label: "Registered Users", value: String(usersCount), icon: Users, sub: `${servicesCount} catalog items` },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`${CARD} p-5 hover:border-violet-300 dark:hover:border-violet-500/20 hover:shadow-sm transition`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05] mb-4">
                <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-white/40" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{kpi.value}</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-white/30 mt-1">{kpi.label}</p>
              <p className="text-[10px] text-slate-400 dark:text-white/20 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue chart + sidebar stats */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        {/* Bar chart */}
        <div className={`${CARD} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Revenue Trend</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Last 6 Months</p>
            </div>
            <span className="rounded-full border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-slate-500 dark:text-white/40">
              {fmt(revenue)} total
            </span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {monthlyTrend.map(m => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full flex items-end justify-center" style={{ height: 112 }}>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-violet-600 to-violet-400 opacity-80 hover:opacity-100 transition cursor-default"
                    style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 10 : 2)}%` }}
                    title={`${m.label}: ${fmt(m.revenue)}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-slate-600 dark:text-white/60">{m.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-white/25">{fmt(m.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats + Payment mix */}
        <div className="space-y-3">
          <div className={`${CARD} p-5`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 mb-4">Platform Stats</p>
            <div className="space-y-0">
              {[
                { label: "Catalog Services", value: String(servicesCount) },
                { label: "Total Orders", value: String(orders.length) },
                { label: "Conversion Rate", value: orders.length ? `${((revenueOrders.length / orders.length) * 100).toFixed(1)}%` : "—" },
                { label: "Pending", value: String(pendingOrders.length) },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-white/[0.04] last:border-0">
                  <span className="text-[12px] text-slate-500 dark:text-white/40">{s.label}</span>
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${CARD} p-5`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 mb-4">Payment Mix</p>
            {["STRIPE", "PAYPAL", "MANUAL"].map(method => {
              const count = typedOrders.filter(o => o.paymentMethod === method).length;
              const pct = orders.length ? (count / orders.length) * 100 : 0;
              return (
                <div key={method} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-white/35">{method.replace("_", " ")}</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-white/60">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] px-5 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-violet-500" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">Recent Orders</p>
          </div>
          <Link href="/admin/orders" className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-violet-600 dark:text-white/30 dark:hover:text-violet-400 transition">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.04]">
                {["Service", "Customer", "Amount", "Status", "Date"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/20">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50/80 dark:hover:bg-white/[0.015] transition">
                  <td className="px-5 py-3.5 text-[12px] font-medium text-slate-700 dark:text-white/70 max-w-[180px] truncate">{o.serviceNameSnapshot}</td>
                  <td className="px-5 py-3.5 text-[12px] text-slate-400 dark:text-white/40 font-mono">{o.id.slice(0, 8)}…</td>
                  <td className="px-5 py-3.5 text-[12px] font-bold text-slate-900 dark:text-white">{fmt(o.amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_STYLES[o.status] ?? "bg-slate-100 text-slate-400"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[11px] text-slate-400 dark:text-white/30 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400 dark:text-white/20">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
