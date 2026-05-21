"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Send, X, CheckCircle2, AlertCircle } from "lucide-react";

type Props = {
  /** Pre-fill the phone field — pass the user's phone if you have it */
  defaultPhone?: string;
  /** Small label shown on the trigger button, e.g. the user email */
  recipientLabel?: string;
};

export function AdminSmsSender({ defaultPhone = "", recipientLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(defaultPhone);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const charsLeft = 160 - message.length;

  function handleOpen() {
    setOpen(true);
    setResult(null);
  }

  function handleClose() {
    setOpen(false);
    setPhone(defaultPhone);
    setMessage("");
    setResult(null);
  }

  function handleSend() {
    if (!phone.trim() || !message.trim()) return;
    setResult(null);

    startTransition(async () => {
      const res = await fetch("/api/admin/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), message: message.trim() }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        quotaRemaining?: number;
      };

      if (!res.ok || !payload.ok) {
        setResult({ ok: false, text: payload.error ?? "Failed to send SMS." });
      } else {
        setResult({
          ok: true,
          text: `Sent! Quota remaining: ${payload.quotaRemaining ?? "?"}`,
        });
        setMessage("");
      }
    });
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11.5px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
      >
        <MessageSquare className="h-3 w-3" />
        Send SMS
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.15)] dark:border-white/[0.08] dark:bg-[#0d0d12]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/[0.06]">
              <div>
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white">Send SMS</p>
                {recipientLabel && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[220px]">{recipientLabel}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/[0.06] dark:hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-3 p-4">
              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Phone number <span className="text-slate-400">(with country code)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-transparent px-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-white/[0.08] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white/20"
                />
              </div>

              {/* Message */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Message</label>
                  <span className={`text-[10px] ${charsLeft < 20 ? "text-rose-500" : "text-slate-400"}`}>
                    {charsLeft} left
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 160))}
                  placeholder="Type your message…"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-white/[0.08] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white/20"
                />
              </div>

              {/* Quick templates */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Your order has been fulfilled ✅",
                  "Your payment was received 💳",
                  "Action required on your account",
                ].map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setMessage(tpl)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] text-slate-500 transition hover:border-slate-300 hover:bg-white dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-slate-400"
                  >
                    {tpl}
                  </button>
                ))}
              </div>

              {/* Result */}
              {result && (
                <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-[12px] ${result.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400"}`}>
                  {result.ok
                    ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  <span>{result.text}</span>
                </div>
              )}

              {/* Provider note */}
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Powered by <a href="https://textbelt.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-600">TextBelt</a>.
                Free key = 1 SMS/day. Set <code className="font-mono">TEXTBELT_API_KEY</code> for a paid key.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={handleClose}
                className="h-8 rounded-lg px-3 text-[12px] text-slate-500 transition hover:bg-slate-50 dark:hover:bg-white/[0.04]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isPending || !phone.trim() || !message.trim()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-[12px] font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <Send className="h-3 w-3" />
                {isPending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
