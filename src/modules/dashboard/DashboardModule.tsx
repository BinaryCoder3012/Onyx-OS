"use client";

import Link from "next/link";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { BarChart, LoadingState, Panel, StatCard } from "@/components/ui";
import { MODULE_LABELS } from "@/constants/navigation";
import { apiFetch } from "@/lib/api";
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
  ratings: { leetcode: number | null; codeforces: number | null; atcoder: number | null };
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

  return (
    <div className="flex h-full flex-col gap-4">
      <ModuleHeader title="Dashboard" subtitle="System overview — operator session" />

      {suggestion && (
        <div className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-4 onyx-active-glow animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <div className="flex-1">
              <h3 className="font-mono text-xs font-bold text-neon-cyan">Daily AI Directive</h3>
              <p className="mt-1 font-sans text-sm text-onyx-fg">{suggestion.suggestion}</p>
            </div>
            <Link 
              href={suggestion.actionUrl} 
              className="rounded bg-neon-cyan px-3 py-1.5 font-mono text-2xs font-bold text-carbon transition-opacity hover:opacity-80"
            >
              {suggestion.actionLabel}
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-px bg-graphite-border lg:grid-cols-4">
        <StatCard label="Solved" value={data.problemsSolved} variant="neon" />
        <StatCard label="Streak" value={data.streakDays} suffix="days" variant="cyber" />
        <StatCard label="Study" value={data.studyMinutesWeek} suffix="min" />
        <StatCard label="Resume" value={data.resumeScore} suffix="/100" variant="neon" />
      </div>

      <div className="grid flex-1 grid-cols-12 gap-px bg-graphite-border">
        <Panel title="Activity" className="col-span-12 p-4 lg:col-span-5">
          {chartData.length > 0 ? (
            <BarChart data={chartData} />
          ) : (
            <p className="font-mono text-2xs text-onyx-subtle">No sessions yet</p>
          )}
        </Panel>
        <Panel title="Platform Ratings" className="col-span-12 p-4 lg:col-span-3">
          <div className="space-y-2 font-mono text-2xs">
            <div className="flex justify-between">
              <span className="text-onyx-muted">LeetCode</span>
              <span className="text-neon-cyan onyx-tabular">{data.ratings.leetcode ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx-muted">Codeforces</span>
              <span className="text-neon-cyan onyx-tabular">{data.ratings.codeforces ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx-muted">Goals</span>
              <span className="onyx-tabular">{data.activeGoals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-onyx-muted">Opportunities</span>
              <span className="onyx-tabular">{data.opportunities}</span>
            </div>
          </div>
        </Panel>
        <Panel title="Recent Sessions" className="col-span-12 p-4 lg:col-span-4">
          <ul className="space-y-2">
            {data.recentSessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between border-b border-graphite-border/50 py-1.5 font-mono text-2xs"
              >
                <span className="text-onyx-muted">
                  {MODULE_LABELS[s.moduleId as keyof typeof MODULE_LABELS] ?? s.moduleId}
                </span>
                <span className="text-onyx-fg onyx-tabular">
                  {formatDuration(s.durationMinutes)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
