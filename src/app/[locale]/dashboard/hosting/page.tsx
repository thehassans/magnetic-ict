import { Globe2, Server, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { getHostingProvisionsForUser } from "@/lib/hosting-db";

export default async function DashboardHostingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const provisions = await getHostingProvisionsForUser(session.user.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Purchased service</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Hosting</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Open your VPS workspace, review provisioning details, and use your hosting panel login when it is ready.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/orders" locale={locale} className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950">
              Open orders
            </Link>
            <Link href="/dashboard" locale={locale} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]">
              Back to overview
            </Link>
          </div>
        </div>
      </section>

      {provisions.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200/70 bg-slate-50/80 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
          You do not have any active hosting provision records yet. Complete a Magnetic VPS Hosting purchase to unlock hosting access here.
        </div>
      ) : (
        <div className="space-y-4">
          {provisions.map((provision) => (
            <section key={provision._id} className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{provision.customerEmail}</div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Magnetic VPS Hosting · {provision.tierName}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Order ID: {provision.orderId}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {provision.access.isReady && provision.access.loginUrl ? (
                    <a
                      href={provision.access.loginUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                    >
                      {provision.access.panelLabel ?? "Open panel"}
                    </a>
                  ) : null}
                  <Link href={`/dashboard/orders/${provision.orderId}/invoice`} locale={locale} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]">
                    View invoice
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
                    <Server className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">Server</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div>Region: {provision.configuration.locationName ?? provision.cloud.location ?? "Pending"}</div>
                    <div>Operating system: {provision.configuration.operatingSystemName ?? "Default"}</div>
                    <div>Status: {provision.status}</div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">Panel access</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div>Panel: {provision.access.panelLabel ?? provision.configuration.controlPanelName ?? "No panel"}</div>
                    <div>Username: {provision.access.username ?? provision.customerEmail}</div>
                    <div>{provision.access.isReady ? "Your panel login is ready." : "Your panel login is still being prepared."}</div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">Attached domain</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <div>Domain: {provision.domain.name ?? "None attached"}</div>
                    <div>Domain status: {provision.domain.status}</div>
                    <div>Registrar reference: {provision.domain.registrarReference ?? "Pending"}</div>
                  </div>
                </div>
              </div>

              {provision.access.notes ? (
                <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  {provision.access.notes}
                </div>
              ) : null}

              {provision.errorMessage ? (
                <div className="mt-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {provision.errorMessage}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
