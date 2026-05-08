import {
  ArrowRight,
  BadgeDollarSign,
  ChevronRight,
  Cpu,
  Database,
  Globe,
  HardDrive,
  LayoutDashboard,
  Lock,
  Monitor,
  Network,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { ServiceTierSelector } from "@/components/services/service-tier-selector";
import type { CatalogService } from "@/lib/service-catalog";

const vpsSpecs = [
  { label: "vCPU", icon: Cpu, values: ["2 vCPU", "4 vCPU", "8 vCPU", "16 vCPU"] },
  { label: "RAM", icon: Database, values: ["4 GB", "8 GB", "16 GB", "32 GB"] },
  { label: "Storage", icon: HardDrive, values: ["80 GB SSD", "160 GB SSD", "320 GB NVMe", "640 GB NVMe"] },
  { label: "Bandwidth", icon: Network, values: ["2 TB", "4 TB", "8 TB", "Unmetered"] },
] as const;

const infraFeatures = [
  { title: "Instant Provisioning", icon: Zap, accent: "from-amber-500 to-orange-400", items: ["< 60 second deploy", "Pre-configured OS", "SSH key injection", "Root access"] },
  { title: "Full Root Access", icon: Terminal, accent: "from-slate-600 to-gray-500", items: ["Full shell access", "sudo privileges", "Custom packages", "Kernel-level control"] },
  { title: "DDoS Protection", icon: ShieldCheck, accent: "from-violet-500 to-purple-400", items: ["Layer 3/4 mitigation", "Auto traffic scrubbing", "Always-on protection", "Zero config"] },
  { title: "Global Locations", icon: Globe, accent: "from-cyan-500 to-sky-400", items: ["Middle East", "Europe", "Asia Pacific", "North America"] },
  { title: "Managed Panel", icon: LayoutDashboard, accent: "from-indigo-500 to-blue-400", items: ["1-click rebuild", "Snapshot & restore", "Usage graphs", "Power controls"] },
  { title: "99.9% Uptime SLA", icon: Clock, accent: "from-emerald-500 to-teal-400", items: ["Redundant networking", "Hardware failover", "Health monitoring", "Auto-alerting"] },
  { title: "Scalable Resources", icon: TrendingUp, accent: "from-rose-500 to-pink-400", items: ["Vertical scaling", "No data loss", "Live resize", "Pay-as-you-grow"] },
  { title: "Private Networking", icon: Lock, accent: "from-fuchsia-500 to-violet-400", items: ["VLAN isolation", "Private IPs", "Firewall rules", "IPSec tunnels"] },
] as const;

const operatingSystems = [
  { name: "Ubuntu 22.04 LTS", badge: "Recommended", color: "bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-300" },
  { name: "Debian 12", badge: "Stable", color: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-300" },
  { name: "AlmaLinux 9", badge: "Enterprise", color: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300" },
  { name: "Rocky Linux 9", badge: "RHEL compatible", color: "bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300" },
  { name: "Windows Server 2022", badge: "Available", color: "bg-slate-100 text-slate-700 dark:bg-slate-400/10 dark:text-slate-300" },
] as const;

const quickStats = [
  { label: "Deploy time", value: "< 60 sec", icon: Zap },
  { label: "Uptime SLA", value: "99.9%", icon: ShieldCheck },
  { label: "DDoS Protection", value: "Always-on", icon: Lock },
  { label: "Locations", value: "4 regions", icon: Globe },
] as const;

const heroHighlights = [
  "Instant provisioning",
  "Full root access",
  "DDoS protection included",
  "Magnetic-branded panel",
] as const;

export function MagneticVpsServicePage({ service, title }: { service: CatalogService; title: string }) {
  return (
    <main className="bg-white dark:bg-[#06080f]">
      {/* ──── HERO ──── */}
      <section className="relative overflow-hidden border-b border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[20%] -top-[40%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(99,102,241,0.2),transparent_60%)]" />
          <div className="absolute -right-[10%] top-[10%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            {/* Left hero */}
            <ScrollReveal>
              <div className="space-y-8 rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-[0_8px_60px_rgba(99,102,241,0.06)] ring-1 ring-white/60 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-[0_8px_60px_rgba(99,102,241,0.12)] dark:ring-white/[0.04] sm:p-10">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-cyan-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-700 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-cyan-500/10 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {service.eyebrow}
                </div>
                <div className="space-y-5">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">{title}</h1>
                  <p className="max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg sm:leading-8">
                    Launch Magnetic-branded VPS infrastructure in under 60 seconds. Full root access, DDoS protection, global locations, and a clean operator control panel — all under your brand.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {heroHighlights.map((h) => (
                    <div key={h} className="rounded-full border border-slate-200/70 bg-slate-50/80 px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-400/30 dark:hover:text-indigo-300">{h}</div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="#vps-pricing" className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
                    See plans <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a href="#vps-specs" className="inline-flex h-12 items-center rounded-full border border-slate-300/80 bg-white px-7 text-sm font-semibold text-slate-700 transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:hover:border-indigo-400/30 dark:hover:text-indigo-300">View specs</a>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="group rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white p-4 transition hover:border-indigo-200/60 hover:shadow-md dark:border-white/[0.06] dark:from-white/[0.03] dark:to-white/[0.01] dark:hover:border-indigo-400/20">
                      <div className="flex items-center gap-2">
                        <stat.icon className="h-3.5 w-3.5 text-indigo-500/60 dark:text-indigo-400/50" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{stat.label}</span>
                      </div>
                      <div className="mt-2.5 text-sm font-semibold text-slate-900 dark:text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Right — server card */}
            <ScrollReveal delay={0.1}>
              <div className="space-y-5 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-[0_8px_60px_rgba(99,102,241,0.06)] ring-1 ring-white/60 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 shadow-lg">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Live server preview</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Magnetic VPS · Ready in 60s</p>
                  </div>
                </div>

                {/* Terminal-style status block */}
                <div className="rounded-2xl border border-slate-200/60 bg-slate-950 p-4 font-mono text-xs dark:border-white/[0.08]">
                  <div className="flex gap-2 mb-3">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-1.5 text-slate-300">
                    <p><span className="text-emerald-400">$</span> vps create --plan premium --region me-1</p>
                    <p className="text-slate-500">Provisioning node... <span className="text-emerald-400">✓</span></p>
                    <p className="text-slate-500">Applying OS template... <span className="text-emerald-400">✓</span></p>
                    <p className="text-slate-500">Injecting SSH keys... <span className="text-emerald-400">✓</span></p>
                    <p className="text-cyan-400">Server ready → 185.220.x.x <span className="animate-pulse">█</span></p>
                  </div>
                </div>

                {/* OS list */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500 mb-3">Available OS images</p>
                  <div className="space-y-2">
                    {operatingSystems.map((os) => (
                      <div key={os.name} className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-slate-50/60 px-4 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{os.name}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${os.color}`}>{os.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ──── SPECS TABLE ──── */}
      <section id="vps-specs" className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400">
                <Cpu className="h-4 w-4" /> Server Specifications
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Raw power. Clean packaging.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                Choose your tier from entry-level to enterprise. All plans include DDoS protection, full root access, and 99.9% uptime SLA.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200/60 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-white/[0.06]">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Resource</th>
                      {["Starter", "Professional", "Business", "Enterprise"].map((tier) => (
                        <th key={tier} className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.24em] text-slate-700 dark:text-slate-200">{tier}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/40 dark:divide-white/[0.04]">
                    {vpsSpecs.map((spec) => (
                      <tr key={spec.label} className="group hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <spec.icon className="h-4 w-4 text-indigo-400/60" />
                            <span className="font-semibold text-slate-900 dark:text-white">{spec.label}</span>
                          </div>
                        </td>
                        {spec.values.map((val) => (
                          <td key={val} className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{val}</td>
                        ))}
                      </tr>
                    ))}
                    <tr className="group hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                      <td className="px-6 py-4"><div className="flex items-center gap-2.5"><ShieldCheck className="h-4 w-4 text-indigo-400/60" /><span className="font-semibold text-slate-900 dark:text-white">DDoS Protection</span></div></td>
                      {["Included", "Included", "Included", "Included"].map((v, i) => (
                        <td key={i} className="px-6 py-4 text-center"><span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">✓ {v}</span></td>
                      ))}
                    </tr>
                    <tr className="group hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                      <td className="px-6 py-4"><div className="flex items-center gap-2.5"><Lock className="h-4 w-4 text-indigo-400/60" /><span className="font-semibold text-slate-900 dark:text-white">Full Root Access</span></div></td>
                      {["✓", "✓", "✓", "✓"].map((v, i) => (
                        <td key={i} className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">{v}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── INFRASTRUCTURE FEATURES ──── */}
      <section className="relative border-y border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40 dark:from-white/[0.02] dark:via-transparent dark:to-white/[0.01]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400">
                <Settings2 className="h-4 w-4" /> Infrastructure features
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">Everything your infrastructure needs.</h2>
              <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">8 fully managed infrastructure modules — from provisioning to private networking to live scaling.</p>
            </div>
          </ScrollReveal>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {infraFeatures.map((mod, index) => (
              <ScrollReveal key={mod.title} delay={index * 0.04}>
                <div className="group h-full rounded-2xl border border-slate-200/60 bg-white p-5 transition-all hover:border-transparent hover:shadow-xl dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${mod.accent} text-white shadow-sm`}>
                      <mod.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-white">{mod.title}</h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {mod.items.map((item) => (
                      <span key={item} className="rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">{item}</span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── PRICING ──── */}
      <section id="vps-pricing" className="relative border-t border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white dark:from-white/[0.02] dark:to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400">
                <BadgeDollarSign className="h-4 w-4" /> VPS Plans
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Pick your plan. Launch in minutes.
              </h2>
              <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                From solo developers to enterprise teams. All plans include full root access, DDoS protection, and 99.9% uptime SLA.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-12">
            <ServiceTierSelector service={service} />
          </div>
        </div>
      </section>
    </main>
  );
}
