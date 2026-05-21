"use client";

import { useState } from "react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Badge, Button, EmptyState, Input, LoadingState, Panel } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "completed" | "archived";
  priority: number;
}

const PRIORITY_LABELS: Record<number, string> = {
  1: "Critical",
  2: "High",
  3: "Medium",
  4: "Low",
  5: "Low",
};

const PRIORITY_COLORS: Record<number, string> = {
  1: "border-onyx-danger/30 text-onyx-danger bg-onyx-danger/10",
  2: "border-cyber-yellow/30 text-cyber-yellow bg-cyber-yellow/10",
  3: "border-neon-cyan/30 text-neon-cyan bg-neon-cyan/10",
  4: "border-graphite-border text-onyx-muted bg-graphite/10",
  5: "border-graphite-border text-onyx-muted bg-graphite/10",
};

export function CareerModule() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "archived" | "all">("active");

  const { data, isLoading } = useQuery({
    queryKey: ["career"],
    queryFn: () => apiFetch<Goal[]>("/api/career"),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["career"] });

  const addMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/career", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description.trim() || undefined,
          priority,
        }),
      }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setPriority(3);
      refresh();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch("/api/career", {
        method: "PATCH",
        body: JSON.stringify({ goalId: id, status }),
      }),
    onSuccess: refresh,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/career?id=${id}`, {
        method: "DELETE",
      }),
    onSuccess: refresh,
  });

  if (isLoading || !data) return <LoadingState label="Loading career radar" />;

  // Filter and Search logic
  const filteredGoals = data.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || g.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pb-8">
      <ModuleHeader title="Career Radar" subtitle="Log and track target milestones, priority roadmaps, and career goals" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column: Add/Configure target goal */}
        <div className="lg:col-span-4 space-y-4">
          <Panel title="Set Target Goal" className="p-4 bg-carbon-light/20 backdrop-blur-md">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Goal Title</label>
                <Input
                  placeholder="e.g. Master System Design"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="font-mono text-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Description (Optional)</label>
                <textarea
                  placeholder="Detail the actionable steps or certification links..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px] border border-graphite-border bg-carbon px-2.5 py-1.5 font-mono text-2xs text-onyx-fg outline-none focus:border-neon-cyan/50 rounded-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-mono text-3xs uppercase tracking-wider text-onyx-muted">Priority Tier</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "py-1.5 border text-center font-mono text-2xs rounded-sm transition-all font-bold",
                        priority === p
                          ? p === 1
                            ? "border-onyx-danger text-onyx-danger bg-onyx-danger/10"
                            : p === 2
                            ? "border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10"
                            : p === 3
                            ? "border-neon-cyan text-neon-cyan bg-neon-cyan/10"
                            : "border-onyx-fg text-onyx-fg bg-onyx-fg/10"
                          : "border-graphite-border/60 text-onyx-muted bg-carbon/40 hover:text-onyx-fg"
                      )}
                    >
                      P{p}
                    </button>
                  ))}
                </div>
                <p className="mt-1 font-mono text-[9px] text-onyx-muted text-right">
                  P1 (Critical) → P5 (Low)
                </p>
              </div>

              <Button
                variant="accent"
                className="w-full mt-2"
                onClick={() => addMutation.mutate()}
                disabled={!title.trim() || addMutation.isPending}
              >
                {addMutation.isPending ? "Adding..." : "Log Career Goal"}
              </Button>
            </div>
          </Panel>
        </div>

        {/* Right column: Active Goals and filters */}
        <div className="lg:col-span-8 space-y-4">
          <Panel title="Milestones Radar" className="p-4 flex flex-col h-full bg-carbon-light/20 backdrop-blur-md">
            {/* Toolbar: Tabs & Search */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between pb-4 border-b border-graphite-border/30">
              {/* Tabs */}
              <div className="flex border border-graphite-border rounded-sm overflow-hidden p-0.5 bg-carbon/40">
                {(["active", "completed", "archived", "all"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-1 font-mono text-3xs uppercase tracking-wider transition-all rounded-sm",
                      activeTab === tab
                        ? "bg-graphite text-neon-cyan font-bold"
                        : "text-onyx-muted hover:text-onyx-fg"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search */}
              <Input
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs font-mono text-2xs"
              />
            </div>

            {/* List of Goals */}
            <div className="space-y-3 mt-4">
              {filteredGoals.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon="⬡"
                    message={`No ${activeTab !== "all" ? activeTab : ""} goals found`}
                    hint="Define a new goal in the left panel to kickstart your tracking."
                  />
                </div>
              ) : (
                filteredGoals.map((g) => (
                  <div
                    key={g.id}
                    className="border border-graphite-border/60 bg-carbon-elevated/20 hover:border-graphite-border transition-all rounded-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "px-2 py-0.5 border text-[9px] font-mono rounded font-bold uppercase tracking-wider",
                            PRIORITY_COLORS[g.priority] || PRIORITY_COLORS[4]
                          )}
                        >
                          P{g.priority} - {PRIORITY_LABELS[g.priority] || "Low"}
                        </span>
                        <h4 className={cn("font-mono text-xs font-bold", g.status === "completed" ? "line-through text-onyx-muted" : "text-onyx-fg")}>
                          {g.title}
                        </h4>
                      </div>
                      {g.description && (
                        <p className="font-mono text-2xs text-onyx-muted leading-relaxed whitespace-pre-wrap">
                          {g.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Cycle Status badge */}
                      <button
                        type="button"
                        onClick={() =>
                          statusMutation.mutate({
                            id: g.id,
                            status:
                              g.status === "active"
                                ? "completed"
                                : g.status === "completed"
                                ? "archived"
                                : "active",
                          })
                        }
                        className="cursor-pointer"
                        title="Click to cycle status"
                      >
                        <Badge
                          variant={
                            g.status === "completed"
                              ? "success"
                              : g.status === "archived"
                              ? "default"
                              : "neon"
                          }
                        >
                          {g.status}
                        </Badge>
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this career goal?")) {
                            deleteMutation.mutate(g.id);
                          }
                        }}
                        className="p-1 border border-graphite-border text-onyx-muted hover:border-onyx-danger/40 hover:text-onyx-danger transition-all rounded bg-carbon/50 text-[10px] font-mono"
                        title="Delete Goal"
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

