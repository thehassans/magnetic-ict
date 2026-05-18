"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Copy, Mail, Send, Trash2, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatbotInvitation } from "@/lib/social-bot-types";

type Props = { initialInvitations: ChatbotInvitation[]; appUrl?: string };

export function InvitePage({ initialInvitations, appUrl }: Props) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);

  const availableRestrictions = [
    { id: "agents", label: "Hide AI & Voice Agents", desc: "Prevents creating or modifying AI bots." },
    { id: "training", label: "Hide Training Knowledge", desc: "Restricts access to documents and tests." },
    { id: "shortcuts", label: "Hide Shortcuts", desc: "Hides Contacts, Broadcasts, and Quick Replies." },
    { id: "reports", label: "Hide Reports", desc: "Restricts access to analytics." }
  ];

  function toggleRestriction(id: string) {
    setSelectedRestrictions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  }

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/chatbot/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), restrictions: selectedRestrictions })
      });
      const data = await res.json() as { ok?: boolean; invitation?: ChatbotInvitation; error?: string; emailSent?: boolean; emailError?: string };
      if (!res.ok) { showToast("err", data.error ?? "Failed to send invite."); return; }
      setInvitations((prev) => [data.invitation!, ...prev]);
      setEmail("");
      setSelectedRestrictions([]);
      if (data.emailSent) {
        showToast("ok", `Invite email sent to ${email.trim()} — ask them to check Spam if not received.`);
      } else {
        showToast("err", `Invite saved but email failed: ${data.emailError ?? "unknown error"}. Use Copy link to share manually.`);
      }
    } catch { showToast("err", "Something went wrong."); }
    finally { setSending(false); }
  }

  async function removeInvite(token: string) {
    setRemoving(token);
    try {
      await fetch("/api/chatbot/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      setInvitations((prev) => prev.filter((i) => i.token !== token));
    } catch { showToast("err", "Failed to remove invite."); }
    finally { setRemoving(null); }
  }

  function copyLink(token: string) {
    const base = (appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://magnetic-ict.com").replace(/\/$/, "");
    void navigator.clipboard.writeText(`${base}/invite/${token}`);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  const pending = invitations.filter((i) => i.status === "pending");
  const accepted = invitations.filter((i) => i.status === "accepted");

  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0f] px-6 pb-8 pt-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.07),transparent)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300 mb-3">
            <UserPlus className="h-3 w-3" />
            Invite
          </div>
          <h1 className="text-[1.6rem] font-bold tracking-tight text-gray-950 dark:text-white">Invite People</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/35 max-w-md">
            Invite teammates or clients via email. They receive a link to sign in or create an account with Google.
          </p>
        </div>

        {toast && (
          <div className={cn(
            "relative mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium",
            toast.type === "ok"
              ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
          )}>
            {toast.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
            {toast.msg}
          </div>
        )}
      </div>

      <div className="px-6 py-6 max-w-2xl space-y-8">

        {/* Send form */}
        <div className="rounded-[22px] border border-gray-200/80 dark:border-white/[0.07] bg-white dark:bg-white/[0.025] p-6">
          <p className="text-sm font-semibold text-gray-800 dark:text-white/80 mb-4">Send an invitation</p>
          <form onSubmit={(e) => void sendInvite(e)} className="flex flex-col gap-5">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-white/25" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@gmail.com"
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] pl-9 pr-4 py-2.5 text-sm text-gray-800 dark:text-white/80 placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-violet-400 dark:focus:border-violet-500/50 transition"
                />
              </div>
              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                {sending ? "Sending…" : "Send Invite"}
              </button>
            </div>
            
            <div className="border-t border-gray-100 dark:border-white/[0.05] pt-4">
              <p className="text-[12px] font-semibold text-gray-600 dark:text-white/50 mb-3">Access Restrictions (Optional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableRestrictions.map((r) => {
                  const isChecked = selectedRestrictions.includes(r.id);
                  return (
                    <label key={r.id} className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                      isChecked 
                        ? "border-violet-300 dark:border-violet-500/40 bg-violet-50 dark:bg-violet-500/10" 
                        : "border-gray-200 dark:border-white/[0.06] bg-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    )}>
                      <div className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5">
                        <input
                          type="checkbox"
                          className="peer absolute inset-0 opacity-0 cursor-pointer"
                          checked={isChecked}
                          onChange={() => toggleRestriction(r.id)}
                        />
                        {isChecked && <CheckCircle2 className="h-3 w-3 text-violet-600 dark:text-violet-400 pointer-events-none" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-gray-800 dark:text-white/80 leading-none mb-1">{r.label}</p>
                        <p className="text-[11px] text-gray-400 dark:text-white/40 leading-snug">{r.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
          <p className="mt-4 text-[12px] text-gray-400 dark:text-white/25">
            The invitee gets an email with a sign-in link. They can log in with Google (Gmail) or any account.
          </p>
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-white/25 mb-3">
              Pending · {pending.length}
            </p>
            <div className="space-y-2">
              {pending.map((inv) => (
                <div key={inv.token} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/80 truncate">{inv.inviteeEmail}</p>
                      <p className="text-[11px] text-gray-400 dark:text-white/25">
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copyLink(inv.token)}
                      title="Copy invite link"
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-gray-500 dark:text-white/40 transition hover:text-gray-700 dark:hover:text-white/70"
                    >
                      {copied === inv.token ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copied === inv.token ? "Copied" : "Copy link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeInvite(inv.token)}
                      disabled={removing === inv.token}
                      title="Cancel invite"
                      className="rounded-lg p-1.5 text-gray-400 dark:text-white/25 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted */}
        {accepted.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-white/25 mb-3">
              Accepted · {accepted.length}
            </p>
            <div className="space-y-2">
              {accepted.map((inv) => (
                <div key={inv.token} className="flex items-center gap-3 rounded-2xl border border-emerald-100 dark:border-emerald-500/[0.12] bg-emerald-50/50 dark:bg-emerald-500/[0.05] px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/80 truncate">{inv.inviteeEmail}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Joined {inv.acceptedAt ? new Date(inv.acceptedAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {invitations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-gray-200 dark:border-white/[0.07] bg-gray-50/60 dark:bg-white/[0.01] py-14 text-center">
            <UserPlus className="h-8 w-8 text-gray-300 dark:text-white/15 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-white/30">No invitations sent yet</p>
            <p className="mt-1 text-[12px] text-gray-400 dark:text-white/20">Enter an email above to invite someone.</p>
          </div>
        )}
      </div>
    </div>
  );
}
