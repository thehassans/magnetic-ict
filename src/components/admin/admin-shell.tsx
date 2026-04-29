import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, Bot, Box, LogOut, Settings2, ShoppingCart, Users } from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { BrandLogo } from "@/components/branding/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type AdminShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  activePath: "/admin/dashboard" | "/admin/orders" | "/admin/services" | "/admin/users" | "/admin/social-bot" | "/admin/settings";
  children: ReactNode;
  actions?: ReactNode;
};

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: Activity },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/services", label: "Services", Icon: Box },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/social-bot", label: "Social Bot", Icon: Bot },
  { href: "/admin/settings", label: "Settings", Icon: Settings2 }
] as const;

export function AdminShell({ title, description, eyebrow = "Operations cockpit", activePath, children, actions }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="grid min-h-screen xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200/80 bg-white/90 px-4 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_24px_80px_rgba(2,6,23,0.55)] xl:sticky xl:top-0 xl:h-screen xl:px-5 xl:py-8">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 rounded-[28px] border border-slate-200/80 bg-white/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <Link href="/admin/dashboard" className="rounded-[20px] transition hover:opacity-90">
                <BrandLogo className="w-[138px]" framed priority />
              </Link>
              <ThemeToggle />
            </div>

            <nav className="mt-6 flex-1 rounded-[30px] border border-slate-200/80 bg-white/80 p-3 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <div className="space-y-1">
              {navItems.map(({ href, label, Icon }) => {
                const active = href === activePath;

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)] dark:bg-white dark:text-slate-950"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    }`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? "bg-white/10 text-white dark:bg-slate-950/10 dark:text-slate-950" : "bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200"}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{label}</span>
                  </Link>
                );
              })}
              </div>
            </nav>

            <form action={logoutAdmin} className="mt-4">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm dark:bg-white/[0.08] dark:text-slate-200 dark:shadow-none">
                  <LogOut className="h-4 w-4" />
                </span>
                <span>Logout</span>
              </button>
            </form>
          </div>
        </aside>

        <section className="space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="rounded-[36px] border border-slate-200/80 bg-white/88 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/72 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">{eyebrow}</div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              </div>
              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}
