import { Activity, AlertTriangle, ArrowUpRight, CheckCircle2, Clock, Globe2, HardDrive, Layers, Server, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { getHostingProvisionsForUser } from "@/lib/hosting-db";
import { userHasMagneticVpsAccess } from "@/lib/hosting-access";

export const metadata = { title: "Server Management" };

function statusMeta(status: string) {
  switch (status) {
    case "provisioned":
      return { label: "Active", color: "bg-emerald-500", ring: "ring-emerald-400/30", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-400/10", border: "border-emerald-200 dark:border-emerald-400/20" };
    case "failed":
      return { label: "Failed", color: "bg-rose-500", ring: "ring-rose-400/30", text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-400/10", border: "border-rose-200 dark:border-rose-400/20" };
    default:
      return { label: "Provisioning", color: "bg-amber-400", ring: "ring-amber-400/30", text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-400/10", border: "border-amber-200 dark:border-amber-400/20" };
  }
}

export default async function ServerManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) notFound();

  const hasAccess = await userHasMagneticVpsAccess(session.user.id);
  if (!hasAccess) notFound();

  const provisions = await getHostingProvisionsForUser(session.user.id);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                <Server className="h-4 w-4" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">VPS Infrastructure</p>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Server Management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Monitor your VPS infrastructure, access your control panel, and manage server resources from one place.
            </p>
          </div>
          <Link
            href="/dashboard"
            locale={locale}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
          >
            Back to overview
          </Link>
        </div>
      </section>

      {provisions.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-slate-200/70 bg-white/50 p-10 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            <Server className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">No servers provisioned yet</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Complete a Magnetic VPS Hosting purchase and your server will appear here once provisioned.
          </p>
          <Link
            href="/services"
            locale={locale}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            Explore hosting plans
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      ) : (
        <div className="space-y-6">
          {provisions.map((provision) => {
            const meta = statusMeta(provision.status);
            const panelReady = provision.access.isReady && Boolean(provision.access.loginUrl);

            return (
              <section
                key={provision._id}
                className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_8px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_8px_40px_rgba(2,6,23,0.4)]"
              >
                {/* Server hero bar */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-6 sm:px-8">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.12),transparent_55%)]" />
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className={`relative flex h-2.5 w-2.5 shrink-0 rounded-full ${meta.color}`}>
                          {provision.status !== "failed" && (
                            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${meta.color} opacity-60`} />
                          )}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${meta.text}`}>{meta.label}</span>
                      </div>
                      <h2 className="mt-2 truncate text-xl font-semibold tracking-tight text-white">
                        Magnetic VPS · {provision.tierName}
                      </h2>
                      <p className="mt-1 truncate text-[12px] text-slate-400">Order {provision.orderId}</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                      {panelReady ? (
                        <a
                          href={provision.access.loginUrl!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                          {provision.access.panelLabel ?? "Open server panel"}
                        </a>
                      ) : (
                        <div className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-medium text-slate-300">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          Panel being prepared
                        </div>
                      )}
                      <Link
                        href={`/dashboard/orders/${provision.orderId}/invoice`}
                        locale={locale}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                      >
                        View invoice
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 divide-x divide-slate-200/70 border-b border-slate-200/70 dark:divide-white/10 dark:border-white/10 sm:grid-cols-4">
                  {[
                    { label: "vCPU cores", value: String(provision.plan.cores), icon: Layers },
                    { label: "RAM", value: `${provision.plan.ramMb >= 1024 ? `${(provision.plan.ramMb / 1024).toFixed(0)} GB` : `${provision.plan.ramMb} MB`}`, icon: Activity },
                    { label: "Storage", value: `${provision.plan.storageGb} GB`, icon: HardDrive },
                    { label: "Region", value: provision.configuration.locationName ?? provision.cloud.location ?? "Default", icon: Globe2 }
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex flex-col gap-1 px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                        <Icon className="h-3 w-3" />
                        {label}
                      </div>
                      <div className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">{value}</div>
                    </div>
                  ))}
                </div>

                {/* Detail cards */}
                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                  {/* Control Panel card */}
                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 dark:from-violet-400/20 dark:to-indigo-400/10 dark:text-violet-300">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Control Panel</div>
                    </div>
                    <div className="mt-4 space-y-2.5 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Panel</span>
                        <span className="font-medium text-slate-950 dark:text-white">
                          {provision.access.panelLabel ?? provision.configuration.controlPanelName ?? "None assigned"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Username</span>
                        <span className="truncate font-mono text-[12px] text-slate-950 dark:text-white">
                          {provision.access.username ?? provision.customerEmail}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Access</span>
                        {panelReady ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                    {panelReady ? (
                      <a
                        href={provision.access.loginUrl!}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-[12px] font-semibold text-white shadow-md shadow-violet-500/20 transition hover:brightness-110"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                        Open {provision.access.panelLabel ?? "panel"}
                      </a>
                    ) : (
                      <div className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-[12px] font-medium text-slate-400 dark:border-white/10 dark:bg-white/[0.04]">
                        <Clock className="h-3.5 w-3.5" />
                        Awaiting provisioning
                      </div>
                    )}
                  </div>

                  {/* OS & Config card */}
                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-sky-100 text-cyan-700 dark:from-cyan-400/20 dark:to-sky-400/10 dark:text-cyan-300">
                        <Server className="h-4 w-4" />
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Server Config</div>
                    </div>
                    <div className="mt-4 space-y-2.5 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">OS</span>
                        <span className="font-medium text-slate-950 dark:text-white">{provision.configuration.operatingSystemName ?? "Default"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Image</span>
                        <span className="truncate font-mono text-[12px] text-slate-950 dark:text-white">{provision.plan.imageAlias}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Add-ons</span>
                        <span className="text-right font-medium text-slate-950 dark:text-white">
                          {provision.configuration.addonNames.length ? provision.configuration.addonNames.join(", ") : "None"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Status</span>
                        <span className={`inline-flex items-center gap-1.5 font-medium ${meta.text}`}>
                          <span className={`h-2 w-2 rounded-full ${meta.color}`} />
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Domain card */}
                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-400/20 dark:to-teal-400/10 dark:text-emerald-300">
                        <Globe2 className="h-4 w-4" />
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Attached Domain</div>
                    </div>
                    <div className="mt-4 space-y-2.5 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Domain</span>
                        <span className="truncate font-medium text-slate-950 dark:text-white">{provision.domain.name ?? "None attached"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500 dark:text-slate-400">Status</span>
                        <span className="font-medium text-slate-950 dark:text-white capitalize">{provision.domain.status.replace("_", " ")}</span>
                      </div>
                      {provision.domain.name && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-500 dark:text-slate-400">Registrar ref</span>
                          <span className="font-mono text-[12px] text-slate-950 dark:text-white">{provision.domain.registrarReference ?? "Pending"}</span>
                        </div>
                      )}
                    </div>
                    {provision.domain.name ? (
                      <Link
                        href="/dashboard/domains"
                        locale={locale}
                        className="mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                      >
                        Manage domain
                      </Link>
                    ) : null}
                  </div>
                </div>

                {/* Notes / errors */}
                {provision.access.notes && (
                  <div className="mx-5 mb-5 rounded-[18px] border border-indigo-200/60 bg-indigo-50/60 px-4 py-3 text-sm leading-6 text-indigo-800 dark:border-indigo-400/20 dark:bg-indigo-400/[0.08] dark:text-indigo-200 sm:mx-6 sm:mb-6">
                    {provision.access.notes}
                  </div>
                )}
                {provision.errorMessage && (
                  <div className="mx-5 mb-5 flex items-start gap-3 rounded-[18px] border border-rose-200/60 bg-rose-50/60 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/[0.08] dark:text-rose-300 sm:mx-6 sm:mb-6">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {provision.errorMessage}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
