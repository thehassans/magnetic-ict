"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Check, CheckCheck, ChevronDown, Clock, FileText, Loader2, Mic, RefreshCw, Search, Send, Smile, StopCircle, Trash2, UserCheck, Users, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotAgent, SocialBotMessage, SocialBotThread } from "@/lib/social-bot-types";
import { WhatsAppIcon, InstagramIcon, MessengerIcon } from "@/components/chatbot/social-icons";

type ThreadPayload = { thread: SocialBotThread | null; messages: SocialBotMessage[] };
type Filter = "ALL" | "AI" | "MANUAL" | "UNASSIGNED";

const platformConfig = {
  WHATSAPP: { Icon: WhatsAppIcon, color: "#25D366", bg: "bg-[#25D366]/15", text: "text-[#25D366]", label: "WhatsApp" },
  INSTAGRAM: { Icon: InstagramIcon, color: "#E1306C", bg: "bg-[#E1306C]/15", text: "text-[#E1306C]", label: "Instagram" },
  MESSENGER: { Icon: MessengerIcon, color: "#0099FF", bg: "bg-[#0099FF]/15", text: "text-[#0099FF]", label: "Messenger" }
} as const;

function PlatformBadge({ source, size = "sm" }: { source: keyof typeof platformConfig; size?: "sm" | "xs" }) {
  const { Icon, bg, text, label } = platformConfig[source];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md font-semibold", bg, text,
      size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-1 py-0.5 text-[9px]")}>
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-2 w-2"} />
      {size === "sm" && label}
    </span>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 24) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffH < 48) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/* ─── Agent panel ─────────────────────────────────────────────────── */
function AgentPanel({
  agents,
  thread,
  onAssign,
  onAutoAssign,
  assigning
}: {
  agents: SocialBotAgent[];
  thread: SocialBotThread;
  onAssign: (agentId: string | null) => void;
  onAutoAssign: () => void;
  assigning: boolean;
}) {
  const [open, setOpen] = useState(false);
  const assigned = agents.find((a) => a._id === thread.assignedAgentId);

  return (
    <div className="w-[230px] shrink-0 border-l border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-[#0a0a1c] flex flex-col">
      <div className="border-b border-gray-200 dark:border-white/[0.06] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-400 dark:text-white/30">Assignment</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Assigned agent card */}
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-3.5">
          {assigned ? (
            <div className="flex items-start gap-2.5">
              {assigned.avatarDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assigned.avatarDataUrl} alt={assigned.name} className="h-9 w-9 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-white/10" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/30 to-purple-600/20 text-xs font-bold text-violet-600 dark:text-violet-300">
                  {assigned.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">{assigned.name}</p>
                {assigned.description && <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-white/35">{assigned.description}</p>}
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400/70">Active</span>
                </div>
                {assigned.documentIds.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/25">
                    <FileText className="h-2.5 w-2.5" />
                    {assigned.documentIds.length} doc{assigned.documentIds.length !== 1 ? "s" : ""} trained
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-gray-200 dark:border-white/[0.1]">
                <UserCheck className="h-4 w-4 text-gray-300 dark:text-white/20" />
              </div>
              <p className="text-center text-[11px] text-gray-400 dark:text-white/25">No agent assigned</p>
            </div>
          )}
        </div>

        {/* Agent selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] px-3 py-2.5 text-[13px] text-gray-600 dark:text-white/60 transition hover:border-violet-400 dark:hover:border-violet-500/30 hover:text-gray-800 dark:hover:text-white/80"
          >
            <span className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400/60" />
              {assigned ? assigned.name : "Assign agent…"}
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform text-gray-400 dark:text-white/30", open && "rotate-180")} />
          </button>
          {open && (
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#0f0f24] shadow-lg dark:shadow-2xl">
              <button
                type="button"
                onClick={() => { onAssign(null); setOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] text-gray-400 dark:text-white/40 transition hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-700 dark:hover:text-white/70"
              >
                <X className="h-3.5 w-3.5" />Unassign
              </button>
              {agents.filter((a) => a.isActive).map((a) => (
                <button
                  key={a._id}
                  type="button"
                  onClick={() => { onAssign(a._id); setOpen(false); }}
                  className={cn("flex w-full items-center gap-2.5 px-3 py-2.5 text-[13px] transition hover:bg-violet-50 dark:hover:bg-violet-500/10",
                    a._id === thread.assignedAgentId ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300" : "text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white")}
                >
                  {a.avatarDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.avatarDataUrl} alt={a.name} className="h-6 w-6 rounded-md object-cover" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/20 text-[10px] font-bold text-violet-300">
                      {a.name.charAt(0)}
                    </div>
                  )}
                  <span className="flex-1 truncate">{a.name}</span>
                  {a._id === thread.assignedAgentId && <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                </button>
              ))}
              {agents.filter((a) => a.isActive).length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-gray-400 dark:text-white/25">No active agents</p>
              )}
            </div>
          )}
        </div>

        {/* Auto-assign toggle */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] px-3.5 py-3">
          <div>
            <p className="text-[12px] font-semibold text-gray-700 dark:text-white/70">Auto-assign</p>
            <p className="mt-0.5 text-[10px] text-gray-400 dark:text-white/30">Match best agent by channel</p>
          </div>
          <button
            type="button"
            onClick={onAutoAssign}
            disabled={assigning}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50",
              thread.autoAssign ? "bg-violet-600 shadow-[0_0_8px_rgba(124,58,237,0.4)]" : "bg-gray-200 dark:bg-white/10"
            )}
          >
            {assigning ? (
              <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-white" />
            ) : (
              <span className={cn("mt-0.5 inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                thread.autoAssign ? "translate-x-4" : "translate-x-0.5")} />
            )}
          </button>
        </div>

        {/* Platform info */}
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] px-3.5 py-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-400 dark:text-white/30">Channel</p>
          <PlatformBadge source={thread.source} size="sm" />
          <p className="text-[11px] text-gray-500 dark:text-white/30">{thread.contactHandle}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Emoji picker ───────────────────────────────────────── */
const EMOJI_CATS = [
  { icon: "\uD83D\uDE00", emojis: ["\uD83D\uDE00","\uD83D\uDE02","\uD83E\uDD79","\uD83D\uDE0A","\uD83D\uDE0D","\uD83D\uDE0E","\uD83E\uDD70","\uD83D\uDE0F","\uD83D\uDE12","\uD83D\uDE2D","\uD83D\uDE21","\uD83E\uDD14","\uD83E\uDD29","\uD83D\uDE34","\uD83D\uDE08","\uD83E\uDD17","\uD83D\uDE44","\uD83D\uDE2C","\uD83D\uDE31","\uD83E\uDD73","\uD83D\uDE14","\uD83E\uDD11","\uD83E\uDEE1","\uD83E\uDEE2","\uD83E\uDD2B"] },
  { icon: "\uD83D\uDC4B", emojis: ["\uD83D\uDC4B","\uD83E\uDD1D","\uD83D\uDC4D","\uD83D\uDC4E","\u2764\uFE0F","\uD83D\uDE4F","\uD83D\uDCAA","\uD83D\uDC4F","\uD83E\uDEF6","\uD83E\uDD1E","\u270C\uFE0F","\uD83E\uDD19","\uD83D\uDC4C","\uD83E\uDEB6","\uD83D\uDC94","\uD83D\uDC95","\uD83D\uDD90\uFE0F","\uD83D\uDC4A","\uD83E\uDD1C","\uD83E\uDEF5","\uD83E\uDD32","\uD83D\uDE4C","\uD83E\uDEF0","\uD83E\uDD1F","\u261D\uFE0F"] },
  { icon: "\uD83C\uDF1F", emojis: ["\uD83C\uDF1F","\u2B50","\uD83D\uDD25","\uD83D\uDCAF","\u2705","\u274C","\u26A1","\uD83C\uDF89","\uD83C\uDF8A","\uD83C\uDF08","\uD83D\uDCA1","\uD83D\uDE80","\uD83C\uDFC6","\uD83C\uDFAF","\uD83D\uDCB0","\uD83D\uDD14","\uD83D\uDCCC","\u267E\uFE0F","\uD83D\uDD34","\uD83D\uDFE2","\uD83D\uDFE1","\uD83D\uDC8E","\uD83C\uDF19","\uD83D\uDC4B\uD83C\uDFFF","\uD83D\uDD1D"] },
  { icon: "\uD83C\uDF55", emojis: ["\uD83C\uDF55","\uD83C\uDF54","\u2615","\uD83C\uDF66","\uD83C\uDF82","\uD83C\uDF5C","\uD83E\uDD57","\uD83C\uDF7A","\uD83C\uDF63","\uD83E\uDD50","\uD83C\uDF4E","\uD83C\uDF53","\uD83C\uDF49","\uD83E\uDD64","\uD83E\uDDC1","\uD83E\uDD69","\uD83C\uDF71","\uD83C\uDF5D","\uD83C\uDFF7\uFE0F","\uD83E\uDDC3","\uD83E\uDED6","\uD83C\uDF69","\uD83C\uDF6A","\uD83E\uDD5E","\uD83C\uDF2E"] },
];

function EmojiPicker({ onSelect }: { onSelect: (e: string) => void }) {
  const [tab, setTab] = useState(0);
  const emojis = EMOJI_CATS[tab]?.emojis ?? [];
  return (
    <div className="w-[272px] rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0e0e22] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.55)] overflow-hidden">
      <div className="flex border-b border-gray-100 dark:border-white/[0.05]">
        {EMOJI_CATS.map((c, i) => (
          <button key={i} type="button" onClick={() => setTab(i)}
            className={cn("flex-1 py-2.5 text-[17px] transition hover:bg-gray-50 dark:hover:bg-white/[0.03]", tab === i ? "bg-violet-50 dark:bg-violet-500/10" : "")}>
            {c.icon}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 p-2 gap-px max-h-[152px] overflow-y-auto">
        {emojis.map((emoji, i) => (
          <button key={i} type="button" onClick={() => onSelect(emoji)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[17px] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Demo chat (empty state background preview) ─────────────────── */
const DEMO_MSGS = [
  { id: 1, dir: "in", text: "Hi! I need help tracking my order. It's been 5 days and I haven't received it yet.", time: "10:23 AM" },
  { id: 2, dir: "out", text: "Hello! I'd be happy to help. Could you please share your order number?", time: "10:24 AM" },
  { id: 3, dir: "in", text: "Sure — it's #MAG-78291", time: "10:24 AM" },
  { id: 4, dir: "out", text: "Got it! Your order is currently in transit and is scheduled for delivery tomorrow between 2–6 PM. I'll send you the live tracking link now. 📦", time: "10:25 AM" },
  { id: 5, dir: "in", text: "Amazing! Thank you so much for the quick help 🙏", time: "10:26 AM" },
  { id: 6, dir: "out", text: "You're very welcome, Sarah! Is there anything else I can assist with today?", time: "10:26 AM" },
];

function DemoChat() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Background demo — pointer-events-none */}
      <div className="pointer-events-none flex h-full flex-col select-none" aria-hidden>
        {/* Demo header */}
        <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1e] px-5 py-3.5">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/40 to-purple-600/30 text-sm font-bold text-violet-200">S</div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-[#0c0c1e]" style={{ background: "#25D366" }}>
              <WhatsAppIcon className="h-2 w-2 text-white" />
            </span>
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Sarah Johnson</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-gray-500 dark:text-white/30">+1 (555) 234-5678</p>
              <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}>
                <WhatsAppIcon className="h-2 w-2" />WhatsApp
              </span>
            </div>
          </div>
          <div className="ml-auto flex gap-1.5">
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-1.5 text-[11px] font-semibold text-white">
              <Zap className="h-3 w-3" />AI
            </div>
          </div>
        </div>
        {/* Demo messages */}
        <div className="flex-1 overflow-hidden px-5 py-5 space-y-3 bg-gray-50 dark:bg-[#07070f]">
          {DEMO_MSGS.map((msg) => {
            const out = msg.dir === "out";
            return (
              <div key={msg.id} className={cn("flex gap-2.5", out ? "justify-end" : "justify-start")}>
                {!out && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-white/[0.07] text-[11px] font-bold text-gray-600 dark:text-white/50">S</div>
                )}
                <div className="flex max-w-[65%] flex-col gap-0.5">
                  {out && <p className="text-right text-[10px] text-violet-500 dark:text-violet-400/70">Magnetic AI</p>}
                  <div className={cn("rounded-2xl px-4 py-2.5 text-[13px] leading-[1.7]",
                    out ? "rounded-tr-sm bg-gradient-to-br from-violet-600 to-purple-700 text-white" : "rounded-tl-sm border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.05] text-gray-800 dark:text-white/80")}>
                    {msg.text}
                  </div>
                  <p className={cn("text-[10px] text-gray-400 dark:text-white/20", out ? "text-right" : "text-left")}>{msg.time}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Demo input */}
        <div className="border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1e] p-4">
          <div className="flex gap-3">
            <div className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] px-4 py-2.5 text-[13px] text-gray-300 dark:text-white/15">
              Type a reply…
            </div>
            <div className="flex items-center gap-2 self-end rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-[13px] font-semibold text-white">
              <Send className="h-4 w-4" />Send
            </div>
          </div>
        </div>
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-[#07070f]/75 backdrop-blur-[6px]">
        <div className="text-center px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-600/5 shadow-[0_0_40px_rgba(139,92,246,0.08)]">
            <Bot className="h-7 w-7 text-violet-500 dark:text-violet-400/80" />
          </div>
          <p className="text-[15px] font-semibold text-gray-700 dark:text-white/60">Select a conversation</p>
          <p className="mt-1.5 text-[12px] text-gray-400 dark:text-white/25">to view messages and assign agents</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Demo threads (one per platform) ─────────────────────────────── */
type DemoThread = {
  id: string;
  name: string;
  handle: string;
  source: keyof typeof platformConfig;
  preview: string;
  time: string;
  msgs: Array<{ id: number; dir: "in" | "out"; text: string; time: string }>;
};

const DEMO_THREADS: DemoThread[] = [
  {
    id: "demo-wa",
    name: "Sarah Johnson",
    handle: "+1 (555) 234-5678",
    source: "WHATSAPP",
    preview: "Amazing! Thank you so much \uD83D\uDE4F",
    time: "10:26 AM",
    msgs: [
      { id: 1, dir: "in", text: "Hi! I need help tracking my order. It's been 5 days and it hasn't arrived yet.", time: "10:23 AM" },
      { id: 2, dir: "out", text: "Hello! Happy to help. Could you please share your order number?", time: "10:24 AM" },
      { id: 3, dir: "in", text: "Sure \u2014 it's #MAG-78291", time: "10:24 AM" },
      { id: 4, dir: "out", text: "Got it! Your order is in transit and arrives tomorrow between 2\u20136 PM. I'm sending the live tracking link now. \uD83D\uDCE6", time: "10:25 AM" },
      { id: 5, dir: "in", text: "Amazing! Thank you so much for the quick help \uD83D\uDE4F", time: "10:26 AM" },
      { id: 6, dir: "out", text: "You're very welcome, Sarah! Is there anything else I can help you with today?", time: "10:26 AM" },
    ]
  },
  {
    id: "demo-ig",
    name: "Alex Rivera",
    handle: "@alexrivera_official",
    source: "INSTAGRAM",
    preview: "Do you ship internationally? \uD83C\uDF0D",
    time: "Yesterday",
    msgs: [
      { id: 1, dir: "in", text: "Hey! I saw your product on Instagram. When will the new summer collection be available? \uD83C\uDF0A", time: "Yesterday" },
      { id: 2, dir: "out", text: "Hi Alex! Our summer collection drops June 1st. Pre-order now for 15% off \uD83C\uDF89", time: "Yesterday" },
      { id: 3, dir: "in", text: "Nice! Do you have blue options?", time: "Yesterday" },
      { id: 4, dir: "out", text: "Yes! Ocean Blue, Sky Blue, and Midnight Navy. Want me to send you the lookbook?", time: "Yesterday" },
      { id: 5, dir: "in", text: "Yes please! Also do you ship internationally? \uD83C\uDF0D", time: "Yesterday" },
      { id: 6, dir: "out", text: "We ship to 45+ countries! Standard (5-7 days) and Express (2-3 days) options available. \uD83C\uDF10", time: "Yesterday" },
    ]
  },
  {
    id: "demo-ms",
    name: "James Williams",
    handle: "James Williams",
    source: "MESSENGER",
    preview: "Looking forward to Thursday! \uD83D\uDE0A",
    time: "Mon",
    msgs: [
      { id: 1, dir: "in", text: "Hello, I need to reschedule my Tuesday appointment. Is that possible?", time: "Mon 2:15 PM" },
      { id: 2, dir: "out", text: "Hi James! Of course. What date and time works best for you?", time: "Mon 2:16 PM" },
      { id: 3, dir: "in", text: "Can we move it to Thursday afternoon around 3 PM?", time: "Mon 2:17 PM" },
      { id: 4, dir: "out", text: "Thursday at 3 PM is confirmed! You'll receive a confirmation email shortly. \u2705", time: "Mon 2:18 PM" },
      { id: 5, dir: "in", text: "Great, thank you! Anything I need to bring?", time: "Mon 2:19 PM" },
      { id: 6, dir: "out", text: "Just your ID and the confirmation email. Looking forward to seeing you Thursday! \uD83D\uDE0A", time: "Mon 2:19 PM" },
    ]
  }
];

function DemoChatView({ demo }: { demo: DemoThread }) {
  const { Icon, color } = platformConfig[demo.source];
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-gray-50 dark:bg-[#07070f]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1e] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/40 to-purple-600/30 text-sm font-bold text-violet-700 dark:text-violet-200">
              {demo.name.charAt(0)}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-[#0c0c1e]" style={{ background: color }}>
              <Icon className="h-2 w-2 text-white" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold text-gray-900 dark:text-white">{demo.name}</p>
              <span className="rounded-md bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Demo</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-gray-500 dark:text-white/30">{demo.handle}</p>
              <PlatformBadge source={demo.source} size="xs" />
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_0_14px_rgba(124,58,237,0.35)]">
            <Zap className="h-3 w-3" />AI
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] px-3 py-1.5 text-[11px] font-semibold text-gray-500 dark:text-white/35">
            <UserCheck className="h-3 w-3" />MANUAL
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-5 py-5">
        {demo.msgs.map((msg, i) => {
          const out = msg.dir === "out";
          const showSender = i === 0 || demo.msgs[i - 1]?.dir !== msg.dir;
          return (
            <div key={msg.id} className={cn("flex gap-2.5", out ? "justify-end" : "justify-start")}>
              {!out && showSender && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-white/[0.07] text-[11px] font-bold text-gray-600 dark:text-white/50">
                  {demo.name.charAt(0)}
                </div>
              )}
              {!out && !showSender && <div className="w-7 shrink-0" />}
              <div className="flex max-w-[65%] flex-col gap-0.5">
                {out && showSender && (
                  <p className="text-right text-[10px] text-violet-600 dark:text-violet-400/60">Magnetic AI</p>
                )}
                <div className={cn("rounded-2xl px-4 py-2.5 text-[13px] leading-[1.7]",
                  out
                    ? "rounded-tr-sm bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-[0_4px_24px_rgba(124,58,237,0.3)]"
                    : "rounded-tl-sm border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.05] text-gray-800 dark:text-white/80")}>
                  {msg.text}
                </div>
                <p className={cn("text-[10px] text-gray-400 dark:text-white/20", out ? "text-right" : "text-left")}>{msg.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Input — disabled for demo */}
      <div className="border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1e] p-4">
        <div className="mb-2.5 flex items-center justify-center">
          <span className="rounded-full border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            \u2726 Demo preview \u2014 connect a channel to start real conversations
          </span>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-100/50 dark:bg-white/[0.02] px-4 py-2.5 text-[13px] text-gray-300 dark:text-white/15 cursor-not-allowed select-none">
            Type a reply\u2026
          </div>
          <div className="flex items-center gap-2 self-end rounded-xl bg-gradient-to-r from-violet-600/50 to-purple-600/50 px-4 py-2.5 text-[13px] font-semibold text-white cursor-not-allowed opacity-50">
            <Send className="h-4 w-4" />Send
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export function ChatbotInbox({ initialThreads, initialAgents }: { initialThreads: SocialBotThread[]; initialAgents: SocialBotAgent[] }) {
  const [threads, setThreads] = useState(initialThreads);
  const [agents] = useState(initialAgents);
  const [selectedId, setSelectedId] = useState<string | null>(initialThreads[0]?._id ?? null);
  const [payload, setPayload] = useState<ThreadPayload | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [selectedDemoId, setSelectedDemoId] = useState<string>("demo-wa");
  const isDemoMode = threads.length === 0;
  const selectedDemo = (DEMO_THREADS.find((d) => d.id === selectedDemoId) ?? DEMO_THREADS[0]) as DemoThread;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [pendingAudio, setPendingAudio] = useState<{ url: string; durationSec: number } | null>(null);
  const [localVoiceMsgs, setLocalVoiceMsgs] = useState<Array<{ id: string; url: string; durationSec: number; time: string; sending?: boolean; failed?: boolean }>>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingSecRef = useRef(0);
  const cancelRecordRef = useRef(false);

  function fmtSec(s: number) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      cancelRecordRef.current = false;
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        if (cancelRecordRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setPendingAudio({ url: URL.createObjectURL(blob), durationSec: recordingSecRef.current });
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(100);
      mediaRecorderRef.current = mr;
      recordingSecRef.current = 0;
      setRecordingSec(0);
      setIsRecording(true);
      recordingTimerRef.current = setInterval(() => {
        recordingSecRef.current += 1;
        setRecordingSec(recordingSecRef.current);
      }, 1000);
    } catch { /* mic permission denied */ }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    setIsRecording(false);
  }

  function cancelAudio() {
    cancelRecordRef.current = true;
    if (isRecording) { mediaRecorderRef.current?.stop(); }
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    if (pendingAudio) URL.revokeObjectURL(pendingAudio.url);
    setIsRecording(false);
    setPendingAudio(null);
    setRecordingSec(0);
    recordingSecRef.current = 0;
  }

  async function sendAudio() {
    if (!pendingAudio || !selectedId) return;
    const snapshot = pendingAudio;
    setPendingAudio(null);
    recordingSecRef.current = 0;

    const localId = `vm-${Date.now()}`;
    setLocalVoiceMsgs((prev) => [...prev, {
      id: localId,
      url: snapshot.url,
      durationSec: snapshot.durationSec,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      sending: true
    }]);

    try {
      const blob = await fetch(snapshot.url).then((r) => r.blob());
      const fd = new FormData();
      fd.append("threadId", selectedId);
      fd.append("audio", new File([blob], "voice.ogg", { type: "audio/ogg" }));
      await fetch("/api/social-bot/voice-message", { method: "POST", body: fd });
      setLocalVoiceMsgs((prev) => prev.map((v) => v.id === localId ? { ...v, sending: false } : v));
      void loadThread(selectedId);
    } catch {
      setLocalVoiceMsgs((prev) => prev.map((v) => v.id === localId ? { ...v, sending: false, failed: true } : v));
    }
  }

  const loadThread = useCallback(async (id: string) => {
    const r = await fetch(`/api/social-bot/threads/${id}`, { cache: "no-store" });
    if (!r.ok) return;
    const data = await r.json() as ThreadPayload;
    setPayload(data);
    if (data.thread) {
      setThreads((prev) => prev.map((t) => t._id === id ? { ...t, ...data.thread! } : t));
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void loadThread(selectedId);
    const t = window.setInterval(() => void loadThread(selectedId), 5000);
    return () => window.clearInterval(t);
  }, [selectedId, loadThread]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [payload?.messages]);

  async function refreshThreads() {
    const r = await fetch("/api/social-bot/workspace", { cache: "no-store" });
    if (r.ok) {
      const ws = await r.json() as { threads?: SocialBotThread[] };
      setThreads(ws.threads ?? []);
    }
  }

  async function send() {
    if (!selectedId || !text.trim()) return;
    setSending(true);
    const r = await fetch("/api/social-bot/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: selectedId, text })
    });
    if (r.ok) {
      setPayload(await r.json() as ThreadPayload);
      setText("");
      textareaRef.current?.focus();
    }
    setSending(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); }
  }

  async function patchThread(body: Record<string, unknown>) {
    if (!selectedId) return;
    const r = await fetch(`/api/social-bot/threads/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (r.ok) {
      const { thread } = await r.json() as { ok: boolean; thread: SocialBotThread };
      setPayload((p) => p ? { ...p, thread } : null);
      setThreads((prev) => prev.map((t) => t._id === selectedId ? { ...t, ...thread } : t));
    }
  }

  async function assignAgent(agentId: string | null) {
    setAssigning(true);
    await patchThread({ assignedAgentId: agentId });
    setAssigning(false);
  }

  async function triggerAutoAssign() {
    setAssigning(true);
    await patchThread({ autoAssign: true });
    setAssigning(false);
  }

  const filtered = threads
    .filter((t) => {
      if (filter === "AI") return t.mode === "AI";
      if (filter === "MANUAL") return t.mode === "MANUAL";
      if (filter === "UNASSIGNED") return !t.assignedAgentId;
      return true;
    })
    .filter((t) => !search || t.contactName.toLowerCase().includes(search.toLowerCase()) || t.contactHandle.toLowerCase().includes(search.toLowerCase()));

  const selected = payload?.thread ?? null;
  const unassignedCount = threads.filter((t) => !t.assignedAgentId).length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Thread sidebar ── */}
      <div className="flex w-[280px] shrink-0 flex-col border-r border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0d20]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.06] px-4 py-3.5">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Inbox</h2>
            {unassignedCount > 0 && (
              <p className="mt-0.5 text-[10px] text-amber-500 dark:text-amber-400/70">{unassignedCount} unassigned</p>
            )}
          </div>
          <button type="button" onClick={() => void refreshThreads()}
            className="rounded-lg p-1.5 text-gray-400 dark:text-white/25 transition hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-white/60">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 dark:border-white/[0.06] px-3 py-2.5">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/[0.07] bg-gray-100 dark:bg-white/[0.03] px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-white/20" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…"
              className="flex-1 bg-transparent text-[13px] text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/20" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/[0.06] px-3 py-2">
          {(["ALL", "AI", "MANUAL", "UNASSIGNED"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={cn("flex-1 rounded-lg py-1.5 text-[10px] font-semibold transition", filter === f
                ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.4)]"
                : "text-gray-400 dark:text-white/25 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-700 dark:hover:text-white/60")}>
              {f === "UNASSIGNED" ? "Open" : f}
            </button>
          ))}
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.04]">
          {isDemoMode ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 bg-amber-50/60 dark:bg-amber-500/[0.05]">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400/70">Live Preview</p>
                <span className="rounded-full bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">3 channels</span>
              </div>
              {DEMO_THREADS.map((dt) => {
                const { Icon, color } = platformConfig[dt.source];
                const isActive = selectedDemoId === dt.id;
                return (
                  <button key={dt.id} type="button" onClick={() => setSelectedDemoId(dt.id)}
                    className={cn("relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition-all",
                      isActive ? "bg-violet-50 dark:bg-violet-500/[0.12]" : "hover:bg-gray-50 dark:hover:bg-white/[0.025]")}>
                    {isActive && <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-violet-500" />}
                    <div className="relative mt-0.5 shrink-0">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold",
                        isActive ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]" : "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white/50")}>
                        {dt.name.charAt(0)}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-white dark:border-[#0d0d20] bg-white dark:bg-[#0d0d20]">
                        <Icon className="h-2.5 w-2.5" style={{ color }} />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={cn("truncate text-[13px] font-semibold", isActive ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-white/80")}>{dt.name}</p>
                        <span className="shrink-0 text-[10px] text-gray-400 dark:text-white/20">{dt.time}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-white/30">{dt.preview}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <PlatformBadge source={dt.source} size="xs" />
                        <span className="rounded-md bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">Demo</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]">
                <Bot className="h-5 w-5 text-gray-300 dark:text-white/10" />
              </div>
              <p className="text-xs text-gray-400 dark:text-white/20">No conversations</p>
            </div>
          ) : filtered.map((t) => {
            const isActive = selectedId === t._id;
            const { Icon, color } = platformConfig[t.source];
            return (
              <button key={t._id} type="button" onClick={() => setSelectedId(t._id)}
                className={cn("relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition-all",
                  isActive ? "bg-violet-50 dark:bg-violet-500/[0.12]" : "hover:bg-gray-50 dark:hover:bg-white/[0.025]")}>
                {isActive && <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-violet-500" />}
                {/* Avatar */}
                <div className="relative mt-0.5 shrink-0">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold",
                    isActive ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]" : "bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white/50")}>
                    {t.contactName.charAt(0).toUpperCase()}
                  </div>
                  {/* Platform icon badge */}
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-white dark:border-[#0d0d20] bg-white dark:bg-[#0d0d20]">
                    <Icon className="h-2.5 w-2.5" style={{ color }} />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn("truncate text-[13px] font-semibold", isActive ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-white/80")}>{t.contactName}</p>
                    <span className="shrink-0 text-[10px] text-gray-400 dark:text-white/20">{formatTime(t.lastMessageAt)}</span>
                  </div>
                  {/* Agent badge if assigned */}
                  {t.assignedAgentName && (
                    <div className="mt-0.5 flex items-center gap-1">
                      <UserCheck className="h-2.5 w-2.5 shrink-0 text-violet-500 dark:text-violet-400/60" />
                      <span className="truncate text-[10px] text-violet-600 dark:text-violet-400/70">{t.assignedAgentName}</span>
                    </div>
                  )}
                  <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-white/30">{t.lastMessagePreview}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-semibold",
                      t.mode === "AI" ? "bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300" : "bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-white/35")}>
                      {t.mode}
                    </span>
                    {t.unreadCount > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[9px] font-bold text-white shadow-[0_0_6px_rgba(124,58,237,0.5)]">{t.unreadCount}</span>
                    )}
                    {!t.assignedAgentId && (
                      <span className="rounded-md bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400/80">Open</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

          {/* ── Chat area ── */}
          {selected ? (
            <>
              <div className="flex min-w-0 flex-1 flex-col bg-gray-50 dark:bg-[#07070f]">
                {/* Chat header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1e] px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/40 to-purple-600/30 text-sm font-bold text-violet-200">
                        {selected.contactName.charAt(0)}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-[#0c0c1e]" style={{ background: platformConfig[selected.source].color }}>
                        {(() => { const { Icon } = platformConfig[selected.source]; return <Icon className="h-2 w-2 text-white" />; })()}
                      </span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900 dark:text-white">{selected.contactName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-gray-500 dark:text-white/30">{selected.contactHandle}</p>
                        <PlatformBadge source={selected.source} size="xs" />
                        {selected.assignedAgentName && (
                          <span className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400/70">
                            <UserCheck className="h-2.5 w-2.5" />
                            {selected.assignedAgentName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Mode toggles */}
                  <div className="flex gap-1.5">
                    {(["AI", "MANUAL"] as const).map((m) => (
                      <button key={m} type="button" onClick={() => void patchThread({ mode: m })}
                        className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                          selected.mode === m
                            ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_14px_rgba(124,58,237,0.45)]"
                            : "border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/35 hover:border-violet-400 dark:hover:border-violet-500/30 hover:text-gray-800 dark:hover:text-white/70")}>
                        {m === "AI" ? <Zap className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 px-5 py-5">
                  {(payload?.messages ?? []).map((msg, i) => {
                    const out = msg.direction === "OUTBOUND";
                    const prevMsg = i > 0 ? payload?.messages[i - 1] : null;
                    const showSender = !prevMsg || prevMsg.direction !== msg.direction;
                    const isAudio = msg.metadata?.mediaType === "audio";
                    const mediaId = msg.metadata?.mediaId as string | undefined;
                    return (
                      <div key={msg._id} className={cn("flex gap-2.5", out ? "justify-end" : "justify-start")}>
                        {!out && showSender && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-white/[0.07] text-[11px] font-bold text-gray-600 dark:text-white/50">
                            {selected.contactName.charAt(0)}
                          </div>
                        )}
                        {!out && !showSender && <div className="w-7 shrink-0" />}
                        <div className="flex max-w-[65%] flex-col gap-0.5">
                          {out && showSender && selected.assignedAgentName && (
                            <p className="text-right text-[10px] text-violet-600 dark:text-violet-400/60">{selected.assignedAgentName}</p>
                          )}
                          {isAudio && mediaId ? (
                            <div className={cn("flex items-center gap-2 rounded-2xl px-3 py-2.5 shadow-md",
                              out
                                ? "rounded-tr-sm bg-gradient-to-br from-violet-600 to-purple-700"
                                : "rounded-tl-sm border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.05]")}>
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                                <Mic className={cn("h-3 w-3", out ? "text-white" : "text-violet-500")} />
                              </div>
                              <audio
                                src={`/api/social-bot/media/${mediaId}`}
                                controls
                                className="h-7 w-36"
                              />
                            </div>
                          ) : (
                            <div className={cn("rounded-2xl px-4 py-2.5 text-[13px] leading-[1.7]",
                              out
                                ? "rounded-tr-sm bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-[0_4px_24px_rgba(124,58,237,0.3)]"
                                : "rounded-tl-sm border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.05] text-gray-800 dark:text-white/80")}>
                              {msg.text}
                            </div>
                          )}
                          <div className={cn("flex items-center gap-1", out ? "justify-end" : "justify-start")}>
                            <p className="text-[10px] text-gray-400 dark:text-white/20">{formatTime(msg.timestamp)}</p>
                            {out && (
                              <span className="text-[10px]">
                                {msg.deliveryStatus === "PENDING" && <Clock className="h-3 w-3 text-white/40" />}
                                {msg.deliveryStatus === "SENT" && <Check className="h-3 w-3 text-white/50" />}
                                {msg.deliveryStatus === "DELIVERED" && <CheckCheck className="h-3 w-3 text-white/60" />}
                                {msg.deliveryStatus === "READ" && <CheckCheck className="h-3 w-3 text-blue-300" />}
                                {msg.deliveryStatus === "FAILED" && <X className="h-3 w-3 text-red-400" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {localVoiceMsgs.map((vm) => (
                    <div key={vm.id} className="flex justify-end">
                      <div className="flex max-w-[65%] flex-col gap-0.5">
                        <div className="flex items-center gap-2 rounded-2xl rounded-tr-sm bg-gradient-to-br from-violet-600 to-purple-700 px-3 py-2.5 shadow-[0_4px_24px_rgba(124,58,237,0.3)]">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                            {vm.sending ? <Loader2 className="h-3 w-3 text-white animate-spin" /> : <Mic className="h-3 w-3 text-white" />}
                          </div>
                          <audio src={vm.url} controls className="h-7 w-28" />
                          <span className="shrink-0 text-[10px] text-white/60">{fmtSec(vm.durationSec)}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <p className="text-[10px] text-gray-400 dark:text-white/20">{vm.time}</p>
                          {vm.failed
                            ? <X className="h-3 w-3 text-red-400" />
                            : vm.sending
                              ? <Clock className="h-3 w-3 text-white/30" />
                              : <Check className="h-3 w-3 text-white/50" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c0c1e] p-4">
                  {selected.assignedAgentName && (
                    <div className="mb-2.5 flex items-center gap-1.5">
                      <UserCheck className="h-3 w-3 text-violet-500 dark:text-violet-400/60" />
                      <span className="text-[11px] text-violet-600 dark:text-violet-400/60">Replying as <strong className="font-semibold text-violet-700 dark:text-violet-300/80">{selected.assignedAgentName}</strong></span>
                    </div>
                  )}
                  {/* Recording state */}
                  {isRecording ? (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/[0.06] px-4 py-3">
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                      </span>
                      <span className="flex-1 text-[13px] font-semibold tabular-nums text-red-600 dark:text-red-400">Recording… {fmtSec(recordingSec)}</span>
                      <button type="button" onClick={cancelAudio} className="rounded-lg p-1.5 text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 transition">
                        <X className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={stopRecording}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-[12px] font-semibold text-white shadow-[0_0_14px_rgba(124,58,237,0.4)] transition hover:from-violet-500 hover:to-purple-500">
                        <StopCircle className="h-4 w-4" />Stop
                      </button>
                    </div>
                  ) : pendingAudio ? (
                    /* Audio preview */
                    <div className="flex items-center gap-3 rounded-xl border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/[0.06] px-4 py-3">
                      <Mic className="h-4 w-4 shrink-0 text-violet-500" />
                      <audio src={pendingAudio.url} controls className="h-8 flex-1 max-w-[220px]" />
                      <span className="text-[11px] text-violet-600 dark:text-violet-400/70 tabular-nums">{fmtSec(pendingAudio.durationSec)}</span>
                      <button type="button" onClick={cancelAudio} className="rounded-lg p-1.5 text-gray-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={sendAudio}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-[12px] font-semibold text-white shadow-[0_0_14px_rgba(124,58,237,0.4)] transition hover:from-violet-500 hover:to-purple-500">
                        <Send className="h-3.5 w-3.5" />Send
                      </button>
                    </div>
                  ) : (
                    /* Normal input */
                    <div className="flex items-end gap-2">
                      <div className="relative flex flex-1 items-end rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] focus-within:border-violet-400 dark:focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-400/20 transition">
                        {showEmoji && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
                            <div className="absolute bottom-full left-0 mb-2 z-50">
                              <EmojiPicker onSelect={(e) => { setText((t) => t + e); setShowEmoji(false); }} />
                            </div>
                          </>
                        )}
                        <button type="button" onClick={() => setShowEmoji((v) => !v)}
                          title="Emoji"
                          className={cn("shrink-0 self-end p-2.5 pb-[11px] transition", showEmoji ? "text-violet-500" : "text-gray-400 dark:text-white/25 hover:text-violet-500 dark:hover:text-violet-400")}>
                          <Smile className="h-[18px] w-[18px]" />
                        </button>
                        <textarea
                          ref={textareaRef}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyDown={handleKey}
                          rows={1}
                          placeholder={selected.mode === "AI" ? "AI is handling this…" : "Type a reply… (Enter to send)"}
                          className="flex-1 resize-none bg-transparent py-2.5 pr-2 text-[13px] text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-white/20 min-h-[40px] max-h-[120px] overflow-y-auto"
                        />
                        <button type="button" onClick={() => void startRecording()}
                          title="Voice message"
                          className="shrink-0 self-end p-2.5 pb-[11px] text-gray-400 dark:text-white/25 hover:text-violet-500 dark:hover:text-violet-400 transition">
                          <Mic className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                      <button type="button" onClick={() => void send()} disabled={sending || !text.trim()}
                        className="flex items-center gap-2 self-end rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] transition hover:from-violet-500 hover:to-purple-500 disabled:opacity-40">
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Agent panel ── */}
              <AgentPanel
                agents={agents}
                thread={selected}
                onAssign={(id) => void assignAgent(id)}
                onAutoAssign={() => void triggerAutoAssign()}
                assigning={assigning}
              />
            </>
          ) : isDemoMode ? (
            <DemoChatView demo={selectedDemo} />
          ) : (
            <DemoChat />
          )}
        </div>
      );
}
