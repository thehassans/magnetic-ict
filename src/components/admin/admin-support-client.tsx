"use client";

import { useMemo, useState } from "react";
import type { SupportTicketRecord } from "@/lib/support-tickets";

type AdminSupportClientProps = {
  tickets: SupportTicketRecord[];
};

export function AdminSupportClient({ tickets }: AdminSupportClientProps) {
  const [ticketState, setTicketState] = useState(tickets);
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?._id ?? "");
  const [reply, setReply] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const selectedTicket = useMemo(
    () => ticketState.find((ticket) => ticket._id === selectedTicketId) ?? ticketState[0] ?? null,
    [selectedTicketId, ticketState]
  );
  const stats = useMemo(() => ({
    total: ticketState.length,
    open: ticketState.filter((ticket) => ticket.status === "open").length,
    closed: ticketState.filter((ticket) => ticket.status === "closed").length
  }), [ticketState]);

  function updateTicket(nextTicket: SupportTicketRecord) {
    setTicketState((current) => current.map((ticket) => ticket._id === nextTicket._id ? nextTicket : ticket));
  }

  async function runAction(action: "reply" | "close" | "reopen") {
    if (!selectedTicket) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const response = await fetch(`/api/admin/support/tickets/${selectedTicket._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(action === "reply" ? { action, message: reply } : { action })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; ticket?: SupportTicketRecord };

    if (!response.ok || !payload.ticket) {
      setFeedback({ type: "error", message: payload.error ?? "Unable to update the ticket." });
      setIsSaving(false);
      return;
    }

    updateTicket(payload.ticket);
    setReply("");
    setFeedback({ type: "success", message: action === "reply" ? "Reply sent." : action === "close" ? "Ticket closed." : "Ticket reopened." });
    setIsSaving(false);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard label="Total tickets" value={String(stats.total)} />
        <StatCard label="Open tickets" value={String(stats.open)} />
        <StatCard label="Closed tickets" value={String(stats.closed)} />
      </section>

      {feedback ? <div className={`rounded-[24px] border px-4 py-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{feedback.message}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Tickets</div>
          <div className="mt-4 space-y-3">
            {ticketState.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">No support tickets yet.</div>
            ) : ticketState.map((ticket) => (
              <button
                key={ticket._id}
                type="button"
                onClick={() => setSelectedTicketId(ticket._id)}
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${ticket._id === selectedTicketId ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"}`}
              >
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">{ticket.status}</div>
                <div className="mt-2 font-semibold">{ticket.subject}</div>
                <div className={`mt-1 text-sm ${ticket._id === selectedTicketId ? "text-white/70" : "text-slate-500"}`}>{ticket.customerEmail}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedTicket ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm text-slate-500">{selectedTicket.customerEmail}</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{selectedTicket.subject}</h2>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{selectedTicket.category || "General"}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{selectedTicket.status}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(selectedTicket.createdAt))}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedTicket.status === "open" ? (
                  <button type="button" onClick={() => void runAction("close")} disabled={isSaving} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60">Close ticket</button>
                ) : (
                  <button type="button" onClick={() => void runAction("reopen")} disabled={isSaving} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60">Reopen ticket</button>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {selectedTicket.messages.map((message) => (
                <div key={message.id} className={`rounded-[24px] border px-4 py-4 ${message.authorType === "admin" ? "border-cyan-200 bg-cyan-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <span>{message.authorType}</span>
                    <span>{message.authorName || message.authorEmail || "Unknown"}</span>
                    <span>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.createdAt))}</span>
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{message.body}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-950">Admin reply</div>
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                rows={5}
                className="mt-4 w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => void runAction("reply")} disabled={isSaving || reply.trim().length === 0} className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">{isSaving ? "Saving..." : "Send reply"}</button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}
