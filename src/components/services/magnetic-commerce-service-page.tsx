import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  Building2,
  ClipboardList,
  LayoutTemplate,
  Package,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wallet
} from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { ServiceTierSelector } from "@/components/services/service-tier-selector";
import type { CatalogService } from "@/lib/service-catalog";

const roleCards = [
  {
    title: "Role-based operations",
    icon: Users,
    items: ["Agents", "Managers", "Partners", "Drivers", "Dropshippers", "Investors", "Confirmers", "Customers"]
  },
  {
    title: "Commerce controls",
    icon: ShieldCheck,
    items: ["Label settings", "Coupons", "Cashback offers", "Expense management", "References", "Social links"]
  },
  {
    title: "Fulfillment network",
    icon: Truck,
    items: ["Warehouses", "Shipments", "Driver settlement", "Track drivers", "Driver reports", "Online order routing"]
  }
] as const;

const workspaceSections = [
  {
    title: "Commerce management dashboard",
    eyebrow: "Executive command",
    icon: Store,
    description:
      "Operate storefront, backoffice, and fulfillment from one control layer built for high-volume commerce teams.",
    points: [
      "Live KPIs for total amount, office performance, daily reports, and order velocity.",
      "Dedicated queues for online orders, inhouse products, confirmations, and warehouse handoffs.",
      "Actionable summaries for manager finances, agent amounts, driver amounts, and investor earnings."
    ]
  },
  {
    title: "Catalog, products, and web designer",
    eyebrow: "Merchandising engine",
    icon: LayoutTemplate,
    description:
      "Shape the customer experience with full content, merchandising, and product control instead of managing isolated storefront fragments.",
    points: [
      "Manage categories, brands, product detail amount logic, and explore-more merchandising blocks.",
      "Update home headline, home header, product headline, home banners, and home mini banners from one workspace.",
      "Drive website modification workflows with reusable website sections and campaign-ready landing edits."
    ]
  },
  {
    title: "Orders, inventory, and warehouse orchestration",
    eyebrow: "Operations backbone",
    icon: Boxes,
    description:
      "Keep inventory movement, shipments, and handoffs synchronized so every order has financial and operational accountability.",
    points: [
      "Monitor warehouses, stock positions, shipment preparation, delivery status, and proof-of-handoff checkpoints.",
      "Separate online orders from inhouse products while preserving one unified reporting trail.",
      "Track confirmer workflows, label configuration, and dispatch readiness before drivers leave the warehouse."
    ]
  },
  {
    title: "Finance, earnings, and profit visibility",
    eyebrow: "Revenue intelligence",
    icon: Wallet,
    description:
      "Translate commerce activity into clean financial visibility for every stakeholder in the operating model.",
    points: [
      "Review total amount, office amount, manager salary, profit and loss, and campaign-attributed revenue in one financial surface.",
      "Break out agent history, agent amounts, dropshipper earnings, investor earnings, and driver settlement without spreadsheet sprawl.",
      "Control coupons, cashback offers, expense management, and reference-driven payouts with audit-friendly clarity."
    ]
  }
] as const;

const reportingCards = [
  {
    title: "Orders & fulfillment",
    icon: ShoppingCart,
    items: ["Orders", "Online orders", "Shipments", "Warehouses", "Confirmers", "Driver tracking"]
  },
  {
    title: "Products & merchandising",
    icon: Package,
    items: ["Categories", "Brands", "Inhouse products", "Product detail amount", "Banners", "Explore more"]
  },
  {
    title: "Finance & growth",
    icon: BadgeDollarSign,
    items: ["Daily reports", "Profit & loss", "Campaigns", "Manager finances", "Investor earnings", "Business reports"]
  },
  {
    title: "Administration",
    icon: ClipboardList,
    items: ["Website modification", "Label settings", "Social links", "References", "Expense control", "Role permissions"]
  }
] as const;

const deliveryFlow = [
  "Create storefront structure, pricing logic, and role permissions.",
  "Launch products, content blocks, offers, and campaign-ready pages.",
  "Route orders into warehouses, confirmations, shipments, and delivery operations.",
  "Track office totals, stakeholder earnings, and report outputs with executive visibility."
] as const;

export function MagneticCommerceServicePage({ service, title }: { service: CatalogService; title: string }) {
  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_35%),linear-gradient(180deg,#ffffff,#f8fafc)] py-16 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,#020617,#0f172a)] sm:py-20">
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
                <p className="max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                  {service.tagline}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {service.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-[1.25rem] border border-slate-200/70 bg-slate-50/90 px-4 py-4 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
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
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="rounded-[2rem] border border-slate-200/70 bg-slate-950 p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/5 sm:p-10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">Platform coverage</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">Everything needed to run commerce operations end to end.</h2>
                </div>
                <Building2 className="h-10 w-10 text-cyan-200" />
              </div>
              <div className="mt-8 space-y-4">
                {deliveryFlow.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-cyan-100">
                      0{index + 1}
                    </div>
                    <p className="text-sm leading-7 text-slate-200">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-slate-300">Operational outputs</div>
                  <div className="mt-2 text-2xl font-semibold">Roles, orders, finance, and web control</div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-slate-300">Demo environment</div>
                  <div className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold">
                    commerce.magnetic-ict.com
                    <ArrowRight className="h-5 w-5" />
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
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Role architecture</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Organize every commerce stakeholder inside one operating model.
              </h2>
              <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
                Magnetic Commerce is structured for multi-role execution so leadership, field operations, partners, and customers all work from the same source of truth.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {roleCards.map((card, index) => (
              <ScrollReveal key={card.title} delay={index * 0.06}>
                <div className="h-full rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{card.title}</h3>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {card.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
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
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Core workspaces</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Build the commerce dashboard around the exact workflows you listed.
              </h2>
              <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
                The landing experience is organized to reflect the real operating surfaces of a complete commerce management system, from storefront editing to warehouse delivery and profit visibility.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {workspaceSections.map((section, index) => (
              <ScrollReveal key={section.title} delay={index * 0.06}>
                <div className="h-full rounded-[1.75rem] border border-slate-200/70 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/50 dark:shadow-none">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{section.eyebrow}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{section.title}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200">
                      <section.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{section.description}</p>
                  <div className="mt-6 space-y-3">
                    {section.points.map((point) => (
                      <div key={point} className="rounded-[1rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-7 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                        {point}
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
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Reporting and control</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  Keep each domain measurable, editable, and ready for scale.
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
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {reportingCards.map((card, index) => (
              <ScrollReveal key={card.title} delay={index * 0.05}>
                <div className="h-full rounded-[1.5rem] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{card.title}</h3>
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
