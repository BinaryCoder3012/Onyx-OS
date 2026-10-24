"use client";

import { cn, dayKey, fmtMinutes, startOfDay } from "@/lib/util";

/** Minutes per day for the last seven days; today's bar carries the data hue. */
export function WeekBars({ sessions, className }: { sessions: { minutes: number; endedAt: number }[]; className?: string }) {
  const today = startOfDay();
  const days = Array.from({ length: 7 }, (_, i) => {
    const start = today - (6 - i) * 86400000;
    const minutes = sessions
      .filter((s) => s.endedAt >= start && s.endedAt < start + 86400000)
      .reduce((a, s) => a + s.minutes, 0);
    return { start, minutes, isToday: i === 6 };
  });
  const max = Math.max(60, ...days.map((d) => d.minutes));
  return (
    <div className={cn("grid grid-cols-7 items-end gap-2", className)}>
      {days.map((d) => (
        <div key={d.start} className="flex flex-col items-center gap-1.5">
          <span className="num text-[11px] text-chalk-3">{d.minutes ? fmtMinutes(d.minutes) : "–"}</span>
          <div className="flex h-24 w-full items-end">
            <div
              className={cn("w-full rounded-[3px]", d.isToday ? "bg-sard" : "bg-seam-strong")}
              style={{ height: `${Math.max(d.minutes ? 4 : 1, (d.minutes / max) * 100)}%` }}
              title={`${new Date(d.start).toLocaleDateString("en", { weekday: "long" })}: ${fmtMinutes(d.minutes)}`}
            />
          </div>
          <span className={cn("text-[11px]", d.isToday ? "text-chalk" : "text-chalk-3")}>
            {new Date(d.start).toLocaleDateString("en", { weekday: "narrow" })}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Solves per day across recent weeks, laid out like stone strata: rows are weekdays, columns weeks. */
export function SolveGrid({ times, weeks = 20 }: { times: number[]; weeks?: number }) {
  const counts = new Map<string, number>();
  for (const t of times) counts.set(dayKey(t), (counts.get(dayKey(t)) ?? 0) + 1);
  const today = new Date(startOfDay());
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const cells: { key: string; n: number; future: boolean; date: Date }[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    cells.push({ key: dayKey(d), n: counts.get(dayKey(d)) ?? 0, future: d > today, date: d });
  }
  const tone = (n: number) => (n === 0 ? "bg-seam" : n === 1 ? "bg-sard/40" : n === 2 ? "bg-sard/70" : "bg-sard");
  return (
    <div className="overflow-x-auto scroll-quiet">
      <div className="grid w-max grid-flow-col grid-rows-7 gap-[3px]" role="img" aria-label={`${times.length} solves in the last ${weeks} weeks`}>
        {cells.map((c) => (
          <div
            key={c.key}
            className={cn("size-[11px] rounded-[2px]", c.future ? "bg-transparent" : tone(c.n))}
            title={c.future ? undefined : `${c.date.toLocaleDateString("en", { month: "short", day: "numeric" })}: ${c.n} solved`}
          />
        ))}
      </div>
    </div>
  );
}
