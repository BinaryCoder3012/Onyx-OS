"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Button, Input, LoadingState, Panel, StatCard } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { ResumeSection } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface ResumeData {
  version: number;
  score: number;
  sections: ResumeSection[];
  lastAnalyzedAt: string | null;
}

export function ResumeModule() {
  const qc = useQueryClient();
  const [targetRole, setTargetRole] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("onyx_target_role") ?? "";
    }
    return "";
  });

  const { data, isLoading } = useQuery({
    queryKey: ["resume"],
    queryFn: () => apiFetch<ResumeData | null>("/api/resume"),
  });

  const patchMutation = useMutation({
    mutationFn: ({ sectionId, content }: { sectionId: string; content: string }) =>
      apiFetch("/api/resume", {
        method: "PATCH",
        body: JSON.stringify({ sectionId, content }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resume"] }),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => apiFetch("/api/resume", { 
      method: "POST",
      body: JSON.stringify({ targetRole: targetRole || undefined })
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resume"] }),
  });

  if (isLoading) return <LoadingState label="Loading resume intelligence" />;
  if (!data) return <p className="font-mono text-2xs text-onyx-muted">No resume profile</p>;

  return (
    <div className="flex h-full flex-col gap-4">
      <ModuleHeader title="Resume Intelligence" subtitle="Section scoring & analysis" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <StatCard label="Score" value={data.score} suffix="/100" variant="neon" className="flex-1" />
        <div className="flex flex-1 items-end gap-3">
          <div className="flex-1 space-y-1">
            <label className="font-mono text-2xs text-onyx-subtle">Target Role (Optional)</label>
            <Input 
              placeholder="e.g. Frontend Developer" 
              value={targetRole} 
              onChange={(e) => {
                setTargetRole(e.target.value);
                localStorage.setItem("onyx_target_role", e.target.value);
              }} 
            />
          </div>
          <Button variant="accent" onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending}>
            {analyzeMutation.isPending ? "Analyzing..." : "Re-analyze"}
          </Button>
        </div>
      </div>
      <div className="grid flex-1 gap-px bg-graphite-border md:grid-cols-2">
        {data.sections.map((s) => (
          <Panel key={s.id} title={`${s.type} — ${s.score}`} className="p-3">
            <textarea
              className="min-h-[100px] w-full resize-none border border-graphite-border bg-carbon p-2 font-mono text-2xs text-onyx-fg outline-none focus:border-neon-cyan/50"
              defaultValue={s.content}
              onBlur={(e) => patchMutation.mutate({ sectionId: s.id, content: e.target.value })}
            />
          </Panel>
        ))}
      </div>
    </div>
  );
}
