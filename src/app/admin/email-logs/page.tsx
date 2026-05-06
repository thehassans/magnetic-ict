import { AdminEmailLogsClient } from "@/components/admin/admin-email-logs-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getEmailLogs } from "@/lib/email-logs";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export default async function AdminEmailLogsPage() {
  await requireAdmin("/admin/email-logs");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Email logs"
        description="Review sent, skipped, and failed transactional email activity from the admin panel."
        activePath="/admin/email-logs"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` to unlock email log history.
        </div>
      </AdminShell>
    );
  }

  const logs = await getEmailLogs(250);

  return (
    <AdminShell
      title="Email logs"
      description="Transactional email history, delivery outcomes, and notification context."
      activePath="/admin/email-logs"
    >
      <AdminEmailLogsClient logs={logs} />
    </AdminShell>
  );
}
