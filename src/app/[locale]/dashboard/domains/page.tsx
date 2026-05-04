import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { DomainManagementDashboard } from "@/components/domains/domain-management-dashboard";
import { Link } from "@/i18n/navigation";
import { getManagedDomainSnapshot } from "@/lib/domain-management";
import { getManagedDomainsForUser } from "@/lib/domain-management-db";

export default async function DashboardDomainsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const domains = await getManagedDomainsForUser(session.user.id);
  const snapshots = await Promise.all(domains.map((domain) => getManagedDomainSnapshot(session.user.id, domain.id)));

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Assigned service</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Domains</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Manage DNS, nameservers, WHOIS, and renewals from your workspace.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/domains" locale={locale} className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950">
            Search another domain
          </Link>
            <Link href="/dashboard/orders" locale={locale} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]">
            Open orders
          </Link>
          </div>
        </div>
      </section>

      <section>
        {snapshots.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200/70 bg-slate-50/80 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">You do not have any active managed domains yet. Complete a domain purchase to unlock DNS and WHOIS management here.</div>
        ) : (
          <DomainManagementDashboard initialSnapshots={snapshots} />
        )}
      </section>
    </div>
  );
}
