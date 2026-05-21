"use client";

import { useState } from "react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Badge, Button, EmptyState, Input, LoadingState, Panel, StatCard } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Opp {
  id: string;
  title: string;
  company: string;
  type: "internship" | "full-time" | "contract";
  matchScore: number;
  url: string | null;
  discoveredAt: string;
}

export function OpportunitiesModule() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [type, setType] = useState<"internship" | "full-time" | "contract">("full-time");
  const [matchScore, setMatchScore] = useState("75");
  const [url, setUrl] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: () => apiFetch<Opp[]>("/api/opportunities"),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/opportunities", {
        method: "POST",
        body: JSON.stringify({
          title,
          company,
          type,
          matchScore: matchScore ? parseInt(matchScore, 10) : undefined,
          url: url.trim() || undefined,
        }),
      }),
    onSuccess: () => {
      setTitle("");
      setCompany("");
      setType("full-time");
      setMatchScore("75");
      setUrl("");
      qc.invalidateQueries({ queryKey: ["opportunities"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/opportunities?id=${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });

  if (isLoading || !data) return <LoadingState label="Loading opportunities radar" />;

  const avg = Math.round(data.reduce((a, o) => a + o.matchScore, 0) / Math.max(data.length, 1));

  // Filtering list
  const filteredOpps = data.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || o.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getMatchStyles = (score: number) => {
    if (score >= 85) return "border-onyx-success/40 text-onyx-success bg-onyx-success/5 font-extrabold";
    if (score >= 70) return "border-neon-cyan/40 text-neon-cyan bg-neon-cyan/5 font-bold";
    if (score >= 50) return "border-cyber-yellow/40 text-cyber-yellow bg-cyber-yellow/5";
    return "border-graphite-border/60 text-onyx-muted bg-carbon/20";
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pb-8">
      <ModuleHeader title="Opportunity Radar" subtitle="Role matching engine and application targets" />

      {/* Top dashboard summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Matched Roles" value={data.length} variant="default" />
        <StatCard label="Avg Match Score" value={avg} suffix="%" variant="cyber" />
        <StatCard 
          label="Top Tier (>=85%)" 
          value={data.filter(o => o.matchScore >= 85).length} 
          variant="neon" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel: Log New Target Role */}
        <div className="lg:col-span-4 space-y-4">
          <Panel title="Log Target Role" className="p-4 bg-carbon-light/20 backdrop-blur-md">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Role Title</label>
                <Input
                  placeholder="e.g. Senior Frontend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="font-mono text-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Company Name</label>
                <Input
                  placeholder="e.g. Vercel"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="font-mono text-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Job Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "internship" | "full-time" | "contract")}
                  className="w-full border border-graphite-border bg-carbon px-2.5 py-1.5 font-mono text-2xs text-onyx-fg outline-none focus:border-neon-cyan/50 rounded-sm"
                >
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted flex justify-between">
                  <span>Match Score</span>
                  <span className="text-neon-cyan font-bold">{matchScore}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={matchScore}
                  onChange={(e) => setMatchScore(e.target.value)}
                  className="w-full h-1 bg-graphite border border-graphite-border rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Application Link (Optional)</label>
                <Input
                  placeholder="https://company.com/careers/role"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="font-mono text-2xs"
                />
              </div>

              <Button
                variant="accent"
                className="w-full mt-2"
                onClick={() => addMutation.mutate()}
                disabled={!title.trim() || !company.trim() || addMutation.isPending}
              >
                {addMutation.isPending ? "Logging..." : "Log Target Role"}
              </Button>
            </div>
          </Panel>
        </div>

        {/* Right Panel: Role match catalog */}
        <div className="lg:col-span-8 space-y-4">
          <Panel title="Role Match Catalog" className="p-4 flex flex-col h-full bg-carbon-light/20 backdrop-blur-md">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between pb-4 border-b border-graphite-border/30">
              {/* Type Filter selector */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-graphite-border bg-carbon px-2.5 py-1 font-mono text-3xs text-onyx-muted rounded-sm outline-none focus:border-neon-cyan/50"
              >
                <option value="all">All Job Types</option>
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>

              {/* Search input */}
              <Input
                placeholder="Search by role or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs font-mono text-2xs"
              />
            </div>

            {/* List of Opportunities */}
            <div className="space-y-3 mt-4">
              {filteredOpps.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon="⬡"
                    message="No target opportunities match the criteria"
                    hint="Enter a new role or upload a resume to discover automated suggestions."
                  />
                </div>
              ) : (
                filteredOpps.map((o) => (
                  <div
                    key={o.id}
                    className="border border-graphite-border/60 bg-carbon-elevated/20 hover:border-graphite-border transition-all rounded-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {o.url ? (
                          <a
                            href={o.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs font-bold text-neon-cyan hover:underline"
                          >
                            {o.title} ↗
                          </a>
                        ) : (
                          <h4 className="font-mono text-xs font-bold text-onyx-fg">{o.title}</h4>
                        )}
                        <Badge>{o.type}</Badge>
                      </div>
                      <p className="font-mono text-2xs text-onyx-muted">at {o.company}</p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      {/* Match Ring styled capsule */}
                      <span
                        className={cn(
                          "px-3 py-1 border text-2xs font-mono rounded-full text-center flex items-center gap-1.5",
                          getMatchStyles(o.matchScore)
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {o.matchScore}% Match
                      </span>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove target ${o.title}?`)) {
                            deleteMutation.mutate(o.id);
                          }
                        }}
                        className="p-1 border border-graphite-border text-onyx-muted hover:border-onyx-danger/40 hover:text-onyx-danger transition-all rounded bg-carbon/50 text-[10px] font-mono"
                        title="Delete Role"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

