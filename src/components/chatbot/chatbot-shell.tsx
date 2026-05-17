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
  ChevronDown,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Mic,
  MessageSquare,
  MessageSquarePlus,
  Moon,
  Plug,
  Settings,
  Sparkles,
  Sun,
  TestTube2,
  Users,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotSubscriptionInfo } from "@/lib/social-bot-access";

type NavItem = { href: string; label: string; icon: React.ElementType; exact?: boolean };
type NavGroup = { id?: string; label?: string; icon?: React.ElementType; collapsible?: boolean; items: NavItem[] };

const navGroups: NavGroup[] = [
  { items: [{ href: "/chatbot", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    id: "inbox", label: "Inbox", icon: MessageSquare, collapsible: true,
    items: [
      { href: "/chatbot/inbox", label: "Inbox", icon: Inbox },
      { href: "/chatbot/connect", label: "Connect", icon: Plug }
    ]
  },
  {
    id: "agents", label: "Agents", icon: Bot, collapsible: true,
    items: [
      { href: "/chatbot/agents", label: "AI Agents", icon: Zap },
      { href: "/chatbot/voice", label: "Voice Agents", icon: Mic }
    ]
  },
  {
    id: "training", label: "Training", icon: BookOpen, collapsible: true,
    items: [
      { href: "/chatbot/knowledge", label: "Knowledge", icon: BookOpen },
      { href: "/chatbot/test", label: "Test Bot", icon: TestTube2 },
      { href: "/chatbot/ask", label: "Ask Magnetic", icon: BrainCircuit }
    ]
  },
  {
    id: "shortcuts", label: "Shortcuts", icon: Sparkles, collapsible: true,
    items: [
      { href: "/chatbot/contacts", label: "Contacts", icon: Users },
      { href: "/chatbot/broadcast", label: "Broadcast", icon: Megaphone },
      { href: "/chatbot/quick-replies", label: "Quick Replies", icon: MessageSquarePlus }
    ]
  },
  {
    items: [
      { href: "/chatbot/reports", label: "Reports", icon: BarChart3 }
    ]
  }
];

type Props = {
  children: ReactNode;
  userName: string;
  userEmail: string;
  logoLight?: string;
  logoDark?: string;
  subscription: SocialBotSubscriptionInfo;
};

export function ChatbotShell({ children, userName, userEmail, logoLight, logoDark, subscription }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(["inbox", "agents", "training", "shortcuts"]));

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
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://magnetic-ict.com").replace(/\/$/, "");
    startSignOut(() => { void signOut({ redirectTo: `${appUrl}/en` }); });
  }

  function toggleGroup(id: string) {
    setOpenGroups((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  const initial = userName.charAt(0).toUpperCase();
  const settingsActive = pathname.startsWith("/chatbot/settings");
  const isDark = theme === "dark";
  const logoSrc = isDark ? (logoDark || logoLight || null) : (logoLight || logoDark || null);

  function NavLink({ item, indent }: { item: NavItem; indent?: boolean }) {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-[10px] py-2 text-[13px] font-medium transition-all duration-150",
          indent ? "pl-7 pr-3" : "px-3",
          active
            ? "bg-violet-50 dark:bg-gradient-to-r dark:from-violet-500/[0.18] dark:to-violet-500/[0.03] text-violet-700 dark:text-white"
            : "text-gray-500 dark:text-white/40 hover:bg-gray-100/80 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white/70"
        )}
      >
        {active && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-500 dark:bg-violet-400" />}
        <Icon className={cn("h-3.5 w-3.5 shrink-0 transition", active ? "text-violet-600 dark:text-violet-400" : "opacity-50 group-hover:opacity-80")} />
        <span className="truncate">{item.label}</span>
        {active && <span className="ml-auto h-1 w-1 rounded-full bg-violet-500 dark:bg-violet-400 shrink-0" />}
      </Link>
    );
  }

  return (
    <div className={cn("flex h-screen overflow-hidden", isDark ? "dark bg-[#070710]" : "bg-gray-100")}>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col border-r border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0d1f] transition-transform duration-300 lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {isDark && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="absolute bottom-24 right-0 h-32 w-32 rounded-full bg-indigo-600/8 blur-3xl" />
          </div>
        )}

        {/* Logo */}
        <div className="relative flex h-[60px] shrink-0 items-center justify-between px-4">
          {logoSrc ? (
            <div className="flex h-9 w-full max-w-[152px] items-center">
              <Image src={logoSrc} alt="Logo" width={152} height={36} className="h-auto w-full object-contain" priority unoptimized={logoSrc.startsWith("/uploads/") || logoSrc.toLowerCase().endsWith(".svg")} />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 to-purple-600 shadow-[0_4px_12px_rgba(139,92,246,0.4)]">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="text-[14px] font-bold tracking-tight text-gray-900 dark:text-white">Magnetic <span className="text-violet-600 dark:text-violet-400">Chat</span></span>
            </div>
          )}
          <div className="flex items-center gap-0.5">
            <button type="button" onClick={toggleTheme} title={isDark ? "Light mode" : "Dark mode"} className="rounded-lg p-1.5 text-gray-400 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-white/70 transition">
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 lg:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-white/8 to-transparent" />

        {/* Nav */}
        <nav className="relative flex-1 overflow-y-auto px-2.5 py-2.5 space-y-px">
          {navGroups.map((group, gi) => {
            if (group.collapsible && group.id) {
              const GroupIcon = group.icon ?? Bot;
              const isOpen = openGroups.has(group.id);
              const hasActive = group.items.some((item) => pathname.startsWith(item.href));
              return (
                <div key={group.id} className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id!)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[10px] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-150",
                      hasActive ? "text-violet-600 dark:text-violet-400" : "text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/45"
                    )}
                  >
                    <GroupIcon className="h-3 w-3 shrink-0" />
                    {group.label}
                    <ChevronDown className={cn("ml-auto h-3 w-3 shrink-0 transition-transform duration-200", isOpen ? "rotate-0" : "-rotate-90")} />
                  </button>
                  <div className={cn("overflow-hidden transition-all duration-200", isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}>
                    <div className="space-y-px pb-0.5 pl-2">
                      {group.items.map((item) => <NavLink key={item.href} item={item} indent />)}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div key={gi} className={cn("space-y-px", gi > 0 ? "pt-1" : "")}>
                {group.items.map((item) => <NavLink key={item.href} item={item} />)}
              </div>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="mx-2.5 mb-1 space-y-px">
          <div className="mx-1 mb-1 h-px bg-gray-200 dark:bg-white/[0.05]" />
          <Link
            href="/chatbot/settings"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "relative flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-all",
              settingsActive ? "bg-violet-50 dark:bg-violet-500/[0.15] text-violet-700 dark:text-white" : "text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white/70"
            )}
          >
            {settingsActive && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-violet-500 dark:bg-violet-400" />}
            <Settings className={cn("h-3.5 w-3.5 shrink-0", settingsActive ? "text-violet-600 dark:text-violet-400" : "opacity-50")} />
            Settings
          </Link>
        </div>

        {/* User card */}
        <div className="relative mx-3 mb-4 rounded-[14px] border border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.03] p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/60 to-purple-700/50 text-[13px] font-bold text-white ring-1 ring-gray-200 dark:ring-white/10">
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
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium text-gray-400 dark:text-white/30 transition hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-600 dark:hover:text-white/60 disabled:opacity-40"
          >
            <LogOut className="h-3 w-3" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0d1f] px-4 lg:hidden">
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
