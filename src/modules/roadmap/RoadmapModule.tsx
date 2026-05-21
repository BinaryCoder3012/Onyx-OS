"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Badge, Button, EmptyState, LoadingState, Panel } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { RoadmapNode } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function NodeRow({
  node,
  depth,
  onStatus,
}: {
  node: RoadmapNode;
  depth: number;
  onStatus: (id: string, status: RoadmapNode["status"]) => void;
}) {
  const next: Record<RoadmapNode["status"], RoadmapNode["status"]> = {
    locked: "active",
    active: "complete",
    complete: "locked",
  };
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between border-b border-graphite-border/40 py-2 font-mono text-2xs",
          depth > 0 && "pl-4"
        )}
        style={{ paddingLeft: depth * 16 + 12 }}
      >
        <span className={node.status === "complete" ? "text-neon-cyan" : "text-onyx-fg"}>
          {node.title}
        </span>
        <button type="button" onClick={() => onStatus(node.id, next[node.status])}>
          <Badge
            variant={
              node.status === "complete" ? "neon" : node.status === "active" ? "cyber" : "default"
            }
          >
            {node.status}
          </Badge>
        </button>
      </div>
      {node.children.map((child) => (
        <NodeRow key={child.id} node={child} depth={depth + 1} onStatus={onStatus} />
      ))}
    </>
  );
}

export function RoadmapModule() {
  const qc = useQueryClient();
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
    mutationFn: () => {
      const targetRole = localStorage.getItem("onyx_target_role") || "Software Engineer";
      return apiFetch<RoadmapNode[]>("/api/roadmap/generate", {
        method: "POST",
        body: JSON.stringify({ targetRole }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap"] }),
  });

  if (isLoading || !data) return <LoadingState label="Loading roadmap" />;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex justify-between items-center">
        <ModuleHeader title="Roadmap Engine" subtitle="Learning path progression" />
        <Button 
          variant="cyber" 
          onClick={() => generateMutation.mutate()} 
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? "Generating..." : "Regenerate AI Plan"}
        </Button>
      </div>
      
      <Panel title="Path" className="flex-1 overflow-auto p-2">
        {data.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-4">
            <EmptyState 
              icon="⎈" 
              message="No Roadmap Found" 
              hint="Generate an AI roadmap based on your resume and goals." 
            />
            <Button 
              variant="accent" 
              onClick={() => generateMutation.mutate()} 
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? "Generating AI Plan..." : "Generate Initial Plan"}
            </Button>
          </div>
        ) : (
          data.map((node) => (
            <NodeRow
              key={node.id}
              node={node}
              depth={0}
              onStatus={(id, status) => patchMutation.mutate({ nodeId: id, status })}
            />
          ))
        )}
      </Panel>
    </div>
  );
}
