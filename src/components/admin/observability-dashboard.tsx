"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { AlertTriangle, Bug, RefreshCw, Route, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

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

const TOOLTIP_STYLE = {
  background: "#0f0f1a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  fontSize: 12,
  color: "#fff"
};

export function ObservabilityDashboard() {
  const [data, setData] = useState<ObservabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/observability");
      if (!res.ok) throw new Error("Failed to load observability data");
      setData(await res.json() as ObservabilityData);
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/40 text-[12px]">
          <Bug className="h-3.5 w-3.5" />
          Real-time from MongoDB — last 14 days
        </div>
        <button
          onClick={() => void load()} disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-white/50 hover:text-white/80 transition disabled:opacity-40"
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* KPI row */}
      {loading && !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Errors", value: data.total, icon: Bug },
              { label: "Critical", value: data.bySeverity.find(s => s.severity === "critical")?.count ?? 0, icon: Shield },
              { label: "High Severity", value: data.bySeverity.find(s => s.severity === "high")?.count ?? 0, icon: AlertTriangle },
              { label: "Routes Affected", value: data.topRoutes.length, icon: Route },
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">{kpi.label}</p>
                    <Icon className="h-3.5 w-3.5 text-white/20" />
                  </div>
                  <p className="text-3xl font-black text-white">{kpi.value}</p>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">Error Rate — Last 14 Days</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.errorsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="count" stroke="#f87171" strokeWidth={2} dot={{ r: 3, fill: "#f87171" }} name="Errors" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">By Severity</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data.bySeverity} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${String(name ?? "")} ${((Number(percent ?? 0)) * 100).toFixed(0)}%`} labelLine={false}>
                    {data.bySeverity.map((entry) => (
                      <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] ?? "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Routes */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">Top Error Routes</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.topRoutes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="route" width={200} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#f87171" radius={[0, 6, 6, 0]} name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Errors */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden">
            <div className="border-b border-white/[0.05] px-5 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Recent Errors</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["Timestamp", "Method", "Route", "Severity", "Message"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/20">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map(err => (
                    <tr key={err.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition">
                      <td className="px-4 py-3 text-[11px] text-white/30 whitespace-nowrap">{new Date(err.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono font-semibold text-white/40">{err.method}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] font-mono text-white/50 max-w-[180px] truncate">{err.route}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize" style={{ background: `${SEVERITY_COLORS[err.severity]}20`, color: SEVERITY_COLORS[err.severity] }}>
                          {err.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-white/40 max-w-[260px] truncate" title={err.message}>{err.message}</td>
                    </tr>
                  ))}
                  {data.recent.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-white/20">No errors recorded 🎉</td></tr>
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
