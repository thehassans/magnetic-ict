import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default async function AdminUsersPage() {
  await requireAdmin("/admin/users");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Manage users"
        description="Review registered users, purchase history, and account roles from one operator-friendly table."
        activePath="/admin/users"
      >
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
        select: {
          id: true,
          amount: true,
          status: true,
          serviceNameSnapshot: true,
          createdAt: true
        }
      }
    }
  })) as AdminUser[];

  const totalCustomers = users.filter((user) => user.role === "USER").length;
  const activeBuyers = users.filter((user) => user.orders.some((order) => order.status === "PAID" || order.status === "FULFILLED")).length;
  const admins = users.filter((user) => user.role === "ADMIN").length;

  return (
    <AdminShell
      title="Manage users"
      description="Inspect accounts, identify active buyers, and understand who is driving revenue across the platform."
      activePath="/admin/users"
    >
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard label="Customer accounts" value={String(totalCustomers)} />
        <StatCard label="Active buyers" value={String(activeBuyers)} />
        <StatCard label="Admin operators" value={String(admins)} />
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Spend</th>
                <th className="px-4 py-2">Recent services</th>
                <th className="px-4 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const completedOrders = user.orders.filter((order) => order.status === "PAID" || order.status === "FULFILLED");
                const spend = completedOrders.reduce((sum, order) => sum + order.amount, 0);

                return (
                  <tr key={user.id} className="rounded-[24px] bg-slate-50 text-sm text-slate-600">
                    <td className="rounded-l-[24px] px-4 py-4 align-top">
                      <div className="font-semibold text-slate-950">{user.name || user.email}</div>
                      <div className="mt-1 text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${user.role === "ADMIN" ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold text-slate-950">{formatCurrency(spend)}</div>
                      <div className="mt-1 text-slate-500">{completedOrders.length} completed orders</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {user.orders.length === 0 ? (
                          <span className="text-slate-400">No purchases yet</span>
                        ) : (
                          user.orders.map((order) => (
                            <span key={order.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                              {order.serviceNameSnapshot}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="rounded-r-[24px] px-4 py-4 align-top text-slate-500">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(user.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
