"use client";
import { useState } from "react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Badge, Button, EmptyState, Input, LoadingState, Panel, StatCard } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  platform: string;
  status: string;
}

interface DSAPayload {
  vault: { problemsSolved: number; streakDays: number; topicsMastered: string[] } | null;
  problems: Problem[];
}

const DIFFICULTY_COLORS = {
  easy: "border-onyx-success/30 text-onyx-success bg-onyx-success/5",
  medium: "border-cyber-yellow/30 text-cyber-yellow bg-cyber-yellow/5",
  hard: "border-onyx-danger/30 text-onyx-danger bg-onyx-danger/5",
};

export function DSAVaultModule() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [platform, setPlatform] = useState("LeetCode");
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["dsa"],
    queryFn: () => apiFetch<DSAPayload>("/api/dsa"),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["dsa"] });

  const syncMutation = useMutation({
    mutationFn: () => apiFetch("/api/dsa/sync", { method: "POST" }),
    onSuccess: refresh,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      apiFetch<DSAPayload>("/api/dsa", {
        method: "POST",
        body: JSON.stringify({ title, topic, difficulty, platform }),
      }),
    onSuccess: () => {
      setTitle("");
      setTopic("");
      refresh();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch<DSAPayload>("/api/dsa", {
        method: "PATCH",
        body: JSON.stringify({ problemId: id, status }),
      }),
    onSuccess: refresh,
  });

  if (isLoading || !data) return <LoadingState label="Loading DSA Vault" />;

  // Get unique topics for filters
  const allTopics = Array.from(new Set(data.problems.map((p) => p.topic).filter(Boolean)));

  // Filter problems
  const filteredProblems = data.problems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "all" || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesTopic = selectedTopic === "all" || p.topic.toLowerCase() === selectedTopic.toLowerCase();
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <ModuleHeader title="DSA Vault" subtitle="Problem catalog & topic mastery log" />
        <Button 
          variant="cyber" 
          onClick={() => syncMutation.mutate()} 
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? "Syncing..." : "Sync Cloud Stats"}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatCard label="Solved (Local+Cloud)" value={data.vault?.problemsSolved ?? 0} variant="neon" />
        <StatCard label="Streak Count" value={data.vault?.streakDays ?? 0} suffix=" days" variant="cyber" />
        <StatCard label="Locally Tracked" value={data.problems.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left column: Add problem form */}
        <div className="lg:col-span-4 space-y-4">
          <Panel title="Record Solved Problem" className="p-4 bg-carbon-light/30 backdrop-blur-md">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Problem Title</label>
                <Input 
                  placeholder="e.g. 3Sum, Reverse Linked List" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Topic</label>
                  <Input 
                    placeholder="e.g. Arrays, Trees" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full border border-graphite-border bg-carbon px-2.5 py-1.5 font-mono text-2xs text-onyx-fg outline-none focus:border-neon-cyan/50"
                  >
                    <option value="LeetCode">LeetCode</option>
                    <option value="Codeforces">Codeforces</option>
                    <option value="CodeChef">CodeChef</option>
                    <option value="AtCoder">AtCoder</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "py-1 border text-center font-mono text-3xs uppercase rounded-sm transition-all",
                        difficulty === d
                          ? d === "easy"
                            ? "border-onyx-success text-onyx-success bg-onyx-success/10 font-bold"
                            : d === "medium"
                            ? "border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10 font-bold"
                            : "border-onyx-danger text-onyx-danger bg-onyx-danger/10 font-bold"
                          : "border-graphite-border/60 text-onyx-muted bg-carbon/40 hover:text-onyx-fg"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                variant="accent" 
                className="w-full mt-2"
                onClick={() => addMutation.mutate()} 
                disabled={!title.trim() || !topic.trim()}
              >
                Log Problem
              </Button>
            </div>
          </Panel>
        </div>

        {/* Right column: Filters & problem catalog */}
        <div className="lg:col-span-8 space-y-4">
          <Panel title="Problem Catalog" className="p-4 flex flex-col h-full bg-carbon-light/20 backdrop-blur-md">
            {/* Search and Filters toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between pb-4 border-b border-graphite-border/30">
              <Input
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs font-mono text-2xs"
              />

              <div className="flex gap-2">
                {/* Difficulty selector */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="border border-graphite-border bg-carbon px-2 py-1 font-mono text-3xs text-onyx-muted rounded-sm outline-none focus:border-neon-cyan/50"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                {/* Topic selector */}
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="border border-graphite-border bg-carbon px-2 py-1 font-mono text-3xs text-onyx-muted rounded-sm outline-none focus:border-neon-cyan/50 max-w-[120px] sm:max-w-xs"
                >
                  <option value="all">All Topics</option>
                  {allTopics.map((t) => (
                    <option key={t} value={t.toLowerCase()}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Problem listing */}
            <div className="overflow-x-auto mt-2">
              {filteredProblems.length === 0 ? (
                <div className="py-12">
                  <EmptyState 
                    icon="⬡" 
                    message="No matching problems found" 
                    hint="Adjust your filters or record a new solved problem." 
                  />
                </div>
              ) : (
                <table className="w-full font-mono text-2xs text-left">
                  <thead>
                    <tr className="border-b border-graphite-border text-onyx-subtle">
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-3xs">Title</th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-3xs">Topic</th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-3xs">Platform</th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-3xs text-center">Diff</th>
                      <th className="px-3 py-2.5 font-bold uppercase tracking-wider text-3xs text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.map((p) => (
                      <tr 
                        key={p.id} 
                        className="border-b border-graphite-border/30 hover:bg-carbon-elevated/40 transition-all"
                      >
                        <td className="px-3 py-3 font-bold text-onyx-fg">{p.title}</td>
                        <td className="px-3 py-3 text-onyx-subtle">{p.topic}</td>
                        <td className="px-3 py-3">
                          <span className="px-1.5 py-0.5 border border-graphite-border bg-graphite/20 text-onyx-muted rounded text-3xs">
                            {p.platform || "LeetCode"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={cn("px-2 py-0.5 border text-3xs rounded-full font-bold uppercase", DIFFICULTY_COLORS[p.difficulty.toLowerCase() as "easy"|"medium"|"hard"] || DIFFICULTY_COLORS.medium)}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              statusMutation.mutate({
                                id: p.id,
                                status: p.status === "solved" ? "todo" : "solved",
                              })
                            }
                            className="cursor-pointer"
                          >
                            <Badge variant={p.status === "solved" ? "neon" : "default"}>
                              {p.status === "solved" ? "Solved ✓" : "Todo ○"}
                            </Badge>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
