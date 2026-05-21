"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Badge, LoadingState, Panel } from "@/components/ui";
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

  if (isLoading || !data) return <LoadingState label="Loading roadmap" />;

  return (
    <div className="flex h-full flex-col gap-4">
      <ModuleHeader title="Roadmap Engine" subtitle="Learning path progression" />
      <Panel title="Path" className="flex-1 overflow-auto p-2">
        {data.map((node) => (
          <NodeRow
            key={node.id}
            node={node}
            depth={0}
            onStatus={(id, status) => patchMutation.mutate({ nodeId: id, status })}
          />
        ))}
      </Panel>
    </div>
  );
}
