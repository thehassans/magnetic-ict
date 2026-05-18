"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Activity, BarChart3, RefreshCw, TrendingUp, Users } from "lucide-react";

type DauEntry = { date: string; count: number };
type TopEvent = { event: string; count: number };
type FunnelStep = { step: string; users: number };
type AnalyticsData = {
  _demo?: boolean;
  dau: DauEntry[];
  topEvents: TopEvent[];
  funnel: FunnelStep[];
};

const FUNNEL_COLORS = ["#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"];
const AREA_COLORS = ["#7c3aed"];

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      setData(await res.json() as AnalyticsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const totalDau = data?.dau.reduce((s, d) => s + d.count, 0) ?? 0;
  const peakDau = data?.dau.reduce((m, d) => Math.max(m, d.count), 0) ?? 0;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-transparent p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-violet-500" />
            Analytics & Engagement
          </h1>
          <p className="text-sm text-gray-500 dark:text-white/40 mt-0.5">
            User lifecycle events and engagement metrics
            {data?._demo && (
              <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                DEMO DATA — Add PostHog keys for real data
              </span>
            )}
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
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-5 py-4 text-sm text-rose-700 dark:text-rose-300">
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
              { label: "Total Events (14d)", value: totalDau, icon: Activity, color: "violet" },
              { label: "Peak Daily", value: peakDau, icon: TrendingUp, color: "emerald" },
              { label: "Top Event", value: data.topEvents[0]?.event ?? "—", icon: BarChart3, color: "sky", isText: true },
              { label: "Event Types", value: data.topEvents.length, icon: Users, color: "amber" },
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">{kpi.label}</p>
                    <Icon className="h-4 w-4 text-gray-400 dark:text-white/25" />
                  </div>
                  {kpi.isText
                    ? <p className="text-base font-bold text-gray-900 dark:text-white truncate">{kpi.value}</p>
                    : <p className="text-4xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
                  }
                </div>
              );
            })}
          </div>

          {/* DAU Chart */}
          <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-4">Daily Active Users — Last 14 Days</p>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.dau}>
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke={AREA_COLORS[0]} strokeWidth={2} fill="url(#dauGrad)" name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Events */}
            <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-4">Top Events</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.topEvents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} />
                  <YAxis type="category" dataKey="event" width={160} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Funnel */}
            <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-white/[0.025] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-4">Conversion Funnel</p>
              {data.funnel.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <FunnelChart>
                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                    <Funnel dataKey="users" data={data.funnel} isAnimationActive>
                      {data.funnel.map((_, index) => (
                        <Cell key={index} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                      ))}
                      <LabelList position="center" fill="#fff" stroke="none" dataKey="step" style={{ fontSize: 11 }} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[220px] text-center">
                  <p className="text-sm text-gray-400 dark:text-white/30">
                    Funnel data requires PostHog Insights API.<br />
                    <span className="text-[11px] mt-1 block text-gray-300 dark:text-white/20">Connect PostHog to see conversion rates.</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
