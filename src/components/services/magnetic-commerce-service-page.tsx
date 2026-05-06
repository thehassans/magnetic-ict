import Image from "next/image";
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  Handshake,
  LayoutTemplate,
  Monitor,
  Package,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Store,
  Truck,
  Users,
  Wallet
} from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { ServiceTierSelector } from "@/components/services/service-tier-selector";
import { AppStoreBadge, PlayStoreBadge } from "@/components/ui/payment-brand-icons";
import type { CatalogService } from "@/lib/service-catalog";

const stakeholderPanels = [
  {
    title: "Agents",
    icon: Users,
    summary: "Assigned orders, collections, activity, and field performance."
  },
  {
    title: "Managers",
    icon: Building2,
    summary: "Office totals, team control, salaries, and reporting visibility."
  },
  {
    title: "Partners",
    icon: Handshake,
    summary: "Partner sales, shared revenue, and network performance tracking."
  },
  {
    title: "Drivers",
    icon: Truck,
    summary: "Shipment queue, route state, handoff status, and settlements."
  },
  {
    title: "Dropshippers",
    icon: Package,
    summary: "Catalog access, margin tracking, and synced order execution."
  },
  {
    title: "Investors",
    icon: Wallet,
    summary: "Capital visibility, earnings reports, and return tracking."
  },
  {
    title: "Confirmers",
    icon: ShieldCheck,
    summary: "Verification queues, approval flow, and order confirmation status."
  },
  {
    title: "Customers",
    icon: ShoppingCart,
    summary: "Website and app shopping, checkout, tracking, and account actions."
  }
] as const;

const surfaceCards = [
  {
    title: "E-commerce website",
    eyebrow: "Desktop front",
    icon: Monitor,
    summary: "Storefront, categories, offers, product pages, and checkout in one clean web experience.",
    items: ["Home banner", "Catalog", "Offers", "Checkout"]
  },
  {
    title: "iPhone app",
    eyebrow: "Mobile surface",
    icon: Smartphone,
    summary: "Fast iPhone buying flow with cart, account, order tracking, and notifications.",
    items: ["Browse", "Cart", "Orders", "Profile"]
  },
  {
    title: "Android app",
    eyebrow: "Mobile surface",
    icon: Smartphone,
    summary: "Android shopping experience with offers, delivery tracking, and account tools.",
    items: ["Products", "Checkout", "Tracking", "Support"]
  }
] as const;

const featureGroups = [
  {
    title: "Storefront & content",
    icon: Store,
    items: ["Home header", "Home banners", "Categories", "Brands", "Website sections", "Product detail amount"]
  },
  {
    title: "Products & orders",
    icon: LayoutTemplate,
    items: ["Products", "Inhouse products", "Online orders", "Coupons", "Cashback", "Campaigns"]
  },
  {
    title: "Delivery & warehouse",
    icon: Truck,
    items: ["Warehouses", "Shipments", "Driver tracking", "Driver reports", "Confirmers", "Dispatch flow"]
  },
  {
    title: "Finance & reports",
    icon: BadgeDollarSign,
    items: ["Office totals", "Agent amounts", "Investor earnings", "Profit & loss", "Daily reports", "Business reports"]
  }
] as const;

const quickStats = [
  {
    label: "Panels",
    value: "8"
  },
  {
    label: "Surfaces",
    value: "Web + iPhone + Android"
  },
  {
    label: "Coverage",
    value: "Catalog to delivery"
  },
  {
    label: "Mode",
    value: "Minimal copy"
  }
] as const;

const frontHighlights = [
  "Desktop storefront front",
  "Role-based backoffice",
  "Warehouse + delivery flow",
  "Finance + investor visibility"
] as const;

export function MagneticCommerceServicePage({ service, title }: { service: CatalogService; title: string }) {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_32%),linear-gradient(180deg,#ffffff,#f8fafc)] py-16 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,#020617,#0f172a)] sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <ScrollReveal>
            <div className="space-y-6 rounded-[2rem] border border-slate-200/70 bg-white/85 p-8 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_28px_80px_rgba(2,6,23,0.45)] sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                {service.eyebrow}
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                  Clean commerce front, separate stakeholder panels, and connected website + iPhone + Android experiences.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {frontHighlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-full border border-slate-200/70 bg-slate-50/90 px-4 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://commerce.magnetic-ict.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-violet-700 dark:bg-white dark:text-slate-950 dark:hover:bg-cyan-200"
                >
                  Open live demo
                </a>
                <a
                  href="#commerce-pricing"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-cyan-400/30 dark:hover:text-cyan-200"
                >
                  View rollout packages
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickStats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.25rem] border border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{stat.label}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
              <div className="rounded-[1.75rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.78))]">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-200">Magnetic Ecommerce front</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Desktop front added into the commerce page.</h2>
                </div>
                <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/70">
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src="/services/magnetic-commerce/adminpanel.png"
                      alt="Magnetic Commerce admin panel desktop preview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className="object-cover object-top"
                      priority
                    />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <AppStoreBadge />
                  <PlayStoreBadge />
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {surfaceCards.map((surface, index) => (
                    <div
                      key={surface.title}
                      className={index === 0 ? "sm:col-span-2 rounded-[1.5rem] border border-slate-200/70 bg-white px-5 py-5 dark:border-white/10 dark:bg-white/5" : "rounded-[1.5rem] border border-slate-200/70 bg-white px-5 py-5 dark:border-white/10 dark:bg-white/5"}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">{surface.eyebrow}</div>
                          <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{surface.title}</div>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
                          <surface.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{surface.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {surface.items.map((item) => (
                          <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200/70 bg-slate-950 p-5 text-white dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-cyan-200">Operations</div>
                        <div className="mt-2 text-2xl font-semibold">Orders to delivery</div>
                      </div>
                      <Building2 className="h-8 w-8 text-cyan-200" />
                    </div>
                    <div className="mt-4 text-sm leading-7 text-slate-200">Products, confirmations, warehouses, shipments, and drivers stay connected.</div>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200/70 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Demo environment</div>
                    <div className="mt-2 inline-flex items-center gap-2 text-xl font-semibold text-slate-950 dark:text-white">
                      commerce.magnetic-ict.com
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <div className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Live storefront front plus role-based operations preview.</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Separate panels</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Each role gets its own panel.
              </h2>
              <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
                Minimal view, clear structure, full role separation.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stakeholderPanels.map((panel, index) => (
              <ScrollReveal key={panel.title} delay={index * 0.06}>
                <div className="h-full rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
                      <panel.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{panel.title}</h3>
                  </div>
                  <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">{panel.summary}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-slate-50/80 py-16 dark:border-white/10 dark:bg-white/[0.03] sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Feature groups</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                All features, explained with less text.
              </h2>
              <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
                The page keeps the structure concise while still covering storefront, orders, delivery, and finance.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {featureGroups.map((group, index) => (
              <ScrollReveal key={group.title} delay={index * 0.06}>
                <div className="h-full rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/50 dark:shadow-none">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">{group.title}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                      <group.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <div key={item} className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Surface coverage</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  One commerce system across desktop and mobile.
                </h2>
              </div>
              <a
                href="https://commerce.magnetic-ict.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:text-white dark:hover:border-cyan-400/30 dark:hover:text-cyan-200"
              >
                Visit commerce demo
              </a>
            </div>
          </ScrollReveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {surfaceCards.map((card, index) => (
              <ScrollReveal key={card.title} delay={index * 0.05}>
                <div className="h-full rounded-[1.5rem] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{card.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{card.summary}</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {card.items.map((item) => (
                      <li key={item} className="rounded-[1rem] border border-slate-200/80 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-slate-950/50">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="commerce-pricing" className="border-t border-slate-200/70 bg-[linear-gradient(180deg,#f8fafc,rgba(255,255,255,0.92))] py-16 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(15,23,42,0.55))] sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Rollout packages</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Choose the Magnetic Commerce delivery scope that matches your launch plan.
              </h2>
              <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
                Start with a structured commerce foundation, then scale into advanced operations, stakeholder finance, reporting depth, and multi-role execution.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-8">
            <ServiceTierSelector service={service} />
          </div>
        </div>
      </section>
    </main>
  );
}
