"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useOnyx } from "@/lib/store";
import { workspaceSnapshot } from "@/lib/context";
import type { Roadmap as RoadmapT } from "@/lib/types";
import { cn, readError, uid } from "@/lib/util";
import { Button, ErrorLine, Input, Label, Meter, Panel, Select, Spinner } from "@/components/ui";
import { useShell } from "../ui-store";

gsap.registerPlugin(useGSAP);

const GOALS = [
  "Reach Codeforces Expert (1600)",
  "Crack product-company SDE interviews",
  "Become a backend engineer (Go, Postgres)",
  "Become a full-stack engineer (TypeScript, React, Node)",
  "Get into ML engineering",
  "Learn system design for senior interviews",
];

function Planner({ onCancel }: { onCancel?: () => void }) {
  const setRoadmap = useOnyx((s) => s.setRoadmap);
  const targetRole = useOnyx((s) => s.profile.targetRole);
  const [goal, setGoal] = useState(targetRole ? `Become a ${targetRole}` : "");
  const [level, setLevel] = useState<"new" | "some" | "solid">("some");
  const [hours, setHours] = useState(10);
  const [weeks, setWeeks] = useState(12);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function plan(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, level, hoursPerWeek: hours, weeks, context: workspaceSnapshot(useOnyx.getState()).slice(0, 5800) }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = (await res.json()) as { phases: { title: string; summary: string; weeks: number; steps: { title: string; detail: string; resources: string[] }[] }[] };
      const roadmap: RoadmapT = {
        goal,
        hoursPerWeek: hours,
        createdAt: Date.now(),
        phases: data.phases.map((ph) => ({ ...ph, id: uid(), steps: ph.steps.map((st) => ({ ...st, id: uid(), done: false })) })),
      };
      setRoadmap(roadmap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not plan the roadmap.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Plan a roadmap" className="max-w-[760px]">
      <form onSubmit={plan} className="grid gap-5">
        <label className="block">
          <Label>What are you aiming for?</Label>
          <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Become a backend engineer (Go, Postgres)" required minLength={3} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {GOALS.map((g) => (
              <button key={g} type="button" onClick={() => setGoal(g)} className="rounded-md border border-seam-strong px-2 py-1 text-[12px] text-chalk-2 hover:text-chalk">
                {g}
              </button>
            ))}
          </div>
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <Label>Where you are</Label>
            <Select value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
              <option value="new">Just starting</option>
              <option value="some">Built a few things</option>
              <option value="solid">Working professionally</option>
            </Select>
          </label>
          <label className="block">
            <Label hint={`${hours} h`}>Hours a week</Label>
            <input type="range" min={2} max={40} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="mt-2 w-full accent-[var(--color-sard)]" />
          </label>
          <label className="block">
            <Label hint={`${weeks} weeks`}>For how long</Label>
            <input type="range" min={4} max={52} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))} className="mt-2 w-full accent-[var(--color-sard)]" />
          </label>
        </div>
        <p className="text-[13px] leading-relaxed text-chalk-3">
          The plan takes your logged problems, ratings and resume into account, so it skips what you already know.
        </p>
        <ErrorLine>{error}</ErrorLine>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={busy || goal.trim().length < 3}>
            {busy ? (
              <>
                <Spinner className="border-onyx/40 border-t-transparent" /> Planning, about 20 seconds
              </>
            ) : (
              "Plan it"
            )}
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Keep the current plan
            </Button>
          )}
        </div>
      </form>
    </Panel>
  );
}

export function Roadmap() {
  const roadmap = useOnyx((s) => s.roadmap);
  const toggleStep = useOnyx((s) => s.toggleStep);
  const setAsk = useShell((s) => s.setAsk);
  const [replanning, setReplanning] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!roadmap) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".phase", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: "expo.out" });
      });
    },
    { scope: root, dependencies: [roadmap?.createdAt] },
  );

  if (!roadmap || replanning) return <Planner onCancel={roadmap ? () => setReplanning(false) : undefined} />;

  const steps = roadmap.phases.flatMap((p) => p.steps);
  const done = steps.filter((s) => s.done).length;
  const currentPhase = roadmap.phases.find((p) => p.steps.some((s) => !s.done));
  const phaseStart = roadmap.phases.map((_, i) => roadmap.phases.slice(0, i).reduce((a, p) => a + p.weeks, 0));

  return (
    <div ref={root} className="grid gap-5">
      <section className="flex flex-col gap-4 rounded-xl border border-seam bg-slab p-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="text-[13px] text-chalk-2">Roadmap</div>
          <h2 className="mt-1 font-display text-[24px] leading-tight font-semibold">{roadmap.goal}</h2>
          <div className="mt-1 text-[13px] text-chalk-3">
            {roadmap.hoursPerWeek} hours a week · {roadmap.phases.reduce((a, p) => a + p.weeks, 0)} weeks · planned{" "}
            {new Date(roadmap.createdAt).toLocaleDateString("en", { day: "numeric", month: "short" })}
          </div>
        </div>
        <div className="w-full md:w-[280px]">
          <div className="mb-2 flex items-baseline justify-between text-[13px]">
            <span className="text-chalk-2">{currentPhase ? `Now: ${currentPhase.title}` : "Finished"}</span>
            <span className="num text-chalk">
              {done} of {steps.length}
            </span>
          </div>
          <Meter value={(done / Math.max(1, steps.length)) * 100} />
          <div className="mt-3 flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => setReplanning(true)}>
              Plan again
            </Button>
          </div>
        </div>
      </section>

      <ol className="grid gap-4">
        {roadmap.phases.map((ph, i) => {
          const from = phaseStart[i] + 1;
          const to = phaseStart[i] + ph.weeks;
          const phDone = ph.steps.filter((s) => s.done).length;
          const isCurrent = ph.id === currentPhase?.id;
          return (
            <li key={ph.id} className={cn("phase rounded-xl border bg-slab", isCurrent ? "border-sard/40" : "border-seam")}>
              <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-seam px-5 py-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-chalk">{ph.title}</h3>
                  <p className="mt-0.5 text-[13px] text-chalk-2">{ph.summary}</p>
                </div>
                <div className="num text-[13px] text-chalk-3">
                  Weeks {from}–{to} · {phDone}/{ph.steps.length}
                </div>
              </header>
              <ul>
                {ph.steps.map((st) => (
                  <li key={st.id} className="group flex gap-3 border-b border-seam px-5 py-3.5 last:border-0">
                    <input
                      type="checkbox"
                      checked={st.done}
                      onChange={() => toggleStep(ph.id, st.id)}
                      aria-label={`Mark "${st.title}" done`}
                      className="mt-1 size-4 shrink-0 accent-[var(--color-sard)]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className={cn("text-[14px] font-medium", st.done ? "text-chalk-3 line-through" : "text-chalk")}>{st.title}</div>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-chalk-2">{st.detail}</p>
                      {st.resources.length > 0 && (
                        <p className="mt-1.5 text-[12px] text-chalk-3">{st.resources.join(" · ")}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAsk(true, `Help me with the roadmap step "${st.title}": ${st.detail} Where do I start today?`)}
                      className="h-7 shrink-0 self-start rounded-md px-2 text-[12px] text-chalk-3 opacity-100 hover:bg-shelf hover:text-chalk md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                    >
                      Ask
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
