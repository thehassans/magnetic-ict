"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  MessageSquarePlus,
  Moon,
  Plug,
  Settings,
  Sun,
  Users,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chatbot", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/chatbot/inbox", label: "Inbox", icon: Inbox, exact: false },
  { href: "/chatbot/contacts", label: "Contacts", icon: Users, exact: false },
  { href: "/chatbot/broadcast", label: "Broadcast", icon: Megaphone, exact: false },
  { href: "/chatbot/agents", label: "AI Agents", icon: Zap, exact: false },
  { href: "/chatbot/knowledge", label: "Knowledge", icon: BookOpen, exact: false },
  { href: "/chatbot/ask", label: "Ask Magnetic", icon: BrainCircuit, exact: false },
  { href: "/chatbot/quick-replies", label: "Quick Replies", icon: MessageSquarePlus, exact: false },
  { href: "/chatbot/reports", label: "Reports", icon: BarChart3, exact: false },
  { href: "/chatbot/connect", label: "Connect", icon: Plug, exact: false }
];

type Props = {
  children: ReactNode;
  userName: string;
  userEmail: string;
  metaAppId: string;
  metaConfigId: string;
  logoLight?: string;
  logoDark?: string;
};

export function ChatbotShell({ children, userName, userEmail, logoLight, logoDark }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("chatbot-theme");
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch { /* noop */ }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem("chatbot-theme", next); } catch { /* noop */ }
  }

  function handleSignOut() {
    startSignOut(() => { void signOut({ redirectTo: "/en" }); });
  }

  const initial = userName.charAt(0).toUpperCase();
  const settingsActive = pathname.startsWith("/chatbot/settings");
  const isDark = theme === "dark";

  const logoSrc = isDark ? (logoDark || logoLight || null) : (logoLight || logoDark || null);

  return (
    <div className={cn("flex h-screen overflow-hidden bg-gray-100 dark:bg-[#070710]", isDark && "dark")}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1d] transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {isDark && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-violet-700/15 blur-3xl" />
            <div className="absolute bottom-20 right-0 h-40 w-40 rounded-full bg-indigo-700/10 blur-3xl" />
          </div>
        )}

        <div className="relative flex h-[60px] shrink-0 items-center justify-between px-4">
          {logoSrc ? (
            <div className="flex h-9 w-full max-w-[148px] items-center">
              <Image src={logoSrc} alt="Logo" width={148} height={36} className="h-auto w-full object-contain" priority unoptimized={logoSrc.startsWith("/uploads/") || logoSrc.toLowerCase().endsWith(".svg")} />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-600/40">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">Magnetic <span className="text-violet-600 dark:text-violet-400">Chat</span></span>
            </div>
          )}
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-gray-400 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mx-4 mb-2 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />

        <nav className="relative flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-violet-50 dark:bg-gradient-to-r dark:from-violet-500/20 dark:to-purple-600/5 text-violet-700 dark:text-white"
                    : "text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white/70"
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-violet-500 dark:bg-violet-400" />}
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-violet-600 dark:text-violet-400" : "")} />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="relative mx-2.5 mb-1">
          <div className="mx-1 mb-1.5 h-px bg-gray-200 dark:bg-white/[0.05]" />
          <Link
            href="/chatbot/settings"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
              settingsActive
                ? "bg-violet-50 dark:bg-gradient-to-r dark:from-violet-500/20 dark:to-purple-600/5 text-violet-700 dark:text-white"
                : "text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white/70"
            )}
          >
            {settingsActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-violet-500 dark:bg-violet-400" />}
            <Settings className={cn("h-4 w-4 shrink-0", settingsActive ? "text-violet-600 dark:text-violet-400" : "")} />
            Settings
            {settingsActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-[13px] font-medium text-gray-500 dark:text-white/40 transition hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white/70"
          >
            {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>

        <div className="relative mx-3 mb-4 rounded-[14px] border border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.03] p-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/50 to-purple-700/40 text-sm font-bold text-white ring-1 ring-gray-200 dark:ring-white/10">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-gray-800 dark:text-white/90">{userName}</p>
              <p className="truncate text-[10px] text-gray-400 dark:text-white/35">{userEmail}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-[11px] font-medium text-gray-400 dark:text-white/35 transition hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/60 disabled:opacity-40"
          >
            <LogOut className="h-3 w-3" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1d] px-4 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white">
            <Menu className="h-5 w-5" />
          </button>
          {logoSrc ? (
            <div className="flex h-8 items-center">
              <Image src={logoSrc} alt="Logo" width={120} height={32} className="h-auto w-auto max-h-8 object-contain" unoptimized={logoSrc.startsWith("/uploads/") || logoSrc.toLowerCase().endsWith(".svg")} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">Magnetic Chat</span>
            </div>
          )}
          <button type="button" onClick={toggleTheme} className="ml-auto rounded-lg p-1.5 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#070710]">
          {children}
        </main>
      </div>
    </div>
  );
}
