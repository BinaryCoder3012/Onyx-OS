"use client";

import { RatingChart } from "@/components/charts/RatingChart";
import type { RatingPoint } from "@/lib/types";

/** Sample rating paths for the landing page's interface crop. Not anyone's real data. */
function samplePath(start: number, n: number, drift: number, seed: number, from: number): RatingPoint[] {
  let r = start;
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: n }, (_, i) => {
    r = Math.max(800, Math.round(r + drift + (rnd() - 0.45) * 120));
    return { t: from + i * 16 * 86400000, rating: r, contest: `Round ${900 + i}` };
  });
}

const FROM = new Date(2024, 0, 10).getTime();
const SERIES = [
  { id: "cf", name: "Codeforces", color: "var(--color-sard)", points: samplePath(1180, 42, 9, 3, FROM) },
  { id: "lc", name: "LeetCode", color: "var(--color-agate)", points: samplePath(1490, 30, 11, 11, FROM + 60 * 86400000) },
];

const MOVES = [
  ["Apply to the Stripe intern role before Friday", "Deadline in 3 days and your fit check came back 78."],
  ["Solve two graph problems at 1500", "Graphs: 4 solved, 9 open. Your last three rounds lost points on D."],
  ["Finish “Build a rate limiter in Go”", "Next step of Backend phase 2; it unlocks the system design phase."],
];

export function TodayFragment() {
  return (
    <div data-ui className="overflow-hidden rounded-2xl border border-seam bg-slab shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex h-11 items-center justify-between border-b border-seam px-4 text-[13px]">
        <span className="text-chalk">Today</span>
        <span className="text-chalk-3">Thu, 24 Oct</span>
      </div>
      <div className="grid gap-px bg-seam md:grid-cols-[1fr_260px]">
        <div className="bg-slab p-5">
          <div className="text-[13px] text-chalk-2">Three moves for today</div>
          <ol className="mt-3 divide-y divide-seam">
            {MOVES.map(([title, why], i) => (
              <li key={title} className="flex gap-3 py-3">
                <span className="num mt-0.5 text-[13px] text-sard">{i + 1}</span>
                <div>
                  <div className="text-[15px] font-medium text-chalk">{title}</div>
                  <div className="mt-0.5 text-[13px] text-chalk-2">{why}</div>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 border-t border-seam pt-4">
            <div className="mb-2 flex items-baseline justify-between text-[13px]">
              <span className="text-chalk-2">Ratings</span>
              <span className="flex gap-3 text-chalk-3">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-sard" />Codeforces</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-agate" />LeetCode</span>
              </span>
            </div>
            <RatingChart series={SERIES} height={190} />
          </div>
        </div>
        <div className="grid content-start gap-6 bg-slab p-5">
          <div>
            <div className="text-[13px] text-chalk-2">Codeforces</div>
            <div className="num mt-1 font-display text-[30px] leading-none font-semibold">{SERIES[0].points.at(-1)!.rating}</div>
            <div className="num mt-1.5 text-[13px] text-good">+46 last round</div>
          </div>
          <div>
            <div className="text-[13px] text-chalk-2">Solve streak</div>
            <div className="num mt-1 font-display text-[30px] leading-none font-semibold">12 days</div>
          </div>
          <div>
            <div className="text-[13px] text-chalk-2">Focus this week</div>
            <div className="num mt-1 font-display text-[30px] leading-none font-semibold">9h 40m</div>
          </div>
          <div>
            <div className="text-[13px] text-chalk-2">Roadmap</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-seam">
              <div className="h-full w-[41%] rounded-full bg-sard" />
            </div>
            <div className="num mt-1.5 text-[13px] text-chalk-3">9 of 22 steps</div>
          </div>
        </div>
      </div>
    </div>
  );
}
