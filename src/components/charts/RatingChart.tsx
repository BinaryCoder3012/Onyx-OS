"use client";

import { useMemo, useState } from "react";
import type { RatingPoint } from "@/lib/types";
import { useWidth } from "./useWidth";

export interface Series {
  id: string;
  name: string;
  color: string;
  points: RatingPoint[];
}

const PAD = { top: 12, right: 12, bottom: 26, left: 44 };

function niceTicks(min: number, max: number, count = 4) {
  const span = max - min || 1;
  const step = Math.pow(10, Math.floor(Math.log10(span / count)));
  const err = (span / count) / step;
  const nice = step * (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1);
  const out: number[] = [];
  for (let v = Math.ceil(min / nice) * nice; v <= max; v += nice) out.push(v);
  return out;
}

/** Ratings over time, one line per judge. Hover reads every line at that date. */
export function RatingChart({ series, height = 260 }: { series: Series[]; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hoverT, setHoverT] = useState<number | null>(null);

  const live = series.filter((s) => s.points.length > 0);
  const geo = useMemo(() => {
    const all = live.flatMap((s) => s.points);
    if (!all.length) return null;
    const t0 = Math.min(...all.map((p) => p.t));
    const t1 = Math.max(...all.map((p) => p.t));
    const r0 = Math.min(...all.map((p) => p.rating));
    const r1 = Math.max(...all.map((p) => p.rating));
    const padR = (r1 - r0) * 0.08 || 50;
    const lo = Math.max(0, r0 - padR);
    const hi = r1 + padR;
    const iw = width - PAD.left - PAD.right;
    const ih = height - PAD.top - PAD.bottom;
    const x = (t: number) => PAD.left + (t1 === t0 ? iw / 2 : ((t - t0) / (t1 - t0)) * iw);
    const y = (r: number) => PAD.top + ih - ((r - lo) / (hi - lo)) * ih;
    const years: number[] = [];
    for (let yr = new Date(t0).getFullYear() + 1; yr <= new Date(t1).getFullYear(); yr++) years.push(yr);
    const step = Math.ceil(years.length / Math.max(1, Math.floor(iw / 70)));
    return { t0, t1, x, y, ticks: niceTicks(lo, hi), years: years.filter((_, i) => i % step === 0), iw };
  }, [live, width, height]);

  if (!geo) {
    return (
      <div ref={ref} className="grid place-items-center text-[14px] text-chalk-3" style={{ height }}>
        No rated contests yet.
      </div>
    );
  }

  const readAt = (s: Series, t: number) => {
    let found: RatingPoint | null = null;
    for (const p of s.points) {
      if (p.t <= t) found = p;
      else break;
    }
    return found;
  };

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, (px - PAD.left) / geo!.iw));
    setHoverT(geo!.t0 + frac * (geo!.t1 - geo!.t0));
  }

  const hx = hoverT != null ? geo.x(hoverT) : 0;
  const readings = hoverT != null ? live.map((s) => ({ s, p: readAt(s, hoverT) })).filter((r) => r.p) : [];

  return (
    <div ref={ref} className="relative select-none">
      <svg
        width={width}
        height={height}
        className="block touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHoverT(null)}
        role="img"
        aria-label={`Rating history: ${live.map((s) => `${s.name} ${s.points.at(-1)?.rating}`).join(", ")}`}
      >
        {geo.ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={width - PAD.right} y1={geo.y(v)} y2={geo.y(v)} stroke="var(--color-seam)" />
            <text x={PAD.left - 8} y={geo.y(v) + 4} textAnchor="end" className="num fill-chalk-3 text-[11px]">
              {v}
            </text>
          </g>
        ))}
        {geo.years.map((yr) => {
          const t = new Date(yr, 0, 1).getTime();
          return (
            <text key={yr} x={geo.x(t)} y={height - 8} textAnchor="middle" className="num fill-chalk-3 text-[11px]">
              {yr}
            </text>
          );
        })}
        {live.map((s) => (
          <polyline
            key={s.id}
            fill="none"
            stroke={s.color}
            strokeWidth={s.id === live[0].id ? 2 : 1.5}
            strokeLinejoin="round"
            points={s.points.map((p) => `${geo.x(p.t).toFixed(1)},${geo.y(p.rating).toFixed(1)}`).join(" ")}
          />
        ))}
        {live.map((s) => {
          const last = s.points.at(-1)!;
          return <circle key={s.id} cx={geo.x(last.t)} cy={geo.y(last.rating)} r={3} fill={s.color} />;
        })}
        {hoverT != null && (
          <g>
            <line x1={hx} x2={hx} y1={PAD.top} y2={height - PAD.bottom} stroke="var(--color-chalk-3)" strokeDasharray="2 3" />
            {readings.map(({ s, p }) => (
              <circle key={s.id} cx={geo.x(p!.t)} cy={geo.y(p!.rating)} r={3.5} fill="var(--color-onyx)" stroke={s.color} strokeWidth={2} />
            ))}
          </g>
        )}
      </svg>
      {hoverT != null && readings.length > 0 && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[180px] rounded-lg border border-seam-strong bg-shelf px-3 py-2 text-[12px] shadow-xl"
          style={{ left: Math.min(Math.max(hx + 12, 0), width - 200) }}
        >
          <div className="mb-1 text-chalk-3">{new Date(hoverT).toLocaleDateString("en", { month: "short", year: "numeric" })}</div>
          {readings.map(({ s, p }) => (
            <div key={s.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-chalk-2">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {s.name}
              </span>
              <span className="num text-chalk">{p!.rating}</span>
            </div>
          ))}
          {readings.length === 1 && <div className="mt-1 max-w-[220px] truncate text-chalk-3">{readings[0].p!.contest}</div>}
        </div>
      )}
    </div>
  );
}
