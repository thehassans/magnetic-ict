import { AdminMagneticCommerceClient } from "@/components/admin/admin-magnetic-commerce-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { getAdminMagneticCommerceInstallations } from "@/lib/magnetic-commerce-access";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export default async function AdminMagneticCommercePage() {
  await requireAdmin("/admin/magnetic-commerce");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Magnetic Commerce"
        description="Manage customer installations, DNS rollout, and launch configuration from one admin workspace."
        activePath="/admin/magnetic-commerce"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` to unlock Magnetic Commerce operations.
        </div>
      </AdminShell>
    );
  }

  const installations = await getAdminMagneticCommerceInstallations();

  return (
    <AdminShell
      title="Magnetic Commerce"
      description="Review customer domain assignments, save rollout details, and trigger DNS automation from one operations panel."
      activePath="/admin/magnetic-commerce"
    >
      <AdminMagneticCommerceClient installations={installations} />
    </AdminShell>
  );
}
