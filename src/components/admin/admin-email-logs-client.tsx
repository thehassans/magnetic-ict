"use client";

import { useMemo, useState } from "react";
import type { EmailLogRecord } from "@/lib/email-logs";

export function AdminEmailLogsClient({ logs }: { logs: EmailLogRecord[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesStatus = statusFilter === "all" || log.status === statusFilter;
      const searchable = [log.to, log.subject, log.category, log.provider, log.notificationKey ?? ""].join(" ").toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [logs, query, statusFilter]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700">Search email logs</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by recipient, subject, category, or provider"
            className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-slate-700">Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-12 w-full rounded-[20px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950">
            <option value="all">All statuses</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="skipped">Skipped</option>
          </select>
        </label>
      </section>

      <section className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">No email logs match the current filters.</div>
        ) : filteredLogs.map((log) => (
          <article key={log._id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-sm text-slate-500">{log.to}</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{log.subject}</h2>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{log.category.replaceAll("_", " ")}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{log.provider}</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">{log.notificationKey ?? "manual"}</span>
                </div>
              </div>
              <div className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold ${log.status === "sent" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : log.status === "failed" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{log.status}</div>
            </div>
            {log.errorMessage ? <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{log.errorMessage}</div> : null}
            {log.metadata ? <pre className="mt-5 overflow-x-auto rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-600">{JSON.stringify(log.metadata, null, 2)}</pre> : null}
            <div className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-400">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(log.createdAt))}</div>
          </article>
        ))}
      </section>
    </div>
  );
}
