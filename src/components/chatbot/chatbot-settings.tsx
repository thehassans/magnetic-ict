"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Globe,
  Key,
  Loader2,
  MessageSquare,
  Moon,
  Palette,
  Shield,
  Sliders,
  User,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

type Section = "profile" | "bot" | "notifications" | "appearance" | "security" | "api";

const SECTIONS: { key: Section; label: string; icon: typeof User; desc: string }[] = [
  { key: "profile", label: "Profile", icon: User, desc: "Name and account info" },
  { key: "bot", label: "Bot Behaviour", icon: Bot, desc: "AI defaults and routing" },
  { key: "notifications", label: "Notifications", icon: Bell, desc: "Alerts and digests" },
  { key: "appearance", label: "Appearance", icon: Palette, desc: "Theme and layout" },
  { key: "security", label: "Security", icon: Shield, desc: "Access and sessions" },
  { key: "api", label: "API & Webhooks", icon: Key, desc: "Keys and integrations" }
];

type Props = {
  userName: string;
  userEmail: string;
  botName: string;
  webhookUrl: string;
};

export function ChatbotSettings({ userName, userEmail, botName, webhookUrl }: Props) {
  const [section, setSection] = useState<Section>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({ displayName: userName, timezone: "UTC+3" });
  const [bot, setBot] = useState({
    name: botName || "Magnetic Assistant",
    greeting: "Hi! How can I help you today?",
    fallback: "I'm not sure about that. Let me connect you with a human agent.",
    autoAssign: true,
    aiFirst: true,
    responseDelay: "0"
  });
  const [notifs, setNotifs] = useState({
    newMessage: true,
    aiHandoff: true,
    weeklyReport: false,
    dailyDigest: true
  });
  const [appearance, setAppearance] = useState({ accentColor: "violet", compactMode: false });

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const inputCls = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-violet-500/50 focus:bg-white/[0.06] transition";
  const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/35";

  return (
    <div className="flex min-h-full">
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-white/[0.06] bg-[#0c0c1d] p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">Settings</p>
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = section === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setSection(s.key)}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-medium transition-all",
                active ? "bg-gradient-to-r from-violet-500/20 to-purple-600/5 text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-violet-400" />}
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-violet-400" : "")} />
              {s.label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-violet-400/60" />}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{SECTIONS.find((s) => s.key === section)?.label}</h1>
            <p className="mt-0.5 text-sm text-white/35">{SECTIONS.find((s) => s.key === section)?.desc}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Sliders className="h-4 w-4" />}
            {saved ? "Saved!" : saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        {/* Profile section */}
        {section === "profile" && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-white/80">Account Information</h2>
              </div>
              <div className="space-y-5 p-5">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/50 to-purple-700/40 text-2xl font-bold text-white ring-1 ring-white/10">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{userName}</p>
                    <p className="text-sm text-white/35">{userEmail}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      Social Bot — Active
                    </span>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Display Name</label>
                    <input value={profile.displayName} onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Timezone</label>
                    <select value={profile.timezone} onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))} className={`${inputCls} cursor-pointer`}>
                      {["UTC", "UTC+1", "UTC+2", "UTC+3", "UTC+4", "UTC+5", "UTC+5:30", "UTC+6", "UTC+7", "UTC+8", "UTC-5", "UTC-8"].map((tz) => (
                        <option key={tz} value={tz} className="bg-[#0e0e22]">{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input value={userEmail} readOnly className={`${inputCls} cursor-not-allowed opacity-50`} />
                  <p className="mt-1.5 text-[11px] text-white/25">Email address cannot be changed here. Contact support.</p>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-white/80">Workspace</h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {[
                  { label: "Chatbot Dashboard", href: "/chatbot", icon: MessageSquare },
                  { label: "Main Dashboard", href: "/en/dashboard", icon: Globe },
                  { label: "Connect Channels", href: "/chatbot/connect", icon: Zap }
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} className="flex items-center justify-between px-5 py-3.5 text-sm text-white/50 transition hover:bg-white/[0.02] hover:text-white/80">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-violet-400/60" />
                        {link.label}
                      </div>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Bot Behaviour */}
        {section === "bot" && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-white/80">AI Agent Defaults</h2>
              </div>
              <div className="space-y-5 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Bot Display Name</label>
                    <input value={bot.name} onChange={(e) => setBot((b) => ({ ...b, name: e.target.value }))} placeholder="Magnetic Assistant" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Response Delay (seconds)</label>
                    <select value={bot.responseDelay} onChange={(e) => setBot((b) => ({ ...b, responseDelay: e.target.value }))} className={`${inputCls} cursor-pointer`}>
                      {["0", "1", "2", "3", "5"].map((v) => <option key={v} value={v} className="bg-[#0e0e22]">{v === "0" ? "Instant" : `${v}s`}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Greeting Message</label>
                  <textarea value={bot.greeting} onChange={(e) => setBot((b) => ({ ...b, greeting: e.target.value }))} rows={2} className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className={labelCls}>Fallback Message</label>
                  <textarea value={bot.fallback} onChange={(e) => setBot((b) => ({ ...b, fallback: e.target.value }))} rows={2} className={`${inputCls} resize-none`} />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-white/80">Routing & Automation</h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {[
                  { key: "aiFirst" as const, label: "AI responds first", desc: "Let AI handle messages before routing to human agents" },
                  { key: "autoAssign" as const, label: "Auto-assign conversations", desc: "Automatically route new threads to available agents" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-white/80">{item.label}</p>
                      <p className="text-xs text-white/30">{item.desc}</p>
                    </div>
                    <button type="button" onClick={() => setBot((b) => ({ ...b, [item.key]: !b[item.key] }))}
                      className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors", bot[item.key] ? "bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.4)]" : "bg-white/10")}>
                      <span className={cn("mt-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", bot[item.key] ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {section === "notifications" && (
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <h2 className="text-sm font-semibold text-white/80">Notification Preferences</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[
                { key: "newMessage" as const, label: "New message", desc: "Notify when a new message arrives in your inbox" },
                { key: "aiHandoff" as const, label: "AI handoff", desc: "Alert when AI escalates a conversation to you" },
                { key: "dailyDigest" as const, label: "Daily digest", desc: "Summary of activity each morning" },
                { key: "weeklyReport" as const, label: "Weekly report", desc: "Full analytics report every Monday" }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-white/80">{item.label}</p>
                    <p className="text-xs text-white/30">{item.desc}</p>
                  </div>
                  <button type="button" onClick={() => setNotifs((n) => ({ ...n, [item.key]: !n[item.key] }))}
                    className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors", notifs[item.key] ? "bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.4)]" : "bg-white/10")}>
                    <span className={cn("mt-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", notifs[item.key] ? "translate-x-5" : "translate-x-0.5")} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appearance */}
        {section === "appearance" && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-white/80">Theme</h2>
              </div>
              <div className="space-y-5 p-5">
                <div>
                  <label className={labelCls}>Accent Colour</label>
                  <div className="mt-2 flex gap-3">
                    {[
                      { key: "violet", bg: "bg-violet-600", shadow: "shadow-[0_0_12px_rgba(124,58,237,0.6)]" },
                      { key: "blue", bg: "bg-blue-600", shadow: "shadow-[0_0_12px_rgba(37,99,235,0.6)]" },
                      { key: "emerald", bg: "bg-emerald-600", shadow: "shadow-[0_0_12px_rgba(5,150,105,0.6)]" },
                      { key: "rose", bg: "bg-rose-600", shadow: "shadow-[0_0_12px_rgba(225,29,72,0.6)]" },
                      { key: "amber", bg: "bg-amber-500", shadow: "shadow-[0_0_12px_rgba(245,158,11,0.6)]" }
                    ].map((c) => (
                      <button key={c.key} type="button" onClick={() => setAppearance((a) => ({ ...a, accentColor: c.key }))}
                        className={cn("h-8 w-8 rounded-full transition", c.bg, appearance.accentColor === c.key ? `${c.shadow} ring-2 ring-white/30 ring-offset-2 ring-offset-[#070710]` : "opacity-50 hover:opacity-80")} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Compact mode</p>
                    <p className="text-xs text-white/30">Reduce spacing for a denser layout</p>
                  </div>
                  <button type="button" onClick={() => setAppearance((a) => ({ ...a, compactMode: !a.compactMode }))}
                    className={cn("relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors", appearance.compactMode ? "bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.4)]" : "bg-white/10")}>
                    <span className={cn("mt-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform", appearance.compactMode ? "translate-x-5" : "translate-x-0.5")} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <Moon className="h-5 w-5 text-violet-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white/80">Dark mode is always on</p>
                <p className="text-xs text-white/30">The chatbot interface uses a permanent dark theme optimised for focus.</p>
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {section === "security" && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-white/80">Active Sessions</h2>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
                      <Shield className="h-4 w-4 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Current session</p>
                      <p className="text-xs text-white/30">Active now · {userEmail}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">Active</span>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-white/80">Access Control</h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {[
                  { label: "Two-factor authentication", value: "Not enabled", action: "Enable", cls: "text-amber-300" },
                  { label: "Password", value: "Last changed: Unknown", action: "Change", cls: "text-violet-300" }
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-white/80">{row.label}</p>
                      <p className="text-xs text-white/30">{row.value}</p>
                    </div>
                    <Link href="/en/dashboard" className={`text-xs font-semibold transition hover:opacity-80 ${row.cls}`}>{row.action} →</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API & Webhooks */}
        {section === "api" && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-white/80">Webhook Endpoint</h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className={labelCls}>Webhook URL</label>
                  <input value={webhookUrl || `https://magnetic-ict.com/api/social-bot/webhook`} readOnly className={`${inputCls} font-mono text-xs cursor-text`} onClick={(e) => (e.target as HTMLInputElement).select()} />
                  <p className="mt-1.5 text-[11px] text-white/25">This URL receives all incoming messages from Meta platforms.</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-xs font-semibold text-amber-300">Meta Webhook Setup</p>
                  <p className="mt-1 text-xs leading-5 text-amber-200/60">Configure this URL in your Meta App Dashboard under Webhooks. Subscribe to <code className="rounded bg-amber-500/10 px-1">messages</code>, <code className="rounded bg-amber-500/10 px-1">messaging_postbacks</code> events.</p>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold text-white/80">API Keys</h2>
              </div>
              <div className="p-5">
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <Key className="h-8 w-8 text-white/10" />
                  <p className="text-sm text-white/30">API key management is available in the admin panel.</p>
                  <Link href="/admin/dashboard" className="text-xs font-semibold text-violet-400 transition hover:text-violet-300">Open Admin Panel →</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
