"use client";

import { type ReactNode, useMemo, useTransition } from "react";
import { Activity, Bot, ChevronRight, Globe, LayoutDashboard, LogOut, Receipt, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type CustomerDashboardShellProps = {
  children: ReactNode;
  locale: string;
  userName?: string | null;
  userEmail?: string | null;
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
  hasMagneticSocialBotAccess = false
}: CustomerDashboardShellProps) {
  const pathname = usePathname() ?? "";
  const [isSigningOut, startSignOutTransition] = useTransition();

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

    if (hasMagneticSocialBotAccess) {
      items.push({
        href: "/dashboard/magnetic-social-bot",
        label: "Social Bot",
        Icon: Bot,
        match: (value) => value.startsWith("/dashboard/magnetic-social-bot")
      });
    }

    return items;
  }, [hasMagneticSocialBotAccess]);

  const initials = useMemo(() => {
    const source = userName?.trim() || userEmail?.trim() || "M";
    return source.slice(0, 1).toUpperCase();
  }, [userEmail, userName]);

  function handleSignOut() {
    startSignOutTransition(() => {
      void signOut({ redirectTo: `/${locale}` });
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-28 xl:h-[calc(100vh-8rem)]">
          <div className="flex h-full flex-col gap-4 rounded-[32px] border border-slate-200/80 bg-white/88 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)] xl:p-5">
            <div className="flex items-center justify-between gap-3 rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-950 dark:text-white">{userName || "Customer workspace"}</div>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail || "Signed in"}</div>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <nav className="space-y-1 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
              {navItems.map(({ href, label, Icon, match }) => {
                const active = match(normalizedPath);

                return (
                  <Link
                    key={href}
                    href={href}
                    locale={locale}
                    className={cn(
                      "flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    )}
                  >
                    <span className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl",
                      active
                        ? "bg-white/10 text-white dark:bg-slate-950/10 dark:text-slate-950"
                        : "bg-white text-slate-700 dark:bg-white/[0.08] dark:text-slate-200"
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{label}</span>
                    <ChevronRight className={cn("h-4 w-4", active ? "text-white/70 dark:text-slate-950/60" : "text-slate-400 dark:text-slate-500")} />
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Quick actions</div>
              <div className="mt-3 space-y-2">
                <Link href="/domains" locale={locale} className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:text-slate-950 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:text-white">
                  <Search className="h-4 w-4" />
                  Search new domains
                </Link>
                <Link href="/dashboard" locale={locale} className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:text-slate-950 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:text-white">
                  <Activity className="h-4 w-4" />
                  Workspace overview
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-auto flex w-full items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
                <LogOut className="h-4 w-4" />
              </span>
              <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </aside>

        <section className="min-w-0 space-y-6">{children}</section>
      </div>
    </main>
  );
}
