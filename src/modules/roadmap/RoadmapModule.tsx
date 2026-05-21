"use client";
import { useState, useEffect } from "react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Badge, Button, EmptyState, LoadingState, Panel } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { RoadmapNode } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function RoadmapModule() {
  const qc = useQueryClient();
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [roleInput, setRoleInput] = useState("Software Engineer");

  // Load target role on mount
  useEffect(() => {
    const saved = localStorage.getItem("onyx_target_role");
    if (saved) {
      setTargetRole(saved);
      setRoleInput(saved);
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["roadmap"],
    queryFn: () => apiFetch<RoadmapNode[]>("/api/roadmap"),
  });

  const patchMutation = useMutation({
    mutationFn: ({ nodeId, status }: { nodeId: string; status: RoadmapNode["status"] }) =>
      apiFetch<RoadmapNode[]>("/api/roadmap", {
        method: "PATCH",
        body: JSON.stringify({ nodeId, status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap"] }),
  });

  const generateMutation = useMutation({
    mutationFn: (role: string) => {
      localStorage.setItem("onyx_target_role", role);
      setTargetRole(role);
      return apiFetch<RoadmapNode[]>("/api/roadmap/generate", {
        method: "POST",
        body: JSON.stringify({ targetRole: role }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmap"] });
      setIsEditingRole(false);
    },
  });

  const handleRoleSave = () => {
    if (roleInput.trim()) {
      generateMutation.mutate(roleInput.trim());
    }
  };

  const getPhaseProgress = (phase: RoadmapNode) => {
    if (!phase.children || phase.children.length === 0) {
      return phase.status === "complete" ? 100 : 0;
    }
    const complete = phase.children.filter((c) => c.status === "complete").length;
    return Math.round((complete / phase.children.length) * 100);
  };

  const getStatusBorderClass = (status: RoadmapNode["status"]) => {
    switch (status) {
      case "complete":
        return "border-neon-cyan/45 shadow-[0_0_15px_rgba(0,240,255,0.02)] bg-neon-cyan/3";
      case "active":
        return "border-cyber-yellow/45 shadow-[0_0_15px_rgba(245,230,66,0.02)] bg-cyber-yellow/3";
      default:
        return "border-graphite-border/30 bg-carbon/20 opacity-80";
    }
  };



  if (isLoading || !data) return <LoadingState label="Loading your career roadmap" />;

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pb-8">
      {/* Header controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ModuleHeader title="Roadmap Engine" subtitle="Structured AI progression framework" />
        
        {data.length > 0 && (
          <Button
            variant="cyber"
            onClick={() => generateMutation.mutate(targetRole)}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? "Generating..." : "Regenerate AI Plan"}
          </Button>
        )}
      </div>

      {/* Target career selector */}
      <Panel title="Active Career Target" className="p-4 bg-carbon-light/30 backdrop-blur-md border-graphite-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-onyx-muted">Target Career Objective</span>
            {isEditingRole ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="bg-carbon border border-graphite-border px-3 py-1 font-mono text-2xs text-onyx-fg outline-none focus:border-neon-cyan/50 max-w-xs"
                  placeholder="e.g. Frontend Developer"
                />
                <Button variant="neon" className="px-3 py-1 text-3xs" onClick={handleRoleSave} disabled={generateMutation.isPending}>
                  Save & Regenerate
                </Button>
                <Button variant="ghost" className="px-3 py-1 text-3xs" onClick={() => { setIsEditingRole(false); setRoleInput(targetRole); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs font-bold text-neon-cyan">{targetRole}</p>
                <button
                  onClick={() => setIsEditingRole(true)}
                  className="font-mono text-3xs text-onyx-muted hover:text-onyx-fg underline cursor-pointer"
                >
                  Change Target
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="text-left font-mono">
              <span className="block text-[9px] text-onyx-muted uppercase">Phases</span>
              <span className="text-xs font-bold text-onyx-fg">{data.length}</span>
            </div>
            <div className="text-left font-mono">
              <span className="block text-[9px] text-onyx-muted uppercase">Total Milestones</span>
              <span className="text-xs font-bold text-onyx-fg">
                {data.reduce((acc, curr) => acc + (curr.children?.length || 0), 0)}
              </span>
            </div>
            <div className="text-left font-mono">
              <span className="block text-[9px] text-onyx-muted uppercase">Completed</span>
              <span className="text-xs font-bold text-neon-cyan">
                {data.reduce(
                  (acc, curr) =>
                    acc + (curr.children?.filter((c) => c.status === "complete").length || 0),
                  0
                )}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Main Roadmap Timeline */}
      <div className="flex-1">
        {data.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-4 max-w-md text-center">
              <EmptyState
                icon="⎈"
                message="No Learning Roadmap Found"
                hint="Provide a target career role to generate a customized step-by-step roadmap."
              />
              <div className="flex items-center gap-2 w-full mt-2 justify-center">
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="bg-carbon border border-graphite-border px-3 py-2 font-mono text-2xs text-onyx-fg outline-none focus:border-neon-cyan/50 max-w-[200px]"
                  placeholder="Target Role"
                />
                <Button
                  variant="neon"
                  onClick={handleRoleSave}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? "Generating Plan..." : "Generate AI Plan"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l border-graphite-border/30 space-y-12 ml-4 mt-4">
            {data.map((phase, phaseIdx) => {
              const progress = getPhaseProgress(phase);
              return (
                <div key={phase.id} className="relative">
                  {/* Timeline bullet for the Phase */}
                  <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-graphite-border bg-carbon text-[10px] font-mono font-bold text-onyx-muted shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    {phaseIdx + 1}
                  </span>

                  {/* Phase Glassmorphic Card */}
                  <div className="border border-graphite-border bg-carbon-light/10 p-5 rounded-md space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono text-2xs font-bold text-onyx-fg">{phase.title}</h3>
                          {phase.duration && (
                            <Badge variant="default" className="font-mono text-[9px]">
                              ⏱ {phase.duration}
                            </Badge>
                          )}
                        </div>
                        {phase.description && (
                          <p className="font-mono text-3xs text-onyx-muted leading-relaxed max-w-2xl">
                            {phase.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-3xs text-onyx-subtle">Phase progress:</span>
                        <span className="font-mono text-2xs font-bold text-neon-cyan">{progress}%</span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-full h-1 bg-graphite-border/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neon-cyan rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Milestones inside Phase */}
                    <div className="grid gap-3 sm:grid-cols-2 mt-4">
                      {phase.children?.map((child) => (
                        <div
                          key={child.id}
                          className={cn(
                            "border p-3 rounded flex flex-col justify-between transition-all duration-300 hover:border-graphite-muted",
                            getStatusBorderClass(child.status)
                          )}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-1">
                              {child.duration && (
                                <span className="font-mono text-[9px] text-onyx-subtle">
                                  ⏱ {child.duration}
                                </span>
                              )}
                              <Badge
                                variant={
                                  child.status === "complete"
                                    ? "neon"
                                    : child.status === "active"
                                    ? "cyber"
                                    : "default"
                                }
                                className="text-[9px]"
                              >
                                {child.status}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-mono text-2xs font-bold text-onyx-fg">
                                {child.title}
                              </h4>
                              {child.description && (
                                <p className="font-mono text-[10px] text-onyx-muted leading-relaxed">
                                  {child.description}
                                </p>
                              )}
                            </div>

                            {/* Resources */}
                            {child.resources && child.resources.length > 0 && (
                              <div className="space-y-1 pt-1.5 border-t border-graphite-border/20">
                                <span className="block font-mono text-[8px] uppercase tracking-wider text-onyx-subtle">
                                  Learning Resources:
                                </span>
                                <ul className="space-y-0.5">
                                  {child.resources.map((res, resIdx) => (
                                    <li
                                      key={resIdx}
                                      className="font-mono text-[9px] text-neon-cyan flex items-center gap-1.5 hover:underline cursor-pointer"
                                    >
                                      <span>🔗</span>
                                      <span className="truncate max-w-[200px]">{res}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Quick action button for milestone status */}
                          <div className="flex justify-end pt-3">
                            <Button
                              variant={child.status === "complete" ? "ghost" : child.status === "active" ? "neon" : "outline"}
                              className="px-2.5 py-1 text-3xs font-mono"
                              onClick={() => {
                                const nextStatus: Record<RoadmapNode["status"], RoadmapNode["status"]> = {
                                  locked: "active",
                                  active: "complete",
                                  complete: "locked",
                                };
                                patchMutation.mutate({
                                  nodeId: child.id,
                                  status: nextStatus[child.status],
                                });
                              }}
                            >
                              {child.status === "locked" && "Start"}
                              {child.status === "active" && "Complete"}
                              {child.status === "complete" && "Reset"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
