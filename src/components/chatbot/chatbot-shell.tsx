"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Bot,
  ChevronRight,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Plug,
  Users,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chatbot", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/chatbot/inbox", label: "Inbox", icon: Inbox, exact: false },
  { href: "/chatbot/contacts", label: "Contacts", icon: Users, exact: false },
  { href: "/chatbot/agents", label: "AI Agents", icon: Zap, exact: false },
  { href: "/chatbot/reports", label: "Reports", icon: BarChart3, exact: false },
  { href: "/chatbot/connect", label: "Connect", icon: Plug, exact: false }
];

type Props = {
  children: ReactNode;
  userName: string;
  userEmail: string;
  metaAppId: string;
  metaConfigId: string;
};

export function ChatbotShell({ children, userName, userEmail }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const pathname = usePathname();

  function handleSignOut() {
    startSignOut(() => { void signOut({ redirectTo: "/en" }); });
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-white/10 dark:bg-slate-900 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white">
              <MessageCircle className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-950 dark:text-white">Magnetic Chat</span>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-white/10">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-400/20 dark:text-violet-300">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-slate-950 dark:text-white">{userName}</div>
              <div className="truncate text-[10px] text-slate-500 dark:text-slate-400">{userEmail}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/5"
          >
            <LogOut className="h-3.5 w-3.5" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5 dark:border-white/10 dark:bg-slate-900 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-bold text-slate-950 dark:text-white">Magnetic Chat</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
