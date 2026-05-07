import { AdminMagneticCommerceClient } from "@/components/admin/admin-magnetic-commerce-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminMagneticCommerceInstallations } from "@/lib/admin-magnetic-commerce";
import { requireAdmin } from "@/lib/admin";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export default async function AdminMagneticCommercePage() {
  await requireAdmin("/admin/magnetic-commerce");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Magnetic Commerce"
        description="Manage customer Magnetic Commerce installations, domain assignments, and configurations from the admin panel."
        activePath="/admin/magnetic-commerce"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` to unlock the admin Magnetic Commerce workspace.
        </div>
      </AdminShell>
    );
  }

  const installations = await getAdminMagneticCommerceInstallations();

  return (
    <AdminShell
      title="Magnetic Commerce"
      description="View all customer installations, manage domain assignments, and configure store settings."
      activePath="/admin/magnetic-commerce"
    >
      <AdminMagneticCommerceClient installations={installations} />
    </AdminShell>
  );
}
