import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, Box, Settings2, ShoppingCart, Users } from "lucide-react";

type AdminShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  activePath: "/admin/dashboard" | "/admin/orders" | "/admin/services" | "/admin/users" | "/admin/settings";
  children: ReactNode;
  actions?: ReactNode;
};

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: Activity },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/services", label: "Services", Icon: Box },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/settings", label: "Settings", Icon: Settings2 }
] as const;

export function AdminShell({ title, description, eyebrow = "Operations cockpit", activePath, children, actions }: AdminShellProps) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-16 lg:py-10">
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">Magnetic ICT</div>
            <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Admin workspace</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Revenue, service operations, user management, and platform controls in one premium command layer.
            </p>
          </div>

          <nav className="rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
            <div className="space-y-1">
              {navItems.map(({ href, label, Icon }) => {
                const active = href === activePath;

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-slate-950 text-white shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">{eyebrow}</div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
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
