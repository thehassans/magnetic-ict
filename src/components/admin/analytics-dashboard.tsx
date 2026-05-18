"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Activity, BarChart3, RefreshCw, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type DauEntry = { date: string; count: number };
type TopEvent = { event: string; count: number };
type FunnelStep = { step: string; users: number };
type AnalyticsData = { _demo?: boolean; dau: DauEntry[]; topEvents: TopEvent[]; funnel: FunnelStep[] };

const FUNNEL_COLORS = ["#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"];
const CARD = "rounded-2xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.025]";
const TICK = { fontSize: 10, fill: "#94a3b8" };

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      setData(await res.json() as AnalyticsData);
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const totalDau = data?.dau.reduce((s, d) => s + d.count, 0) ?? 0;
  const peakDau = data?.dau.reduce((m, d) => Math.max(m, d.count), 0) ?? 0;

  const tt = isDark
    ? { background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, color: "#fff" }
    : { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12, color: "#1e293b" };

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] text-slate-400 dark:text-white/40">
          <BarChart3 className="h-3.5 w-3.5" />
          {data?._demo ? (
            <span className="flex items-center gap-1.5">
              Demo data
              <span className="rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                Add PostHog keys for real data
              </span>
            </span>
          ) : "Live from PostHog"}
        </div>
        <button
          onClick={() => void load()} disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80 transition disabled:opacity-40 shadow-sm"
        >
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">{error}</div>
      )}

      {loading && !data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-white/[0.03] animate-pulse" />)}
        </div>
      )}

      {data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Events (14d)", value: totalDau, icon: Activity },
              { label: "Peak Daily", value: peakDau, icon: TrendingUp },
              { label: "Top Event", value: data.topEvents[0]?.event ?? "—", icon: BarChart3, isText: true },
              { label: "Event Types", value: data.topEvents.length, icon: Users },
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className={`${CARD} p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25">{kpi.label}</p>
                    <Icon className="h-3.5 w-3.5 text-slate-300 dark:text-white/20" />
                  </div>
                  {kpi.isText
                    ? <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{kpi.value}</p>
                    : <p className="text-3xl font-black text-slate-900 dark:text-white">{kpi.value}</p>
                  }
                </div>
              );
            })}
          </div>

          {/* DAU */}
          <div className={`${CARD} p-5`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 mb-4">Daily Active Users — Last 14 Days</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.dau}>
                <defs>
                  <linearGradient id="dauGradL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={isDark ? 0.35 : 0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"} />
                <XAxis dataKey="date" tick={TICK} tickLine={false} axisLine={false} />
                <YAxis tick={TICK} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tt} />
                <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#dauGradL)" name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${CARD} p-5`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 mb-4">Top Events</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.topEvents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"} horizontal={false} />
                  <XAxis type="number" tick={TICK} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="event" width={160} tick={TICK} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tt} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={`${CARD} p-5`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/25 mb-4">Conversion Funnel</p>
              {data.funnel.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <FunnelChart>
                    <Tooltip contentStyle={tt} />
                    <Funnel dataKey="users" data={data.funnel} isAnimationActive>
                      {data.funnel.map((_, i) => <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />)}
                      <LabelList position="center" fill="#fff" stroke="none" dataKey="step" style={{ fontSize: 11 }} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[220px] items-center justify-center text-center">
                  <p className="text-sm text-slate-400 dark:text-white/20">Connect PostHog Insights API<br />to see conversion funnel</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
