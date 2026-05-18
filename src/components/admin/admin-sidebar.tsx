"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity, BarChart3, Bot, Box, Bug, ChevronLeft,
  Globe, LifeBuoy, LogOut, Mail, Menu, Server,
  Settings2, ShoppingBag, ShoppingCart, Users
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Activity },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/services", label: "Services", icon: Box },
  { href: "/admin/domains", label: "Domains", icon: Globe },
  { href: "/admin/hosting", label: "Hosting", icon: Server },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/email-logs", label: "Email Logs", icon: Mail },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/social-bot", label: "Social Bot", icon: Bot },
  { href: "/admin/magnetic-commerce", label: "Commerce", icon: ShoppingBag },
  { href: "/admin/observability", label: "Observability", icon: Bug },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];

type Props = {
  logoLight?: string;
  logoDark?: string;
};

const STORAGE_KEY = "admin_sidebar_collapsed";

export function AdminSidebar({ logoLight, logoDark }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  if (!mounted) return null;

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen flex flex-col border-r border-white/[0.06] bg-[#0a0a12]/95 backdrop-blur-xl transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Top: Logo + Toggle */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-white/[0.05]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 pl-1 overflow-hidden">
            {logoLight ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoLight} alt="Logo" className="h-7 w-auto object-contain dark:hidden" />
            ) : null}
            {logoDark ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoDark} alt="Logo" className="h-7 w-auto object-contain hidden dark:block" />
            ) : null}
            {!logoLight && !logoDark && (
              <span className="text-[13px] font-black tracking-tight text-white">
                Magnetic<span className="text-violet-400">ICT</span>
              </span>
            )}
          </div>
        )}
        <button
          onClick={toggle}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white/40 hover:bg-white/[0.06] hover:text-white transition",
            collapsed && "mx-auto"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <Menu className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />
          }
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-150 relative",
                active
                  ? "bg-violet-600/15 text-violet-300"
                  : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-violet-500" />
              )}
              <span className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition",
                active
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-white/35 group-hover:text-white/60"
              )}>
                <Icon className="h-[15px] w-[15px]" />
              </span>
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-white/[0.05]">
        <button
          onClick={() => void signOut({ callbackUrl: "/admin" })}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium text-white/35 hover:bg-white/[0.04] hover:text-rose-400 transition group"
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/30 group-hover:text-rose-400 transition">
            <LogOut className="h-[15px] w-[15px]" />
          </span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
