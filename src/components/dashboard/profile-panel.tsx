"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Bot, CreditCard, ExternalLink, Globe, Layout, Receipt, Server, ShoppingCart, Sparkles, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ProfilePanelProps = {
  open: boolean;
  onClose: () => void;
  locale: string;
  userName?: string | null;
  userEmail?: string | null;
  initials: string;
  hasMagneticVpsAccess?: boolean;
  hasMagneticSocialBotAccess?: boolean;
  hasMagneticCommerceAccess?: boolean;
  hasPortfolioAccess?: boolean;
};

type ServiceBadge = {
  label: string;
  icon: typeof BadgeCheck;
  href: string;
  active: boolean;
  color: string;
};

export function ProfilePanel({
  open,
  onClose,
  locale,
  userName,
  userEmail,
  initials,
  hasMagneticVpsAccess = false,
  hasMagneticSocialBotAccess = false,
  hasMagneticCommerceAccess = false,
  hasPortfolioAccess = false
}: ProfilePanelProps) {
  const services: ServiceBadge[] = [
    { label: "VPS Hosting", icon: Server, href: "/dashboard/hosting", active: hasMagneticVpsAccess, color: "text-sky-500" },
    { label: "Social Bot", icon: Bot, href: "/dashboard/magnetic-social-bot", active: hasMagneticSocialBotAccess, color: "text-violet-500" },
    { label: "Commerce", icon: ShoppingCart, href: "/dashboard/magnetic-commerce", active: hasMagneticCommerceAccess, color: "text-emerald-500" },
    { label: "Portfolio Builder", icon: Layout, href: "/dashboard/portfolio", active: hasPortfolioAccess, color: "text-indigo-500" },
    { label: "Domains", icon: Globe, href: "/dashboard/domains", active: true, color: "text-blue-500" }
  ];

  const activeServices = services.filter((s) => s.active);
  const memberSince = new Date().getFullYear();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-3 top-3 bottom-3 z-50 flex w-[340px] flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-950"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Your profile</p>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-950 dark:border-white/10 dark:text-slate-500 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Membership card */}
              <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.25)]">
                {/* Glow orbs */}
                <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-violet-300">Magnetic ICT</div>
                    <Sparkles className="h-4 w-4 text-violet-300/60" />
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-lg font-bold text-white shadow-[0_8px_24px_rgba(124,58,237,0.35)]">
                      {initials}
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{userName || "Member"}</p>
                      <p className="text-xs text-slate-400">{userEmail}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Member since</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{memberSince}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Active services</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{activeServices.length}</p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <BadgeCheck className="h-5 w-5 text-violet-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active memberships */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500">
                  Memberships
                </p>
                <div className="space-y-1.5">
                  {activeServices.map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      locale={locale}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-[14px] border border-slate-100 bg-white/80 px-3.5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                    >
                      <s.icon className={cn("h-4 w-4", s.color)} />
                      <span className="flex-1">{s.label}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Active</span>
                    </Link>
                  ))}
                  {activeServices.length === 0 && (
                    <p className="rounded-[14px] border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400 dark:border-white/10">
                      No active services yet.{" "}
                      <Link href="/services" locale={locale} className="underline" onClick={onClose}>Browse services</Link>
                    </p>
                  )}
                </div>
              </div>

              {/* Quick links */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500">
                  Account
                </p>
                <div className="space-y-1.5">
                  <Link
                    href="/dashboard/orders"
                    locale={locale}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-[14px] border border-slate-100 bg-white/80 px-3.5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                  >
                    <Receipt className="h-4 w-4 text-slate-500" />
                    <span className="flex-1">Orders & Invoices</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                  </Link>
                  <Link
                    href="/services"
                    locale={locale}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-[14px] border border-slate-100 bg-white/80 px-3.5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
                  >
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    <span className="flex-1">Browse & upgrade</span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
