import { AdminHostingClient } from "@/components/admin/admin-hosting-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getHostingProvisions } from "@/lib/hosting-db";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export default async function AdminHostingPage() {
  await requireAdmin("/admin/hosting");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Hosting operations"
        description="Monitor Magnetic VPS Hosting provisioning across reseller and cloud delivery stages."
        activePath="/admin/hosting"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` to unlock hosting provisioning operations.
        </div>
      </AdminShell>
    );
  }

  const provisions = await getHostingProvisions();

  return (
    <AdminShell
      title="Hosting operations"
      description="Review Magnetic VPS Hosting provisioning, provider references, and failure states from one admin workspace."
      activePath="/admin/hosting"
    >
      <AdminHostingClient provisions={provisions} />
    </AdminShell>
  );
}
