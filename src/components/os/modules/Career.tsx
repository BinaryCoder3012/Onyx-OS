"use client";

import { useState } from "react";
import { useOnyx } from "@/lib/store";
import type { CareerGoal, GoalStatus } from "@/lib/types";
import { cn, daysUntil } from "@/lib/util";
import { Button, Empty, Input, Label, Panel, Pill, Textarea } from "@/components/ui";
import { useShell } from "../ui-store";

const ROLES = [
  { role: "Backend engineer", needs: "APIs, a relational database in depth, caching, queues, one of Go, Java or Node, and system design basics." },
  { role: "Full-stack engineer", needs: "TypeScript, React, a server framework, SQL, auth, deployment, and shipping whole features end to end." },
  { role: "Frontend engineer", needs: "Deep JavaScript and CSS, React, accessibility, performance, testing, and an eye for interaction detail." },
  { role: "SDE at a product company", needs: "Strong DSA (medium–hard under time), clean code in one language, projects with real users, and LLD/HLD rounds." },
  { role: "ML engineer", needs: "Python, linear algebra and statistics, PyTorch, data pipelines, evaluation, and serving models in production." },
  { role: "Competitive programmer", needs: "Fast implementation, number theory, graphs, DP, data structures, and a steady contest habit for rating." },
  { role: "DevOps / platform engineer", needs: "Linux, networking, containers, Kubernetes, CI/CD, infrastructure as code, and observability." },
];

const NEXT: Record<GoalStatus, GoalStatus> = { active: "done", done: "active", dropped: "active" };

function GoalRow({ g }: { g: CareerGoal }) {
  const updateGoal = useOnyx((s) => s.updateGoal);
  const removeGoal = useOnyx((s) => s.removeGoal);
  const setAsk = useShell((s) => s.setAsk);
  const left = g.due ? daysUntil(g.due) : null;
  return (
    <li className="flex gap-3 border-b border-seam py-3.5 last:border-0">
      <input
        type="checkbox"
        checked={g.status === "done"}
        onChange={() => updateGoal(g.id, { status: NEXT[g.status] })}
        className="mt-1 size-4 shrink-0 accent-[var(--color-sard)]"
        aria-label={`Mark "${g.title}" done`}
      />
      <div className="min-w-0 flex-1">
        <div className={cn("text-[14px] font-medium", g.status === "done" ? "text-chalk-3 line-through" : "text-chalk")}>{g.title}</div>
        {g.detail && <p className="mt-0.5 text-[13px] leading-relaxed text-chalk-2">{g.detail}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {g.due && (
            <Pill tone={g.status !== "active" ? undefined : left! < 0 ? "bad" : left! <= 14 ? "warn" : undefined}>
              {g.status !== "active"
                ? `Due ${g.due}`
                : left! < 0
                  ? `${-left!} days overdue`
                  : left === 0
                    ? "Due today"
                    : `${left} days left`}
            </Pill>
          )}
          {g.status === "dropped" && <Pill>Dropped</Pill>}
          {g.status === "active" && (
            <>
              <button type="button" className="text-[12px] text-chalk-3 hover:text-chalk" onClick={() => setAsk(true, `Break my goal "${g.title}" into weekly steps I can start this week.`)}>
                Break it down
              </button>
              <button type="button" className="text-[12px] text-chalk-3 hover:text-chalk" onClick={() => updateGoal(g.id, { status: "dropped" })}>
                Drop
              </button>
            </>
          )}
          <button type="button" className="text-[12px] text-chalk-3 hover:text-bad" onClick={() => removeGoal(g.id)}>
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

export function Career() {
  const goals = useOnyx((s) => s.goals);
  const addGoal = useOnyx((s) => s.addGoal);
  const targetRole = useOnyx((s) => s.profile.targetRole);
  const updateProfile = useOnyx((s) => s.updateProfile);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [due, setDue] = useState("");

  const sorted = [...goals].sort((a, b) => {
    const rank = { active: 0, done: 1, dropped: 2 };
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    return (a.due ?? "9999").localeCompare(b.due ?? "9999");
  });

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({ title: title.trim(), detail: detail.trim() || undefined, due: due || undefined });
    setTitle("");
    setDetail("");
    setDue("");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <div className="grid content-start gap-5">
        <Panel title="Add a goal">
          <form onSubmit={add} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
              <label className="block">
                <Label>Goal</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reach Codeforces Expert" required />
              </label>
              <label className="block">
                <Label hint="optional">By</Label>
                <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </label>
            </div>
            <label className="block">
              <Label hint="optional">How you will know it is done</Label>
              <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} className="min-h-[64px]" placeholder="1600+ after a rated Div 2, held for two rounds." />
            </label>
            <div>
              <Button type="submit" variant="primary" disabled={!title.trim()}>
                Add goal
              </Button>
            </div>
          </form>
        </Panel>
        <Panel title={`Goals${goals.length ? ` (${goals.filter((g) => g.status === "active").length} active)` : ""}`}>
          {goals.length === 0 ? (
            <Empty>Goals with a date are what the daily brief weighs most. Start with one for this term.</Empty>
          ) : (
            <ul>
              {sorted.map((g) => (
                <GoalRow key={g.id} g={g} />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Target role" className="self-start">
        <p className="mb-4 text-[13px] leading-relaxed text-chalk-2">
          Your target role shapes resume scoring, roadmaps and fit checks.
        </p>
        <ul className="grid gap-1.5">
          {ROLES.map((r) => {
            const on = targetRole === r.role;
            return (
              <li key={r.role}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => updateProfile({ targetRole: on ? "" : r.role })}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                    on ? "border-sard/50 bg-sard/10" : "border-seam hover:border-seam-strong",
                  )}
                >
                  <div className={cn("text-[14px]", on ? "text-chalk" : "text-chalk")}>{r.role}</div>
                  <div className="mt-0.5 text-[12px] leading-relaxed text-chalk-3">{r.needs}</div>
                </button>
              </li>
            );
          })}
        </ul>
        <label className="mt-4 block">
          <Label>Or type your own</Label>
          <Input value={targetRole} onChange={(e) => updateProfile({ targetRole: e.target.value })} placeholder="Embedded engineer" />
        </label>
      </Panel>
    </div>
  );
}
