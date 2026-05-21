"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Badge, Button, EmptyState, Input, LoadingState, Panel, StatCard } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "text-onyx-success",
  medium: "text-cyber-yellow",
  hard: "text-onyx-danger",
};

export function DSAVaultModule() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

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
        body: JSON.stringify({ title, topic, difficulty }),
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

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <ModuleHeader title="DSA Vault" subtitle="Problem tracking & topic mastery" />
        <Button 
          variant="cyber" 
          onClick={() => syncMutation.mutate()} 
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? "Syncing..." : "Sync Cloud Stats"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-px bg-graphite-border">
        <StatCard label="Solved (Local+Cloud)" value={data.vault?.problemsSolved ?? 0} variant="neon" />
        <StatCard label="Streak" value={data.vault?.streakDays ?? 0} suffix="d" variant="cyber" />
        <StatCard label="Local Tracked" value={data.problems.length} />
      </div>

      <Panel title="Add Problem" className="p-3">
        <div className="flex flex-wrap gap-2">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-xs" />
          <Input placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="max-w-[140px]" />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
            className="border border-graphite-border bg-carbon px-2 py-2 font-mono text-2xs text-onyx-fg"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <Button variant="accent" onClick={() => addMutation.mutate()} disabled={!title || !topic}>
            Add
          </Button>
        </div>
      </Panel>

      <Panel title="Problems" className="flex-1 overflow-auto p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] font-mono text-2xs">
          <thead className="border-b border-graphite-border text-onyx-subtle">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Topic</th>
              <th className="px-3 py-2">Diff</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.problems.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState icon="⬡" message="No problems tracked" hint="Add your first problem above" />
                </td>
              </tr>
            ) : (
              data.problems.map((p) => (
                <tr key={p.id} className="border-b border-graphite-border/40 hover:bg-carbon-elevated">
                  <td className="px-3 py-2 text-onyx-fg">{p.title}</td>
                  <td className="px-3 py-2 text-onyx-muted">{p.topic}</td>
                  <td className={cn("px-3 py-2 text-center uppercase", DIFFICULTY_COLOR[p.difficulty])}>
                    {p.difficulty[0]}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        statusMutation.mutate({
                          id: p.id,
                          status: p.status === "solved" ? "todo" : "solved",
                        })
                      }
                    >
                      <Badge variant={p.status === "solved" ? "neon" : "default"}>{p.status}</Badge>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </Panel>
    </div>
  );
}

