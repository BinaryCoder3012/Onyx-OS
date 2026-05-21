"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Button, Input, LoadingState, Panel, StatCard } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { PlatformRatings } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface ProfilePayload {
  user: { displayName: string; email: string };
  profile: {
    leetcodeHandle: string | null;
    codeforcesHandle: string | null;
    githubUsername: string | null;
    ratings: PlatformRatings;
  } | null;
}

export function CPMatrixModule() {
  const qc = useQueryClient();
  const [lc, setLc] = useState("");
  const [cf, setCf] = useState("");
  const [gh, setGh] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch<ProfilePayload>("/api/profile"),
  });

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  const syncMutation = useMutation({
    mutationFn: () => apiFetch("/api/profile", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  if (isLoading || !data?.profile) return <LoadingState label="Loading CP Matrix" />;

  const p = data.profile;
  const r = p.ratings;

  return (
    <div className="flex h-full flex-col gap-4">
      <ModuleHeader title="CP Matrix" subtitle="Competitive programming profiles" />

      <div className="grid grid-cols-3 gap-px bg-graphite-border">
        <StatCard label="LeetCode" value={r.leetcode ?? 0} variant="neon" />
        <StatCard label="Codeforces" value={r.codeforces ?? 0} variant="cyber" />
        <StatCard label="AtCoder" value={r.atcoder ?? 0} />
      </div>

      <Panel title="Handles" className="p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="font-mono text-2xs text-onyx-subtle">LeetCode</label>
            <Input defaultValue={p.leetcodeHandle ?? ""} onChange={(e) => setLc(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-2xs text-onyx-subtle">Codeforces</label>
            <Input defaultValue={p.codeforcesHandle ?? ""} onChange={(e) => setCf(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-2xs text-onyx-subtle">GitHub</label>
            <Input defaultValue={p.githubUsername ?? ""} onChange={(e) => setGh(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="accent"
            onClick={() =>
              saveMutation.mutate({
                leetcodeHandle: lc || p.leetcodeHandle,
                codeforcesHandle: cf || p.codeforcesHandle,
                githubUsername: gh || p.githubUsername,
              })
            }
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? "Saving..." : "Save Handles"}
          </Button>
          <Button
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending || (!p.leetcodeHandle && !p.codeforcesHandle)}
          >
            {syncMutation.isPending ? "Syncing..." : "Sync Ratings"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}

