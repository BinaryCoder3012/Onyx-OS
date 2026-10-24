"use client";

import { useOnyx } from "@/lib/store";
import { TOPICS } from "@/lib/sync";
import { ago, cn, fmtMinutes, startOfDay } from "@/lib/util";
import { Button, Empty, Figure, Input, Label, Panel } from "@/components/ui";
import { WeekBars } from "@/components/charts/Small";
import { clock, elapsedMs, useTimer, useTimerTick } from "../timer";

const PRESETS = [25, 50, 90];

function Timer() {
  useTimerTick();
  const t = useTimer();
  const running = !!t.startedAt;
  const elapsed = elapsedMs(t);
  const planned = t.plannedMin * 60000;
  const remaining = planned - elapsed;
  const started = running || elapsed > 0;
  const roadmap = useOnyx((s) => s.roadmap);
  const nextStep = roadmap?.phases.flatMap((p) => p.steps).find((s) => !s.done);
  const suggestions = [nextStep?.title, "Contest practice", "Upsolving", ...TOPICS.slice(0, 6)].filter(Boolean) as string[];

  return (
    <section className="rounded-xl border border-seam bg-slab p-5 md:p-7">
      <div className="grid gap-8 md:grid-cols-[1fr_320px] md:items-end">
        <div>
          <div className="text-[13px] text-chalk-2">{running ? "In focus" : started ? "Paused" : "Ready"}</div>
          <div className="num mt-2 font-display text-[clamp(4rem,11vw,8rem)] leading-[0.9] font-semibold tracking-[-0.04em]" aria-live="off">
            {clock(remaining)}
          </div>
          {/* The block is laid down like a band of stone as it fills */}
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-seam" aria-hidden>
            <div className={cn("h-full rounded-full bg-sard transition-[width] duration-1000 ease-linear")} style={{ width: `${Math.min(100, (elapsed / planned) * 100)}%` }} />
          </div>
          <div className="num mt-2 flex justify-between text-[12px] text-chalk-3">
            <span>{clock(elapsed)} in</span>
            <span>{t.plannedMin} minute block</span>
          </div>
        </div>
        <div className="grid gap-4">
          <label className="block">
            <Label>Working on</Label>
            <Input value={t.label} onChange={(e) => t.setLabel(e.target.value)} placeholder="Dynamic programming" list="focus-labels" />
            <datalist id="focus-labels">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </label>
          <div className="flex gap-1.5" role="group" aria-label="Block length">
            {PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                disabled={started}
                aria-pressed={t.plannedMin === m}
                onClick={() => t.setPlanned(m)}
                className={cn(
                  "h-9 flex-1 rounded-lg border text-[14px] disabled:opacity-50",
                  t.plannedMin === m ? "border-sard/50 bg-sard/10 text-chalk" : "border-seam-strong text-chalk-2",
                )}
              >
                {m} min
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {running ? (
              <Button className="flex-1" onClick={t.pause}>
                Pause
              </Button>
            ) : (
              <Button className="flex-1" variant="primary" onClick={t.start}>
                {started ? "Resume" : "Start"}
              </Button>
            )}
            {started && (
              <>
                <Button onClick={() => t.finish()} disabled={elapsed < 60000} title={elapsed < 60000 ? "Log at least a minute" : undefined}>
                  Finish and log
                </Button>
                <Button variant="ghost" onClick={t.discard}>
                  Discard
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Focus() {
  const sessions = useOnyx((s) => s.sessions);
  const removeSession = useOnyx((s) => s.removeSession);
  const problems = useOnyx((s) => s.problems);
  const weekStart = startOfDay() - 6 * 86400000;
  const week = sessions.filter((s) => s.endedAt >= weekStart);
  const weekMin = week.reduce((a, s) => a + s.minutes, 0);
  const todayMin = sessions.filter((s) => s.endedAt >= startOfDay()).reduce((a, s) => a + s.minutes, 0);
  const solvedWeek = problems.filter((p) => p.status === "solved" && (p.solvedAt ?? 0) >= weekStart).length;

  const labelMinutes = new Map<string, number>();
  for (const s of week) labelMinutes.set(s.label, (labelMinutes.get(s.label) ?? 0) + s.minutes);
  const byLabel = [...labelMinutes.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid gap-5">
      <Timer />
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Panel title="Last seven days">
          <div className="mb-5 grid grid-cols-3 gap-4">
            <Figure label="Today" value={fmtMinutes(todayMin)} />
            <Figure label="This week" value={fmtMinutes(weekMin)} />
            <Figure
              label="Solved per hour"
              value={weekMin ? (solvedWeek / (weekMin / 60)).toFixed(1) : "–"}
              sub={`${solvedWeek} solved this week`}
            />
          </div>
          <WeekBars sessions={sessions} />
        </Panel>
        <Panel title="Where the week went">
          {byLabel.length === 0 ? (
            <Empty>Finish a focus block and it is logged here by what you worked on.</Empty>
          ) : (
            <ul className="grid gap-3">
              {byLabel.map(([label, min]) => (
                <li key={label}>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-chalk">{label}</span>
                    <span className="num text-chalk-2">{fmtMinutes(min)}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-seam">
                    <div className="h-full rounded-full bg-agate" style={{ width: `${(min / byLabel[0][1]) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <Panel title="Log" bodyClassName="p-0">
        {sessions.length === 0 ? (
          <p className="p-4 text-[14px] text-chalk-3">No sessions yet.</p>
        ) : (
          <ul>
            {sessions.slice(0, 30).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 border-b border-seam px-4 py-2.5 text-[13px] last:border-0">
                <span className="text-chalk">{s.label}</span>
                <span className="ml-auto num text-chalk-2">{fmtMinutes(s.minutes)}</span>
                <span className="w-28 text-right text-chalk-3">{ago(s.endedAt)}</span>
                <button type="button" onClick={() => removeSession(s.id)} className="text-chalk-3 hover:text-bad" aria-label="Delete session">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
