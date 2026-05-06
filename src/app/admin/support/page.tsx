import { AdminSupportClient } from "@/components/admin/admin-support-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getSupportTickets } from "@/lib/support-tickets";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export default async function AdminSupportPage() {
  await requireAdmin("/admin/support");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Support tickets"
        description="Review customer issues, send replies, and close or reopen tickets from the admin workspace."
        activePath="/admin/support"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` to unlock support ticket operations.
        </div>
      </AdminShell>
    );
  }

  const tickets = await getSupportTickets();

  return (
    <AdminShell
      title="Support tickets"
      description="Customer issues, replies, and closure status in one operator console."
      activePath="/admin/support"
    >
      <AdminSupportClient tickets={tickets} />
    </AdminShell>
  );
}
