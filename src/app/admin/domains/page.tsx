import { AdminDomainsClient } from "@/components/admin/admin-domains-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getDomainOrders } from "@/lib/domain-db";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export default async function AdminDomainsPage() {
  await requireAdmin("/admin/domains");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Domain operations"
        description="Review paid, registered, failed, and cancelled domain orders from one admin workspace."
        activePath="/admin/domains"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` to unlock domain operations.
        </div>
      </AdminShell>
    );
  }

  const orders = await getDomainOrders();

  return (
    <AdminShell
      title="Domain operations"
      description="Track searchable domain purchases and registration status from the admin panel."
      activePath="/admin/domains"
    >
      <AdminDomainsClient orders={orders} />
    </AdminShell>
  );
}
