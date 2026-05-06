"use client";

import { type FormEvent, useState } from "react";

export function NewsletterSignupForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

    if (!response.ok) {
      setFeedback({ type: "error", message: payload.error ?? "Unable to subscribe right now." });
      setIsSubmitting(false);
      return;
    }

    setFeedback({ type: "success", message: payload.message ?? "Subscribed successfully." });
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="text-sm font-semibold text-slate-950 dark:text-white">Newsletter</div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Get occasional product, service, and operations updates from MagneticICT.</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          required
          className="h-11 w-full rounded-[16px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {feedback ? <div className={`mt-3 rounded-[16px] border px-3 py-2 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"}`}>{feedback.message}</div> : null}
    </div>
  );
}
