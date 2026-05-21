"use client";

import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Badge, Button, EmptyState, Input, LoadingState, Panel } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
}

export function CareerModule() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["career"],
    queryFn: () => apiFetch<Goal[]>("/api/career"),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/career", { method: "POST", body: JSON.stringify({ title }) }),
    onSuccess: () => {
      setTitle("");
      qc.invalidateQueries({ queryKey: ["career"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch("/api/career", {
        method: "PATCH",
        body: JSON.stringify({ goalId: id, status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["career"] }),
  });

  if (isLoading || !data) return <LoadingState label="Loading career radar" />;

  return (
    <div className="flex h-full flex-col gap-4">
      <ModuleHeader title="Career Radar" subtitle="Goals & trajectory" />
      <Panel title="New Goal" className="flex gap-2 p-3">
        <Input placeholder="Goal title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button variant="accent" onClick={() => addMutation.mutate()} disabled={!title}>
          Add
        </Button>
      </Panel>
      <Panel title="Active Goals" className="flex-1 overflow-auto p-0">
        <ul>
          {data.length === 0 ? (
            <li>
              <EmptyState icon="◉" message="No goals set" hint="Add your first career goal above" />
            </li>
          ) : (
            data.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between border-b border-graphite-border/40 px-3 py-3"
              >
                <div>
                  <p className="font-mono text-xs text-onyx-fg">{g.title}</p>
                  {g.description && (
                    <p className="mt-0.5 font-mono text-2xs text-onyx-muted">{g.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    statusMutation.mutate({
                      id: g.id,
                      status: g.status === "completed" ? "active" : "completed",
                    })
                  }
                >
                  <Badge variant={g.status === "completed" ? "neon" : "cyber"}>{g.status}</Badge>
                </button>
              </li>
            ))
          )}
        </ul>
      </Panel>
    </div>
  );
}
