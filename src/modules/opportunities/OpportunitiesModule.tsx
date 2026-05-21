"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Badge, LoadingState, Panel, StatCard } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface Opp {
  id: string;
  title: string;
  company: string;
  type: string;
  matchScore: number;
  url: string | null;
}

export function OpportunitiesModule() {
  const { data, isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => apiFetch<Opp[]>("/api/opportunities"),
  });

  if (isLoading || !data) return <LoadingState label="Loading opportunities" />;

  const avg = Math.round(data.reduce((a, o) => a + o.matchScore, 0) / Math.max(data.length, 1));

  return (
    <div className="flex h-full flex-col gap-4">
      <ModuleHeader title="Opportunity Radar" subtitle="Role matching engine" />
      <StatCard label="Avg Match" value={avg} suffix="%" variant="cyber" className="max-w-xs" />
      <Panel title="Matches" className="flex-1 overflow-auto p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] font-mono text-2xs">
          <thead className="border-b border-graphite-border text-onyx-subtle">
            <tr>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Company</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Match</th>
            </tr>
          </thead>
          <tbody>
            {data.map((o) => (
              <tr key={o.id} className="border-b border-graphite-border/40 hover:bg-carbon-elevated">
                <td className="px-3 py-2">
                  {o.url ? (
                    <a href={o.url} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">
                      {o.title}
                    </a>
                  ) : (
                    o.title
                  )}
                </td>
                <td className="px-3 py-2 text-onyx-muted">{o.company}</td>
                <td className="px-3 py-2">
                  <Badge>{o.type}</Badge>
                </td>
                <td className="px-3 py-2 text-center text-cyber-yellow onyx-tabular">{o.matchScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Panel>
    </div>
  );
}
