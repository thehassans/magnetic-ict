"use client";

import { type FormEvent, useState } from "react";

type SupportTicketFormProps = {
  initialEmail?: string;
  initialName?: string;
};

export function SupportTicketForm({ initialEmail = "", initialName = "" }: SupportTicketFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const response = await fetch("/api/support/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        name,
        subject,
        category,
        message
      })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

    if (!response.ok) {
      setFeedback({ type: "error", message: payload.error ?? "Unable to create your support ticket." });
      setIsSubmitting(false);
      return;
    }

    setFeedback({ type: "success", message: payload.message ?? "Support ticket created successfully." });
    setSubject("");
    setMessage("");
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-[36px] border border-slate-200 bg-white/85 p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
      <div className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Support ticket</div>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Open a request</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Share the issue details and our team will follow up by email.</p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Subject</span>
          <input value={subject} onChange={(event) => setSubject(event.target.value)} required className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
            <option>General</option>
            <option>Billing</option>
            <option>Hosting</option>
            <option>Domains</option>
            <option>Technical</option>
          </select>
        </label>
        <label className="space-y-2 text-sm lg:col-span-2">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Message</span>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={6} required className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white" />
        </label>
        <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
            {isSubmitting ? "Submitting..." : "Create support ticket"}
          </button>
          {feedback ? <div className={`rounded-full border px-4 py-2 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"}`}>{feedback.message}</div> : null}
        </div>
      </form>
    </div>
  );
}
