import { Globe2, ShoppingCart, Smartphone } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CustomerMagneticCommerceWorkspace } from "@/components/dashboard/customer-magnetic-commerce-workspace";
import { getManagedDomainsForUser } from "@/lib/domain-management-db";
import { syncMagneticCommerceInstallationsForUser, userHasMagneticCommerceAccess } from "@/lib/magnetic-commerce-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MagneticCommerceDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const hasAccess = await userHasMagneticCommerceAccess(session.user.id);

  if (!hasAccess) {
    notFound();
  }

  const [installations, managedDomains] = await Promise.all([
    syncMagneticCommerceInstallationsForUser(session.user.id),
    getManagedDomainsForUser(session.user.id)
  ]);

  const activeDomains = managedDomains.filter((domain) => domain.status === "active");

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
            <ShoppingCart className="h-4 w-4" />
            Magnetic Commerce
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
            <Globe2 className="h-4 w-4" />
            Domain assignment
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
            <Smartphone className="h-4 w-4" />
            Web + iPhone + Android
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Magnetic Commerce workspace</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Select the domain where your Magnetic Commerce service should be integrated, then track activation from the same workspace.
        </p>
      </section>

      <CustomerMagneticCommerceWorkspace
        installations={installations}
        domains={activeDomains.map((domain) => ({
          id: domain._id,
          domain: domain.domain,
          status: domain.status
        }))}
      />
    </div>
  );
}
