"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { AlertTriangle, Bug, RefreshCw, Route, Shield } from "lucide-react";

type ErrorsByDay = { date: string; count: number };
type BySeverity = { severity: string; count: number };
type TopRoute = { route: string; count: number };
type RecentError = {
  id: string; requestId: string; route: string; method: string;
  message: string; severity: string; timestamp: string;
};
type ObservabilityData = {
  total: number;
  errorsByDay: ErrorsByDay[];
  bySeverity: BySeverity[];
  topRoutes: TopRoute[];
  recent: RecentError[];
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "#34d399",
  medium: "#fbbf24",
  high: "#f87171",
  critical: "#a855f7",
};

export default function ObservabilityDashboardPage() {
  const [data, setData] = useState<ObservabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/observability");
      if (!res.ok) throw new Error("Failed to load observability data");
      setData(await res.json() as ObservabilityData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <div className="min-h-full bg-gray-50 dark:bg-transparent p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bug className="h-6 w-6 text-rose-500" />
            Observability Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
            Live error tracking across all API routes
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] px-4 py-2 text-sm font-medium text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.08] transition disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-5 py-4 text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-gray-200/60 dark:bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Errors", value: data.total, icon: Bug, color: "rose" },
              { label: "Critical", value: data.bySeverity.find(s => s.severity === "critical")?.count ?? 0, icon: Shield, color: "purple" },
              { label: "High Severity", value: data.bySeverity.find(s => s.severity === "high")?.count ?? 0, icon: AlertTriangle, color: "orange" },
              { label: "Routes Affected", value: data.topRoutes.length, icon: Route, color: "blue" },
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">{kpi.label}</p>
                    <Icon className="h-4 w-4 text-gray-400 dark:text-white/25" />
                  </div>
                  <p className="text-4xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
                </div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Error trend */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-4">Error Rate — Last 14 Days</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.errorsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} name="Errors" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Severity breakdown */}
            <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-4">By Severity</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.bySeverity} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${String(name ?? "")} ${((Number(percent ?? 0))*100).toFixed(0)}%`} labelLine={false}>
                    {data.bySeverity.map((entry) => (
                      <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] ?? "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Routes */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-4">Top Error Routes</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.topRoutes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} />
                <YAxis type="category" dataKey="route" width={200} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" fill="#f87171" radius={[0, 6, 6, 0]} name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Errors Table */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] overflow-hidden">
            <div className="border-b border-gray-100 dark:border-white/[0.06] px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">Recent Errors</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                    {["Timestamp", "Method", "Route", "Severity", "Message"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/25">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map(err => (
                    <tr key={err.id} className="border-b border-gray-50 dark:border-white/[0.03] hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition">
                      <td className="px-4 py-3 text-[11px] text-gray-400 dark:text-white/30 whitespace-nowrap">{new Date(err.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono font-semibold text-gray-600 dark:text-white/50">{err.method}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-mono text-gray-700 dark:text-white/60 max-w-[180px] truncate">{err.route}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ background: `${SEVERITY_COLORS[err.severity]}20`, color: SEVERITY_COLORS[err.severity] }}>
                          {err.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-gray-600 dark:text-white/50 max-w-[260px] truncate" title={err.message}>{err.message}</td>
                    </tr>
                  ))}
                  {data.recent.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400 dark:text-white/25">No errors recorded 🎉</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
