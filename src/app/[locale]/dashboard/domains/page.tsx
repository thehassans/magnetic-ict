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
      <section className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Domain management</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Your domains</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">Manage DNS, WHOIS, nameservers, and renewal activity from your signed-in Magnetic ICT dashboard.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/domains" locale={locale} className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800">
            Search another domain
          </Link>
          <Link href="/dashboard/orders" locale={locale} className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            Open orders
          </Link>
        </div>
      </section>

      <section className="mt-8">
        {snapshots.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">You do not have any active managed domains yet. Complete a domain purchase to unlock DNS and WHOIS management here.</div>
        ) : (
          <DomainManagementDashboard initialSnapshots={snapshots} />
        )}
      </section>
    </div>
  );
}
