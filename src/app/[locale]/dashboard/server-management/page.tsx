import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock, Cpu, ExternalLink, Globe2, HardDrive, Key, Lock, MemoryStick, Server, ShieldCheck, Terminal, Zap } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { getHostingProvisionsForUser } from "@/lib/hosting-db";
import { userHasMagneticVpsAccess } from "@/lib/hosting-access";
import { ServerCredentialRow } from "@/components/dashboard/server-credential-row";

export const metadata = { title: "Server Management — Magnetic ICT" };

function statusMeta(status: string) {
  switch (status) {
    case "provisioned":
      return { label: "Online", dot: "bg-emerald-400", ping: true, badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", text: "text-emerald-400" };
    case "failed":
      return { label: "Error", dot: "bg-rose-500", ping: false, badge: "border-rose-500/30 bg-rose-500/10 text-rose-400", text: "text-rose-400" };
    default:
      return { label: "Provisioning", dot: "bg-amber-400", ping: true, badge: "border-amber-500/30 bg-amber-500/10 text-amber-400", text: "text-amber-400" };
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
    <div className="min-h-screen space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/30">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Infrastructure</p>
            <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">Server Management</h1>
          </div>
        </div>
        <Link
          href="/dashboard"
          locale={locale}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
        >
          ← Overview
        </Link>
      </div>

      {provisions.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-white/60 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/10 dark:to-white/5">
            <Server className="h-7 w-7 text-slate-400" />
          </div>
          <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-950 dark:text-white">No servers yet</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Your VPS will appear here as soon as your Magnetic Hosting plan is activated.
          </p>
          <Link
            href="/services"
            locale={locale}
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
          >
            <Zap className="h-4 w-4" />
            Explore hosting plans
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {provisions.map((provision) => {
            const meta = statusMeta(provision.status);
            const panelReady = provision.access.isReady && Boolean(provision.access.loginUrl);
            const isManual = provision.orderId.startsWith("manual_");
            const hasRealPlan = !isManual && (provision.plan.cores > 0 || provision.plan.storageGb > 0);
            const panelLabel = provision.access.panelLabel ?? "Open Server Panel";

            return (
              <article key={provision._id} className="overflow-hidden rounded-[32px] border border-slate-200/60 bg-white shadow-[0_4px_32px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#0d1117]">

                {/* ── Hero banner ── */}
                <div className="relative overflow-hidden bg-[#0a0e1a] px-7 py-7 sm:px-8 sm:py-8">
                  {/* Background glow layers */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px]" />
                  </div>

                  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: identity */}
                    <div className="min-w-0 flex-1">
                      {/* Status badge */}
                      <div className="flex items-center gap-2.5">
                        <span className={`relative flex h-2 w-2 shrink-0`}>
                          <span className={`absolute inline-flex h-full w-full rounded-full ${meta.dot} ${meta.ping ? "animate-ping opacity-75" : ""}`} />
                          <span className={`relative inline-flex h-2 w-2 rounded-full ${meta.dot}`} />
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] ${meta.badge}`}>
                          {meta.label}
                        </span>
                        {isManual && (
                          <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
                            Managed VPS
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h2 className="mt-3 truncate font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {provision.tierName}
                      </h2>
                      <p className="mt-1.5 font-mono text-[11px] text-slate-500">
                        ID: {provision.orderId}
                      </p>
                    </div>

                    {/* Right: actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      {panelReady ? (
                        <a
                          href={provision.access.loginUrl!}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative inline-flex h-11 items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 px-6 text-sm font-bold text-white shadow-xl shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:brightness-110"
                        >
                          <span className="absolute inset-0 bg-white/0 transition group-hover:bg-white/10" />
                          <ExternalLink className="h-4 w-4" />
                          {panelLabel}
                        </a>
                      ) : (
                        <div className="inline-flex h-11 items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-medium text-slate-400">
                          <Clock className="h-4 w-4 animate-pulse" />
                          Panel being prepared
                        </div>
                      )}
                      {!isManual && (
                        <Link
                          href={`/dashboard/orders/${provision.orderId}/invoice`}
                          locale={locale}
                          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          Invoice
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Spec tiles (only real plans) ── */}
                {hasRealPlan && (
                  <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/80 dark:border-white/[0.06] dark:bg-white/[0.02] sm:grid-cols-4">
                    {[
                      { icon: Cpu, label: "vCPU", value: `${provision.plan.cores} cores` },
                      { icon: MemoryStick, label: "Memory", value: provision.plan.ramMb >= 1024 ? `${(provision.plan.ramMb / 1024).toFixed(0)} GB RAM` : `${provision.plan.ramMb} MB RAM` },
                      { icon: HardDrive, label: "Storage", value: `${provision.plan.storageGb} GB SSD` },
                      { icon: Globe2, label: "Region", value: provision.configuration.locationName ?? provision.cloud.location ?? "Default" }
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="group flex flex-col gap-1.5 border-r border-slate-100 px-6 py-5 last:border-r-0 dark:border-white/[0.06]">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                          <Icon className="h-3 w-3" />
                          {label}
                        </div>
                        <div className="font-mono text-lg font-bold tracking-tight text-slate-950 dark:text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Cards row ── */}
                <div className={`grid gap-5 p-6 ${!isManual ? "md:grid-cols-3" : "md:grid-cols-2"}`}>

                  {/* Control Panel card */}
                  <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-white/[0.07] dark:from-white/[0.04] dark:to-white/[0.02]">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/20">
                          <ShieldCheck className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Control Panel</p>
                          <p className="text-sm font-bold text-slate-950 dark:text-white">
                            {provision.access.panelLabel ?? provision.configuration.controlPanelName ?? "Assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-white/80 px-4 py-3 text-[13px] dark:border-white/[0.06] dark:bg-white/[0.03]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-slate-400"><Key className="h-3 w-3" /> Username</span>
                          <ServerCredentialRow label="" value={provision.access.username ?? provision.customerEmail} />
                        </div>
                        {provision.access.password && (
                          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/[0.06]">
                            <span className="flex items-center gap-1.5 text-slate-400"><Lock className="h-3 w-3" /> Password</span>
                            <ServerCredentialRow label="" value={provision.access.password} masked />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/[0.06]">
                          <span className="text-slate-400">Status</span>
                          {panelReady ? (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-600 dark:text-amber-400">
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
                          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-[13px] font-bold text-white shadow-md shadow-violet-500/20 transition hover:brightness-110"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          {panelLabel}
                        </a>
                      ) : (
                        <div className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 text-[13px] font-medium text-slate-400 dark:border-white/10">
                          <Clock className="h-3.5 w-3.5 animate-pulse" />
                          Being provisioned
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Server Config card — only for IONOS (non-manual) */}
                  {!isManual && (
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-white/[0.07] dark:from-white/[0.04] dark:to-white/[0.02]">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-md shadow-cyan-500/20">
                            <Server className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Server Config</p>
                            <p className="text-sm font-bold text-slate-950 dark:text-white">
                              {provision.configuration.operatingSystemName ?? "Default OS"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-white/80 px-4 py-3 text-[13px] dark:border-white/[0.06] dark:bg-white/[0.03]">
                          {[
                            { label: "OS", value: provision.configuration.operatingSystemName ?? "Default" },
                            { label: "Control panel", value: provision.configuration.controlPanelName ?? "None" },
                            { label: "Add-ons", value: provision.configuration.addonNames.length ? provision.configuration.addonNames.join(", ") : "None" },
                            { label: "Status", value: meta.label }
                          ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 dark:border-white/[0.06]">
                              <span className="text-slate-400">{label}</span>
                              <span className="font-semibold text-slate-950 dark:text-white">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Domain card */}
                  <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-white/[0.07] dark:from-white/[0.04] dark:to-white/[0.02]">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
                          <Globe2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Domain</p>
                          <p className="text-sm font-bold text-slate-950 dark:text-white">
                            {provision.domain.name ?? "Not attached"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-white/80 px-4 py-3 text-[13px] dark:border-white/[0.06] dark:bg-white/[0.03]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">Domain</span>
                          <span className="truncate font-semibold text-slate-950 dark:text-white">{provision.domain.name ?? "—"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/[0.06]">
                          <span className="text-slate-400">Status</span>
                          <span className="capitalize font-semibold text-slate-950 dark:text-white">{provision.domain.status.replace(/_/g, " ")}</span>
                        </div>
                        {provision.domain.name && (
                          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/[0.06]">
                            <span className="text-slate-400">Registrar ref</span>
                            <span className="font-mono text-[11px] text-slate-950 dark:text-white">{provision.domain.registrarReference ?? "Pending"}</span>
                          </div>
                        )}
                      </div>
                      {provision.domain.name && (
                        <Link
                          href="/dashboard/domains"
                          locale={locale}
                          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                        >
                          Manage domain →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Notes / error banners ── */}
                {provision.access.notes && (
                  <div className="mx-5 mb-5 flex items-start gap-3 rounded-2xl border border-blue-200/60 bg-blue-50/60 px-5 py-4 text-sm leading-relaxed text-blue-800 dark:border-blue-400/20 dark:bg-blue-400/[0.08] dark:text-blue-200 sm:mx-6 sm:mb-6">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <span>{provision.access.notes}</span>
                  </div>
                )}
                {provision.errorMessage && (
                  <div className="mx-5 mb-5 flex items-start gap-3 rounded-2xl border border-rose-200/60 bg-rose-50/60 px-5 py-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/[0.08] dark:text-rose-300 sm:mx-6 sm:mb-6">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{provision.errorMessage}</span>
                  </div>
                )}

              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
