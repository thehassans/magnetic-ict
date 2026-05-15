/**
 * MagneticCommerceServicePage
 * ─────────────────────────────────────────────────────────────────────────────
 * Design philosophy: Ultra-premium minimalism
 *   • Dark canvas (#06080f) — depth without noise
 *   • Single accent: indigo → violet gradient — consistency over variety
 *   • Extreme whitespace — breathing room IS the luxury signal
 *   • Typography-led hierarchy — size + weight do all the work
 *   • Micro-animations via Tailwind transitions — alive, never distracting
 *   • Glass morphism cards — layered depth on dark surface
 *   • Zero decorative clutter — every pixel earns its place
 * ─────────────────────────────────────────────────────────────────────────────
 */

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

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const adminModules = [
  { title: "Dashboard",     icon: LayoutDashboard, items: ["Business command center", "Country-first controls", "Global view"] },
  { title: "Orders",        icon: ShoppingBag,     items: ["Orders", "Online Orders"] },
  { title: "Product",       icon: Package,         items: ["Inhouse Products", "Product Detail"] },
  { title: "Amount Office", icon: BadgeDollarSign, items: ["Total Amount", "Daily Reports", "Driver Settlement", "Manager Finances", "Agent Amounts", "Agent History", "Driver Amounts", "Manager Salary", "Dropshipper Earnings", "Investor Earnings"] },
  { title: "Inbox",         icon: Mail,            items: ["Whatsapp Inbox", "Whatsapp Connect"] },
  { title: "Create",        icon: UserPlus,        items: ["Agents", "Managers", "Partners", "Drivers", "Dropshippers", "Investors", "Commissioners", "Confirmers", "Customers"] },
  { title: "Commerce",      icon: Store,           items: ["Driver Stock", "Label Settings", "Website Settings", "Coupons", "Cashback Offers", "Warehouses", "Shipments", "Expense Management"] },
  { title: "Web Designer",  icon: PenTool,         items: ["Categories", "Home Headline", "Home Header", "Product Headline", "Home Banners", "Home Mini Banners", "Brands", "Explore More"] },
  { title: "Insights",      icon: BarChart3,       items: ["Track Drivers", "Business Reports", "Driver Reports", "Profit & Loss", "Campaigns", "Finances", "Website Modification"] },
  { title: "Configuration", icon: Cog,             items: [] },
  { title: "Support",       icon: Headphones,      items: [] },
  { title: "Branding",      icon: Palette,         items: [] },
];

const stakeholderPanels = [
  { title: "Agents",       icon: Users,        summary: "Assigned orders, collections, activity, and field performance." },
  { title: "Managers",     icon: Building2,    summary: "Office totals, team control, salaries, and reporting visibility." },
  { title: "Partners",     icon: Handshake,    summary: "Partner sales, shared revenue, and network performance tracking." },
  { title: "Drivers",      icon: Truck,        summary: "Shipment queue, route state, handoff status, and settlements." },
  { title: "Dropshippers", icon: Package,      summary: "Catalog access, margin tracking, and synced order execution." },
  { title: "Investors",    icon: Wallet,       summary: "Capital visibility, earnings reports, and return tracking." },
  { title: "Confirmers",   icon: ShieldCheck,  summary: "Verification queues, approval flow, and order confirmation status." },
  { title: "Customers",    icon: ShoppingCart, summary: "Website and app shopping, checkout, tracking, and account actions." },
] as const;

const surfaceCards = [
  { title: "E-commerce website", eyebrow: "Desktop", icon: Monitor,    summary: "Storefront, categories, offers, and checkout in one clean web experience.", items: ["Home banner", "Catalog", "Offers", "Checkout"] },
  { title: "iPhone app",         eyebrow: "iOS",     icon: Smartphone,  summary: "Fast iPhone buying flow with cart, account, order tracking, and notifications.", items: ["Browse", "Cart", "Orders", "Profile"] },
  { title: "Android app",        eyebrow: "Android", icon: Smartphone,  summary: "Android shopping experience with offers, delivery tracking, and account tools.", items: ["Products", "Checkout", "Tracking", "Support"] },
] as const;

const stats = [
  { label: "Panels",    value: "8+" },
  { label: "Surfaces",  value: "3" },
  { label: "Modules",   value: "12" },
  { label: "Coverage",  value: "360°" },
] as const;

/* ─── Component ────────────────────────────────────────────────────────────── */

export function MagneticCommerceServicePage({ service, title }: { service: CatalogService; title: string }) {
  return (
    /**
     * Root canvas: near-black bg creates depth.
     * Every section sits on top of this — cards feel elevated even without heavy shadows.
     */
    <main className="bg-white dark:bg-[#06080f]">

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
          ───────────────────────────────────────────────────────────────────────
          Minimalist hero: oversized type + single CTA.
          No image noise. Radial glows handle all the atmosphere.
          Left-aligned (not centred) — feels editorial, not SaaS-generic.
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-slate-200/30 py-28 dark:border-white/[0.05] sm:py-36">

        {/* Ambient glow — indigo left, cyan right. Subtle, not garish. */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[20%] -top-[30%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.13),transparent_65%)] blur-3xl" />
          <div className="absolute -right-[10%] top-[5%]  h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.09),transparent_65%)] blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            {/* Eyebrow — tiny, tracked, restrained */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-500/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-indigo-400">
              <Sparkles className="h-3 w-3" />
              {service.eyebrow}
            </div>

            {/* Hero headline — massive, tight, authoritative */}
            <h1 className="mt-8 max-w-4xl text-5xl font-bold leading-[1.06] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
              {title}
            </h1>

            {/* Sub-headline — one calm sentence. No bullet lists here. */}
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500 dark:text-slate-400">
              A single commerce engine spanning admin, 8 stakeholder panels, and Web&nbsp;+&nbsp;iOS&nbsp;+&nbsp;Android surfaces — from catalog to final delivery.
            </p>

            {/* CTAs — primary gradient pill + ghost pill. Two max. */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="https://commerce.magnetic-ict.com"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
              >
                Open live demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#commerce-pricing"
                className="inline-flex h-12 items-center rounded-full border border-slate-300/60 px-8 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.08] dark:text-white dark:hover:border-indigo-400/30 dark:hover:text-indigo-300"
              >
                View packages
              </a>
            </div>
          </ScrollReveal>

          {/* ── Stats row ─────────────────────────────────────────────────────
              Four numbers in clean pill cards.
              Numbers do the persuading; labels stay secondary.
          ─────────────────────────────────────────────────────────────────── */}
          <ScrollReveal delay={0.08}>
            <div className="mt-16 flex flex-wrap gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-slate-200/50 bg-white/70 px-6 py-4 backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.03]"
                >
                  {/* Large value — this is what users scan first */}
                  <div className="text-2xl font-bold text-slate-950 dark:text-white">{s.value}</div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADMIN PANEL SHOWCASE
          ───────────────────────────────────────────────────────────────────────
          Full-bleed screenshot first — show before tell.
          Module grid beneath explains what the screenshot shows.
          Cards use glass/frost styling: translucent bg + thin border.
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 sm:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.07),transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            {/* Section label — consistent pattern used throughout */}
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-400">
              <LayoutDashboard className="h-3.5 w-3.5" /> Owner Admin Panel
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Your complete business command center.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-500 dark:text-slate-400">
              12 modules, full financial visibility, multi-role management, and real-time operations — from one panel.
            </p>
          </ScrollReveal>

          {/* Screenshot — full width, rounded, single shadow. Uncluttered. */}
          <ScrollReveal delay={0.06}>
            <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-3xl border border-slate-200/40 shadow-[0_32px_80px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:shadow-[0_32px_80px_rgba(2,6,23,0.5)]">
              <Image
                src="/services/magnetic-commerce/adminpanel.png"
                alt="Magnetic Commerce admin panel"
                width={1920}
                height={1080}
                sizes="(max-width: 1024px) 100vw, 64vw"
                className="w-full h-auto"
                priority
              />
            </div>
          </ScrollReveal>

          {/* Module grid — restrained cards, no color gradients on icons here.
              Monochrome accent keeps the grid unified and calm.              */}
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {adminModules.map((mod, i) => (
              <ScrollReveal key={mod.title} delay={i * 0.03}>
                <div className="group h-full rounded-2xl border border-slate-200/50 bg-white/60 p-5 transition-all hover:border-indigo-200/40 hover:shadow-lg dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
                  <div className="flex items-center gap-3">
                    {/* Icon container — subtle indigo tint, no heavy gradient */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <mod.icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-950 dark:text-white">{mod.title}</h3>
                  </div>

                  {/* Feature chips — only rendered when items exist */}
                  {mod.items.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {mod.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-slate-200/60 bg-slate-50/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-400"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STAKEHOLDER PANELS
          ───────────────────────────────────────────────────────────────────────
          "Each role gets its own panel" — the key differentiator.
          Clean 4-col grid, no gradients, let the text lead.
          Hover lifts card with a single box-shadow. Simple.
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="relative border-y border-slate-200/30 py-28 dark:border-white/[0.05] sm:py-36">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white dark:from-white/[0.015] dark:to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-400">
              <Users className="h-3.5 w-3.5" /> Separate Panels
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Each role gets its own panel.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-500 dark:text-slate-400">
              Minimal view, clear structure, full role separation.
            </p>
          </ScrollReveal>

          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stakeholderPanels.map((panel, i) => (
              <ScrollReveal key={panel.title} delay={i * 0.05}>
                {/* Card: white/glass bg, thin border, hover shadow only — no gradient noise */}
                <div className="group h-full rounded-2xl border border-slate-200/50 bg-white p-6 transition-all hover:border-slate-300/50 hover:shadow-xl dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
                  {/* Icon — consistent size, consistent placement */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                    <panel.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-950 dark:text-white">{panel.title}</h3>
                  {/* Summary — small, subdued. Let the title carry weight. */}
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{panel.summary}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SURFACE COVERAGE
          ───────────────────────────────────────────────────────────────────────
          Web + iOS + Android. Three cards, horizontal, equal weight.
          Feature list uses a thin left-border for visual rhythm.
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-400">
                  <Globe className="h-3.5 w-3.5" /> Surface Coverage
                </p>
                <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                  One system. Every surface.
                </h2>
              </div>
              <a
                href="https://commerce.magnetic-ict.com"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-slate-300/60 px-7 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.08] dark:text-white dark:hover:border-indigo-400/30"
              >
                View demo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {surfaceCards.map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.06}>
                <div className="group h-full rounded-2xl border border-slate-200/50 bg-white p-7 transition-all hover:border-indigo-200/40 hover:shadow-xl dark:border-white/[0.05] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
                  {/* Eyebrow badge — tiny platform label */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-400">{card.eyebrow}</span>
                  <div className="mt-3 flex items-center gap-3">
                    <card.icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">{card.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.summary}</p>

                  {/* Feature list — left-border accent instead of bullet dots */}
                  <ul className="mt-5 space-y-2 border-l border-slate-200/60 pl-4 dark:border-white/[0.06]">
                    {card.items.map((item) => (
                      <li key={item} className="text-xs font-medium text-slate-600 dark:text-slate-400">{item}</li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* App store badges — placed after cards, not before. Conversion, not decoration. */}
          <ScrollReveal delay={0.1}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Image src="/services/magnetic-commerce/app-store-badge.png"  alt="Download on the App Store"  width={140} height={44} className="h-11 w-auto rounded-xl object-contain opacity-80 transition hover:opacity-100" />
              <Image src="/services/magnetic-commerce/play-store-badge.png" alt="Get it on Google Play"       width={140} height={44} className="h-11 w-auto rounded-xl object-contain opacity-80 transition hover:opacity-100" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PRICING
          ───────────────────────────────────────────────────────────────────────
          The ServiceTierSelector component owns its own layout.
          Section simply sets context copy then yields to it.
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="commerce-pricing" className="relative border-t border-slate-200/30 py-28 dark:border-white/[0.05] sm:py-36">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/40 to-white dark:from-white/[0.015] dark:to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <ScrollReveal>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-indigo-500 dark:text-indigo-400">
              <BadgeDollarSign className="h-3.5 w-3.5" /> Rollout Packages
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Choose the delivery scope that matches your launch.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
              Start with a structured commerce foundation, then scale into advanced operations, stakeholder finance, and multi-role execution.
            </p>
          </ScrollReveal>

          <div className="mt-14">
            <ServiceTierSelector service={service} />
          </div>
        </div>
      </section>
    </main>
  );
}
