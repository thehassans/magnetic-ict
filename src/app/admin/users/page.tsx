import { CheckCircle2, Clock, ExternalLink, Server } from "lucide-react";
import Link from "next/link";
import { AdminAssignHostingForm } from "@/components/admin/admin-assign-hosting-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getHostingProvisionsForUser } from "@/lib/hosting-db";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
  createdAt: Date;
  orders: Array<{
    id: string;
    amount: number;
    status: "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
    serviceNameSnapshot: string;
    createdAt: Date;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default async function AdminUsersPage() {
  await requireAdmin("/admin/users");

  if (!hasDatabase) {
    return (
      <AdminShell title="Manage users" description="Review registered users, purchase history, and account roles." activePath="/admin/users">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` and sync Prisma to unlock user management.
        </div>
      </AdminShell>
    );
  }

  const users = (await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, amount: true, status: true, serviceNameSnapshot: true, createdAt: true }
      }
    }
  })) as AdminUser[];

  const hostingByUser = Object.fromEntries(
    await Promise.all(
      users.map(async (user) => [user.id, await getHostingProvisionsForUser(user.id).catch(() => [])] as const)
    )
  );

  const totalCustomers = users.filter((u) => u.role === "USER").length;
  const activeBuyers = users.filter((u) => u.orders.some((o) => o.status === "PAID" || o.status === "FULFILLED")).length;
  const admins = users.filter((u) => u.role === "ADMIN").length;
  const hostedUsers = Object.values(hostingByUser).filter((p) => p.length > 0).length;

  return (
    <AdminShell title="Manage users" description="Accounts, buyers, admin roles, and assigned hosting provisions." activePath="/admin/users">
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Customer accounts" value={String(totalCustomers)} />
        <StatCard label="Active buyers" value={String(activeBuyers)} />
        <StatCard label="Admin operators" value={String(admins)} />
        <StatCard label="Hosted users" value={String(hostedUsers)} accent />
      </section>

      <div className="space-y-4">
        {users.map((user) => {
          const completedOrders = user.orders.filter((o) => o.status === "PAID" || o.status === "FULFILLED");
          const spend = completedOrders.reduce((sum, o) => sum + o.amount, 0);
          const provisions = hostingByUser[user.id] ?? [];

          return (
            <section key={user.id} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.05)]">
              {/* User header row */}
              <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[15px] font-bold text-slate-600">
                    {(user.name ?? user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-950">{user.name ?? user.email}</div>
                    <div className="mt-0.5 truncate text-[12px] text-slate-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${user.role === "ADMIN" ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-700"}`}>
                    {user.role}
                  </span>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-slate-950">{formatCurrency(spend)}</div>
                    <div className="text-[11px] text-slate-400">{completedOrders.length} order{completedOrders.length === 1 ? "" : "s"}</div>
                  </div>
                  <div className="text-[12px] text-slate-400">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(user.createdAt)}
                  </div>
                  <AdminAssignHostingForm
                    userId={user.id}
                    userEmail={user.email}
                    provisions={provisions}
                  />
                </div>
              </div>

              {/* Recent services row */}
              {user.orders.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 px-6 py-3">
                  {user.orders.map((order) => (
                    <span key={order.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600">
                      {order.serviceNameSnapshot}
                    </span>
                  ))}
                </div>
              )}

              {/* Hosting provisions */}
              {provisions.length > 0 && (
                <div className="border-t border-slate-100 bg-gradient-to-br from-violet-50/60 to-indigo-50/40 px-6 py-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600 text-white">
                      <Server className="h-3 w-3" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-violet-700">
                      Assigned hosting · {provisions.length} provision{provisions.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {provisions.map((provision) => {
                      const panelReady = provision.access.isReady && Boolean(provision.access.loginUrl);
                      const statusColor = provision.status === "provisioned"
                        ? "bg-emerald-500"
                        : provision.status === "failed"
                        ? "bg-rose-500"
                        : "bg-amber-400";
                      const statusLabel = provision.status === "provisioned" ? "Active" : provision.status === "failed" ? "Failed" : "Provisioning";

                      return (
                        <div key={provision._id} className="rounded-[22px] border border-violet-200/60 bg-white p-4 shadow-[0_4px_16px_rgba(124,58,237,0.07)]">
                          {/* Provision header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`relative flex h-2 w-2 shrink-0 rounded-full ${statusColor}`}>
                                  {provision.status !== "failed" && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${statusColor} opacity-60`} />}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">{statusLabel}</span>
                              </div>
                              <div className="mt-1 truncate text-[13px] font-semibold text-slate-950">
                                {provision.tierName}
                              </div>
                              <div className="mt-0.5 truncate text-[11px] text-slate-400">Order {provision.orderId.slice(0, 16)}…</div>
                            </div>
                          </div>

                          {/* Config details */}
                          <div className="mt-3 space-y-1.5 rounded-[14px] bg-slate-50 px-3 py-2.5 text-[11px]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400">vCPU / RAM</span>
                              <span className="font-mono font-semibold text-slate-700">{provision.plan.cores} cores · {provision.plan.ramMb >= 1024 ? `${(provision.plan.ramMb / 1024).toFixed(0)} GB` : `${provision.plan.ramMb} MB`}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400">Storage</span>
                              <span className="font-mono font-semibold text-slate-700">{provision.plan.storageGb} GB</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400">OS</span>
                              <span className="font-semibold text-slate-700 truncate max-w-[120px]">{provision.configuration.operatingSystemName ?? "Default"}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-400">Region</span>
                              <span className="font-semibold text-slate-700">{provision.configuration.locationName ?? provision.cloud.location ?? "—"}</span>
                            </div>
                            {provision.configuration.controlPanelName && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-400">Panel</span>
                                <span className="font-semibold text-slate-700">{provision.configuration.controlPanelName}</span>
                              </div>
                            )}
                          </div>

                          {/* Panel access status */}
                          <div className={`mt-3 rounded-[14px] border px-3 py-2.5 text-[11px] ${panelReady ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                            <div className="flex items-center gap-2">
                              {panelReady
                                ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                : <Clock className="h-3.5 w-3.5 text-amber-600" />}
                              <span className={panelReady ? "font-semibold text-emerald-800" : "font-semibold text-amber-800"}>
                                {panelReady ? "Panel access ready" : "Panel access pending"}
                              </span>
                            </div>
                            {provision.access.panelLabel && (
                              <div className="mt-1 text-slate-500">{provision.access.panelLabel}</div>
                            )}
                            {provision.access.loginUrl && (
                              <a
                                href={provision.access.loginUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-violet-700 underline underline-offset-2 hover:text-violet-900"
                              >
                                <ExternalLink className="h-2.5 w-2.5" />
                                {provision.access.loginUrl.length > 40
                                  ? provision.access.loginUrl.slice(0, 40) + "…"
                                  : provision.access.loginUrl}
                              </a>
                            )}
                            {provision.access.username && (
                              <div className="mt-1 text-slate-400">User: {provision.access.username}</div>
                            )}
                          </div>

                          {/* Domain */}
                          {provision.domain.name && (
                            <div className="mt-2 flex items-center justify-between rounded-[14px] bg-slate-50 px-3 py-2 text-[11px]">
                              <span className="text-slate-400">Domain</span>
                              <span className="font-semibold text-slate-700">{provision.domain.name}</span>
                            </div>
                          )}

                          <Link
                            href="/admin/hosting"
                            className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-100"
                          >
                            <Server className="h-3 w-3" />
                            Edit hosting access
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-[30px] border p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] ${accent ? "border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50" : "border-slate-200 bg-white"}`}>
      <div className={`text-sm ${accent ? "text-violet-600" : "text-slate-500"}`}>{label}</div>
      <div className={`mt-2 text-3xl font-semibold tracking-tight ${accent ? "text-violet-950" : "text-slate-950"}`}>{value}</div>
    </div>
  );
}
