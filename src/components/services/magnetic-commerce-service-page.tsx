import Image from "next/image";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  BookOpen,
  Building2,
  ChevronRight,
  Cog,
  Globe,
  Handshake,
  Headphones,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Monitor,
  Package,
  Paintbrush,
  Palette,
  PenTool,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Truck,
  UserPlus,
  Users,
  Wallet,
  Zap
} from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { ServiceTierSelector } from "@/components/services/service-tier-selector";
import type { CatalogService } from "@/lib/service-catalog";

/* ── Admin panel sidebar modules ── */
const adminModules = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    accent: "from-blue-500 to-cyan-400",
    items: ["Business command center", "Country-first controls", "Global view"]
  },
  {
    title: "Orders",
    icon: ShoppingBag,
    accent: "from-violet-500 to-purple-400",
    items: ["Orders", "Online Orders"]
  },
  {
    title: "Product",
    icon: Package,
    accent: "from-emerald-500 to-teal-400",
    items: ["Inhouse Products", "Product Detail"]
  },
  {
    title: "Amount Office",
    icon: BadgeDollarSign,
    accent: "from-amber-500 to-orange-400",
    items: ["Total Amount", "Daily Reports", "Driver Settlement", "Manager Finances", "Agent Amounts", "Agent History", "Driver Amounts", "Manager Salary", "Dropshipper Earnings", "Investor Earnings"]
  },
  {
    title: "Inbox",
    icon: Mail,
    accent: "from-sky-500 to-blue-400",
    items: ["Whatsapp Inbox", "Whatsapp Connect"]
  },
  {
    title: "Create",
    icon: UserPlus,
    accent: "from-indigo-500 to-violet-400",
    items: ["Agents", "Managers", "Partners", "Drivers", "Dropshippers", "Investors", "Commissioners", "Confirmers", "Customers"]
  },
  {
    title: "Commerce",
    icon: Store,
    accent: "from-rose-500 to-pink-400",
    items: ["Driver Stock", "Label Settings", "Website Settings", "Coupons", "Cashback Offers", "Warehouses", "Shipments", "Expense Management"]
  },
  {
    title: "Web Designer",
    icon: PenTool,
    accent: "from-fuchsia-500 to-purple-400",
    items: ["Categories", "Home Headline", "Home Header", "Product Headline", "Home Banners", "Home Mini Banners", "Brands", "Explore More"]
  },
  {
    title: "Insights",
    icon: BarChart3,
    accent: "from-cyan-500 to-teal-400",
    items: ["Track Drivers", "Business Reports", "Driver Reports", "Profit & Loss", "Campaigns", "Finances", "Website Modification"]
  },
  {
    title: "Configuration",
    icon: Cog,
    accent: "from-slate-500 to-gray-400",
    items: []
  },
  {
    title: "Support",
    icon: Headphones,
    accent: "from-green-500 to-emerald-400",
    items: []
  },
  {
    title: "Branding",
    icon: Palette,
    accent: "from-pink-500 to-rose-400",
    items: []
  }
];

/* ── Stakeholder panels ── */
const stakeholderPanels = [
  { title: "Agents", icon: Users, summary: "Assigned orders, collections, activity, and field performance.", accent: "from-blue-500 to-cyan-400" },
  { title: "Managers", icon: Building2, summary: "Office totals, team control, salaries, and reporting visibility.", accent: "from-violet-500 to-purple-400" },
  { title: "Partners", icon: Handshake, summary: "Partner sales, shared revenue, and network performance tracking.", accent: "from-amber-500 to-orange-400" },
  { title: "Drivers", icon: Truck, summary: "Shipment queue, route state, handoff status, and settlements.", accent: "from-emerald-500 to-teal-400" },
  { title: "Dropshippers", icon: Package, summary: "Catalog access, margin tracking, and synced order execution.", accent: "from-rose-500 to-pink-400" },
  { title: "Investors", icon: Wallet, summary: "Capital visibility, earnings reports, and return tracking.", accent: "from-indigo-500 to-blue-400" },
  { title: "Confirmers", icon: ShieldCheck, summary: "Verification queues, approval flow, and order confirmation status.", accent: "from-cyan-500 to-sky-400" },
  { title: "Customers", icon: ShoppingCart, summary: "Website and app shopping, checkout, tracking, and account actions.", accent: "from-fuchsia-500 to-violet-400" }
] as const;

/* ── Surface cards ── */
const surfaceCards = [
  { title: "E-commerce website", eyebrow: "Desktop front", icon: Monitor, summary: "Storefront, categories, offers, product pages, and checkout in one clean web experience.", items: ["Home banner", "Catalog", "Offers", "Checkout"] },
  { title: "iPhone app", eyebrow: "Mobile surface", icon: Smartphone, summary: "Fast iPhone buying flow with cart, account, order tracking, and notifications.", items: ["Browse", "Cart", "Orders", "Profile"] },
  { title: "Android app", eyebrow: "Mobile surface", icon: Smartphone, summary: "Android shopping experience with offers, delivery tracking, and account tools.", items: ["Products", "Checkout", "Tracking", "Support"] }
] as const;

const quickStats = [
  { label: "Panels", value: "8", icon: Users },
  { label: "Surfaces", value: "Web + iPhone + Android", icon: Globe },
  { label: "Coverage", value: "Catalog to delivery", icon: Package },
  { label: "Mode", value: "Minimal copy", icon: Zap }
] as const;

const frontHighlights = [
  "Desktop storefront front",
  "Role-based backoffice",
  "Warehouse + delivery flow",
  "Finance + investor visibility"
] as const;

export function MagneticCommerceServicePage({ service, title }: { service: CatalogService; title: string }) {
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
                <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {service.eyebrow}
                </div>
                <div className="space-y-5">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">{title}</h1>
                  <p className="max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg sm:leading-8">Clean commerce front, separate stakeholder panels, and connected website&nbsp;+&nbsp;iPhone&nbsp;+&nbsp;Android experiences.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {frontHighlights.map((h) => (
                    <div key={h} className="rounded-full border border-slate-200/70 bg-slate-50/80 px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-400/30 dark:hover:text-indigo-300">{h}</div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="https://commerce.magnetic-ict.com" target="_blank" rel="noreferrer" className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30">
                    Open live demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a href="#commerce-pricing" className="inline-flex h-12 items-center rounded-full border border-slate-300/80 bg-white px-7 text-sm font-semibold text-slate-700 transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:hover:border-indigo-400/30 dark:hover:text-indigo-300">View rollout packages</a>
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

            {/* Right — store badges + surfaces */}
            <ScrollReveal delay={0.1}>
              <div className="space-y-6 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-[0_8px_60px_rgba(99,102,241,0.06)] ring-1 ring-white/60 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-[0_8px_60px_rgba(99,102,241,0.12)] dark:ring-white/[0.04] sm:p-8">
                <div className="grid gap-3 sm:grid-cols-2">
                  {surfaceCards.map((surface, index) => (
                    <div key={surface.title} className={`${index === 0 ? "sm:col-span-2" : ""} group rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-5 transition hover:border-indigo-200/50 hover:shadow-lg dark:border-white/[0.06] dark:from-white/[0.04] dark:to-white/[0.01] dark:hover:border-indigo-400/20`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500">{surface.eyebrow}</div>
                          <div className="mt-2 text-lg font-bold text-slate-950 dark:text-white">{surface.title}</div>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-indigo-400">
                          <surface.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{surface.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {surface.items.map((item) => (
                          <span key={item} className="rounded-full border border-slate-200/70 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Store badges */}
                <div className="flex flex-wrap items-center gap-4">
                  <Image src="/services/magnetic-commerce/app-store-badge.png" alt="Download on the App Store" width={156} height={48} className="h-[48px] w-auto rounded-xl object-contain shadow-md" />
                  <Image src="/services/magnetic-commerce/play-store-badge.png" alt="Get it on Google Play" width={156} height={48} className="h-[48px] w-auto rounded-xl object-contain shadow-md" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ──── ADMIN PANEL SHOWCASE ──── */}
      <section className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400">
                <LayoutDashboard className="h-4 w-4" /> Owner Admin Panel
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Your complete business command center.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                12 modules, full financial visibility, multi-role management, and real-time operations — all from one panel.
              </p>
            </div>
          </ScrollReveal>

          {/* Admin panel image */}
          <ScrollReveal delay={0.08}>
            <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-3xl border border-slate-200/60 shadow-2xl shadow-indigo-500/5 dark:border-white/[0.08] dark:shadow-indigo-500/10">
              <Image src="/services/magnetic-commerce/adminpanel.png" alt="Magnetic Commerce admin panel" width={1920} height={1080} sizes="(max-width: 1024px) 100vw, 64vw" className="w-full h-auto" priority />
            </div>
          </ScrollReveal>

          {/* Admin modules grid */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {adminModules.map((mod, index) => (
              <ScrollReveal key={mod.title} delay={index * 0.04}>
                <div className="group h-full rounded-2xl border border-slate-200/60 bg-white p-5 transition-all hover:border-transparent hover:shadow-xl dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.05] dark:hover:shadow-indigo-500/5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${mod.accent} text-white shadow-sm`}>
                      <mod.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-white">{mod.title}</h3>
                  </div>
                  {mod.items.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {mod.items.map((item) => (
                        <span key={item} className="rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">{item}</span>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── STAKEHOLDER PANELS ──── */}
      <section className="relative border-y border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40 dark:from-white/[0.02] dark:via-transparent dark:to-white/[0.01]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400">
                <Users className="h-4 w-4" /> Separate panels
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">Each role gets its own panel.</h2>
              <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">Minimal view, clear structure, full role separation.</p>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stakeholderPanels.map((panel, index) => (
              <ScrollReveal key={panel.title} delay={index * 0.06}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 transition-all hover:border-transparent hover:shadow-xl dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3.5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${panel.accent} text-white shadow-lg shadow-black/5`}>
                      <panel.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">{panel.title}</h3>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{panel.summary}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── SURFACE COVERAGE ──── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400">
                  <Globe className="h-4 w-4" /> Surface coverage
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">One commerce system across desktop and mobile.</h2>
              </div>
              <a href="https://commerce.magnetic-ict.com" target="_blank" rel="noreferrer" className="group inline-flex h-12 items-center gap-2 rounded-full border border-slate-300/80 px-7 text-sm font-semibold text-slate-700 transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.1] dark:text-white dark:hover:border-indigo-400/30 dark:hover:text-indigo-300">
                Visit commerce demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {surfaceCards.map((card, index) => (
              <ScrollReveal key={card.title} delay={index * 0.05}>
                <div className="group h-full rounded-2xl border border-slate-200/60 bg-white p-6 transition-all hover:border-indigo-200/50 hover:shadow-xl dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:border-indigo-400/15">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-indigo-400">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">{card.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{card.summary}</p>
                  <ul className="mt-4 space-y-2.5">
                    {card.items.map((item) => (
                      <li key={item} className="rounded-xl border border-slate-200/60 bg-slate-50/60 px-4 py-2.5 text-sm font-medium text-slate-600 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-300">{item}</li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── PRICING ──── */}
      <section id="commerce-pricing" className="relative border-t border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white dark:from-white/[0.02] dark:to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-400">
                <BadgeDollarSign className="h-4 w-4" /> Rollout packages
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">Choose the Magnetic Commerce delivery scope that matches your launch plan.</h2>
              <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">Start with a structured commerce foundation, then scale into advanced operations, stakeholder finance, reporting depth, and multi-role execution.</p>
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
