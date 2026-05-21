"use client";

import Link from "next/link";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { BarChart, LoadingState, Panel, StatCard } from "@/components/ui";
import { MODULE_LABELS } from "@/constants/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { formatDuration } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  problemsSolved: number;
  totalProblems: number;
  streakDays: number;
  topicsMastered: number;
  studyMinutesWeek: number;
  activeGoals: number;
  opportunities: number;
  resumeScore: number;
  ratings: { leetcode: number | null; codeforces: number | null; codechef: number | null; atcoder: number | null };
  recentSessions: Array<{
    id: string;
    moduleId: string;
    durationMinutes: number;
    focusScore: number;
    startedAt: string;
  }>;
}

interface Suggestion {
  suggestion: string;
  actionUrl: string;
  actionLabel: string;
}

export function DashboardModule() {
  const { data: authData } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<DashboardStats>("/api/dashboard"),
  });

  const { data: suggestion } = useQuery({
    queryKey: ["suggestion"],
    queryFn: () => apiFetch<Suggestion>("/api/dashboard/suggestion"),
  });

  if (isLoading || !data) return <LoadingState label="Loading dashboard" />;

  const chartData = data.recentSessions.slice(0, 5).map((s) => ({
    label: MODULE_LABELS[s.moduleId as keyof typeof MODULE_LABELS] ?? s.moduleId,
    value: s.durationMinutes,
  }));

  const userDisplayName = authData?.user?.displayName ?? "Operator";

  return (
    <div className="flex h-full flex-col gap-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-neon-cyan uppercase">
          Command Deck v0.1
        </span>
        <h2 className="font-mono text-lg font-bold tracking-tight text-white uppercase">
          Welcome back, <span className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">{userDisplayName}</span>.
        </h2>
        <p className="font-mono text-2xs text-onyx-muted">
          All system modules operational. Initialized secure token session.
        </p>
      </div>

      {suggestion && (
        <div className="relative overflow-hidden rounded border border-neon-cyan/20 bg-gradient-to-r from-neon-cyan/10 via-neon-cyan/[0.02] to-transparent p-5 shadow-[0_0_20px_rgba(0,240,255,0.05)] animate-slide-in-up">
          <div className="absolute top-0 left-0 h-full w-[2px] bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <span className="text-2xl animate-pulse">✨</span>
            <div className="flex-1">
              <h3 className="font-mono text-xs font-extrabold uppercase tracking-wider text-neon-cyan">
                AI System Directive
              </h3>
              <p className="mt-1 font-sans text-sm text-onyx-fg leading-relaxed">
                {suggestion.suggestion}
              </p>
            </div>
            <Link 
              href={suggestion.actionUrl} 
              className="self-start md:self-auto rounded bg-neon-cyan px-4 py-2 font-mono text-2xs font-extrabold text-carbon tracking-wider uppercase transition-all duration-300 hover:bg-white hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              {suggestion.actionLabel}
            </Link>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Problems Solved" value={data.problemsSolved} variant="neon" />
        <StatCard label="Consistency Streak" value={data.streakDays} suffix="days" variant="cyber" />
        <StatCard label="Weekly Focus Time" value={data.studyMinutesWeek} suffix="min" />
        <StatCard label="Resume Match Score" value={data.resumeScore} suffix="/100" variant="neon" />
      </div>

      {/* Grid of detail panels */}
      <div className="grid grid-cols-12 gap-4 flex-1">
        <Panel title="Activity Insights" subtitle="Minutes spent per module" className="col-span-12 lg:col-span-5">
          {chartData.length > 0 ? (
            <div className="py-2">
              <BarChart data={chartData} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="font-mono text-2xs text-onyx-subtle uppercase tracking-wider">
                No session telemetry available
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Coding Profiles" subtitle="Live competitive ratings" className="col-span-12 lg:col-span-3">
          <div className="space-y-3.5 py-1">
            <div className="flex justify-between items-center border-b border-graphite-border/30 pb-2">
              <span className="font-mono text-[10px] uppercase text-onyx-muted tracking-wider">LeetCode</span>
              <span className="font-mono text-xs font-bold text-neon-cyan onyx-tabular drop-shadow-[0_0_4px_rgba(0,240,255,0.2)]">
                {data.ratings.leetcode ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-graphite-border/30 pb-2">
              <span className="font-mono text-[10px] uppercase text-onyx-muted tracking-wider">Codeforces</span>
              <span className="font-mono text-xs font-bold text-cyber-yellow onyx-tabular drop-shadow-[0_0_4px_rgba(245,230,66,0.2)]">
                {data.ratings.codeforces ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-graphite-border/30 pb-2">
              <span className="font-mono text-[10px] uppercase text-onyx-muted tracking-wider">CodeChef</span>
              <span className="font-mono text-xs font-bold text-cyber-yellow onyx-tabular">
                {data.ratings.codechef ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-graphite-border/30 pb-2">
              <span className="font-mono text-[10px] uppercase text-onyx-muted tracking-wider">AtCoder</span>
              <span className="font-mono text-xs font-bold text-neon-cyan onyx-tabular">
                {data.ratings.atcoder ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 font-mono text-[10px] uppercase tracking-wide text-onyx-muted">
              <span>Goals In Progress</span>
              <span className="text-white font-bold onyx-tabular">{data.activeGoals}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Recent Activities" subtitle="Operator history log" className="col-span-12 lg:col-span-4">
          <ul className="space-y-3">
            {data.recentSessions.length > 0 ? (
              data.recentSessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between border-b border-graphite-border/40 pb-2 font-mono text-2xs transition-colors hover:border-graphite-border"
                >
                  <span className="text-onyx-muted uppercase tracking-wider font-semibold">
                    {MODULE_LABELS[s.moduleId as keyof typeof MODULE_LABELS] ?? s.moduleId}
                  </span>
                  <span className="text-white font-bold onyx-tabular">
                    {formatDuration(s.durationMinutes)}
                  </span>
                </li>
              ))
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="font-mono text-2xs text-onyx-subtle uppercase tracking-wider">
                  No recent activities logged
                </p>
              </div>
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
