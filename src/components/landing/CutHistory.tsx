"use client";

import { useState } from "react";
import gsap from "gsap";
import { historyBands } from "@/components/stone/bands";
import { stoneRig, useBands } from "@/components/stone/rig";
import type { PlatformStats } from "@/lib/types";
import { readError } from "@/lib/util";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; stats: PlatformStats; ups: number; downs: number }
  | { kind: "error"; message: string };

/** The page's one live thing: a Codeforces handle becomes the stone's banding, one band per contest. */
export function CutHistory() {
  const [handle, setHandle] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const setBands = useBands((s) => s.setBands);

  async function cut(e: React.FormEvent) {
    e.preventDefault();
    const h = handle.trim();
    if (!h) return;
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/platforms/codeforces?handle=${encodeURIComponent(h)}`);
      if (!res.ok) throw new Error(await readError(res));
      const stats = (await res.json()) as PlatformStats;
      if (stats.history.length < 2) {
        setState({ kind: "error", message: `${stats.handle} has fewer than two rated contests, so there is nothing to cut yet.` });
        return;
      }
      let ups = 0;
      let downs = 0;
      stats.history.forEach((p, i) => {
        if (i === 0) return;
        if (p.rating >= stats.history[i - 1].rating) ups++;
        else downs++;
      });
      setBands(historyBands(stats.history));
      gsap.to(stoneRig, { spin: stoneRig.spin + Math.PI * 2, duration: 2.2, ease: "power3.inOut" });
      setState({ kind: "done", stats, ups, downs });
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "Could not reach Codeforces." });
    }
  }

  function reset() {
    setBands(null);
    setState({ kind: "idle" });
    gsap.to(stoneRig, { spin: stoneRig.spin - Math.PI, duration: 1.4, ease: "power3.inOut" });
  }

  return (
    <div className="max-w-[440px]">
      <form onSubmit={cut} className="flex items-stretch gap-2">
        <label htmlFor="cf-handle" className="sr-only">
          Codeforces handle
        </label>
        <input
          id="cf-handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Your Codeforces handle"
          autoComplete="off"
          spellCheck={false}
          className="h-12 min-w-0 flex-1 rounded-xl border border-seam-strong bg-slab/80 px-4 text-[15px] text-chalk backdrop-blur placeholder:text-chalk-3 focus:border-sard focus:outline-none"
        />
        <button
          type="submit"
          disabled={state.kind === "loading" || !handle.trim()}
          className="h-12 shrink-0 rounded-xl border border-seam-strong bg-shelf/90 px-5 text-[15px] font-medium text-chalk backdrop-blur transition-colors hover:border-chalk-3 disabled:opacity-50"
        >
          {state.kind === "loading" ? "Cutting…" : "Cut it into the stone"}
        </button>
      </form>
      <p className="mt-3 min-h-[3em] text-[14px] leading-relaxed text-chalk-2" aria-live="polite">
        {state.kind === "idle" && "Each rated contest becomes one band: chalk where you climbed, sard where you fell."}
        {state.kind === "loading" && "Reading your contests from Codeforces…"}
        {state.kind === "error" && <span className="text-bad">{state.message}</span>}
        {state.kind === "done" && (
          <>
            <span className="text-chalk">
              {state.stats.handle}, <span className="num">{state.stats.rating}</span>
              {state.stats.rank ? ` (${state.stats.rank})` : ""}.
            </span>{" "}
            <span className="num">{state.stats.history.length}</span> contests cut: <span className="num">{state.ups}</span>{" "}
            climbs in chalk, <span className="num">{state.downs}</span> falls in sard.{" "}
            <button type="button" onClick={reset} className="underline decoration-seam-strong underline-offset-4 hover:text-chalk">
              Restore the stone
            </button>
          </>
        )}
      </p>
    </div>
  );
}
