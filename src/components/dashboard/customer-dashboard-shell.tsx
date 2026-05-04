"use client";

import { type ReactNode, useMemo, useState, useTransition } from "react";
import { Bot, ChevronRight, Globe, LayoutDashboard, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Receipt, Server, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/branding/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type CustomerDashboardShellProps = {
  children: ReactNode;
  locale: string;
  userName?: string | null;
  userEmail?: string | null;
  hasMagneticVpsAccess?: boolean;
  hasMagneticSocialBotAccess?: boolean;
};

type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  match: (pathname: string) => boolean;
};

export function CustomerDashboardShell({
  children,
  locale,
  userName,
  userEmail,
  hasMagneticVpsAccess = false,
  hasMagneticSocialBotAccess = false
}: CustomerDashboardShellProps) {
  const pathname = usePathname() ?? "";
  const [isSigningOut, startSignOutTransition] = useTransition();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const normalizedPath = useMemo(() => {
    const localePrefix = `/${locale}`;
    return pathname.startsWith(localePrefix) ? pathname.slice(localePrefix.length) || "/" : pathname;
  }, [locale, pathname]);

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      {
        href: "/dashboard",
        label: "Overview",
        Icon: LayoutDashboard,
        match: (value) => value === "/dashboard"
      },
      {
        href: "/dashboard/orders",
        label: "Orders",
        Icon: Receipt,
        match: (value) => value.startsWith("/dashboard/orders")
      },
      {
        href: "/dashboard/domains",
        label: "Domains",
        Icon: Globe,
        match: (value) => value.startsWith("/dashboard/domains")
      }
    ];

    if (hasMagneticVpsAccess) {
      items.push({
        href: "/dashboard/hosting",
        label: "Hosting",
        Icon: Server,
        match: (value) => value.startsWith("/dashboard/hosting")
      });
    }

    if (hasMagneticSocialBotAccess) {
      items.push({
        href: "/dashboard/magnetic-social-bot",
        label: "Social Bot",
        Icon: Bot,
        match: (value) => value.startsWith("/dashboard/magnetic-social-bot")
      });
    }

    return items;
  }, [hasMagneticSocialBotAccess, hasMagneticVpsAccess]);

  const initials = useMemo(() => {
    const source = userName?.trim() || userEmail?.trim() || "M";
    return source.slice(0, 1).toUpperCase();
  }, [userEmail, userName]);

  const currentNavLabel = useMemo(() => {
    return navItems.find((item) => item.match(normalizedPath))?.label ?? "Workspace";
  }, [navItems, normalizedPath]);

  function handleSignOut() {
    startSignOutTransition(() => {
      void signOut({ redirectTo: `/${locale}` });
    });
  }

  const sidebarContent = (
    <div className="flex h-full flex-col rounded-[30px] border border-slate-200/70 bg-white/88 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/82 dark:shadow-[0_18px_50px_rgba(2,6,23,0.32)]">
      <div className="flex items-center justify-between gap-3 px-1 pb-4">
        <Link href="/dashboard" locale={locale} className="inline-flex items-center">
          <BrandLogo className="w-[128px] sm:w-[144px]" priority />
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] xl:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-1 space-y-1 border-t border-slate-200/70 pt-4 dark:border-white/10">
        {navItems.map(({ href, label, Icon, match }) => {
          const active = match(normalizedPath);

          return (
            <Link
              key={href}
              href={href}
              locale={locale}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-medium transition",
                active
                  ? "bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.12)] dark:bg-white dark:text-slate-950"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.04] dark:hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-2xl",
                  active
                    ? "bg-white/10 text-white dark:bg-slate-950/10 dark:text-slate-950"
                    : "bg-white text-slate-700 dark:bg-white/[0.08] dark:text-slate-200"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">{label}</span>
              <ChevronRight className={cn("h-4 w-4", active ? "text-white/70 dark:text-slate-950/60" : "text-slate-400 dark:text-slate-500")} />
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="mt-auto flex w-full items-center gap-3 rounded-[18px] border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
          <LogOut className="h-4 w-4" />
        </span>
        <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
      </button>
    </div>
  );

  return (
    <main className="mx-auto max-w-[1680px] px-3 py-3 sm:px-4 lg:px-6 lg:py-4">
      <div className="relative grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        {isMobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-30 bg-slate-950/28 backdrop-blur-[2px] xl:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        ) : null}

        <div className={cn("hidden shrink-0 overflow-hidden transition-[width] duration-300 xl:block", isSidebarOpen ? "w-[260px]" : "w-0")}>
          <aside className={cn("sticky top-4 h-[calc(100vh-2rem)] transition duration-300", isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0")}>
            {sidebarContent}
          </aside>
        </div>

        <aside className={cn("fixed bottom-3 left-3 top-3 z-40 w-[286px] max-w-[calc(100vw-1.5rem)] transition-transform duration-300 xl:hidden", isMobileSidebarOpen ? "translate-x-0" : "-translate-x-[115%]")}>
          {sidebarContent}
        </aside>

        <div className="min-w-0">
          <header className="mb-4 flex items-center justify-between gap-4 px-1 py-1 sm:px-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] xl:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsSidebarOpen((current) => !current)}
                className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] xl:inline-flex"
                aria-label={isSidebarOpen ? "Collapse navigation" : "Expand navigation"}
              >
                {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </button>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Workspace</div>
                <div className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{currentNavLabel}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden min-w-0 text-right md:block">
                <div className="truncate text-sm font-medium text-slate-950 dark:text-white">{userName || "Customer workspace"}</div>
                <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">{userEmail || "Signed in"}</div>
              </div>
              <ThemeToggle className="justify-end" />
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                {initials}
              </div>
            </div>
          </header>

          <section className="min-w-0 rounded-[30px] border border-slate-200/70 bg-white/72 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/48 dark:shadow-[0_12px_32px_rgba(2,6,23,0.22)] sm:p-5 lg:p-6">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
