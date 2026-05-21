"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { BarChart, EmptyState, LoadingState, Panel, StatCard } from "@/components/ui";
import { MODULE_LABELS } from "@/constants/navigation";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  totalSessions: number;
  totalMinutes: number;
  avgFocus: number;
  moduleBreakdown: Array<{ moduleId: string; minutes: number; percentage: number }>;
  dailyActivity: Array<{ date: string; minutes: number }>;
}

export function AnalyticsModule() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiFetch<AnalyticsData>("/api/analytics"),
  });

  if (isLoading || !data) return <LoadingState label="Loading analytics" />;

  const moduleChart = data.moduleBreakdown.map((m) => ({
    label: MODULE_LABELS[m.moduleId as keyof typeof MODULE_LABELS] ?? m.moduleId,
    value: m.minutes,
  }));

  const dailyChart = data.dailyActivity
    .filter((d) => d.minutes > 0)
    .map((d) => ({
      label: d.date.slice(5),
      value: d.minutes,
    }));

  return (
    <div className="flex h-full flex-col gap-4">
      <ModuleHeader title="Analytics" subtitle="Study intelligence" />
      <div className="grid grid-cols-3 gap-px bg-graphite-border">
        <StatCard label="Sessions" value={data.totalSessions} />
        <StatCard label="Minutes" value={data.totalMinutes} variant="neon" />
        <StatCard label="Avg Focus" value={Math.round(data.avgFocus * 100)} suffix="%" variant="cyber" />
      </div>
      <div className="grid flex-1 grid-cols-1 gap-px bg-graphite-border lg:grid-cols-2">
        <Panel title="By Module" className="p-4">
          {moduleChart.length > 0 ? (
            <BarChart data={moduleChart} />
          ) : (
            <EmptyState icon="◈" message="No sessions yet" hint="Start studying to see module breakdown" />
          )}
        </Panel>
        <Panel title="Daily (14d)" className="p-4">
          {dailyChart.length > 0 ? (
            <BarChart data={dailyChart} />
          ) : (
            <EmptyState icon="◈" message="No activity yet" hint="Sessions appear here after your first study" />
          )}
        </Panel>
      </div>
    </div>
  );
}

