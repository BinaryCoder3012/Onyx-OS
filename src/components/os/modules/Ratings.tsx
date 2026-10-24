"use client";

import { useState } from "react";
import { useOnyx } from "@/lib/store";
import { syncPlatform } from "@/lib/sync";
import { PLATFORMS, type Platform } from "@/lib/types";
import { ago, cn } from "@/lib/util";
import { Button, Empty, ErrorLine, Input, Panel, Spinner } from "@/components/ui";
import { RatingChart } from "@/components/charts/RatingChart";

export const PLATFORM_COLOR: Record<Platform, string> = {
  codeforces: "var(--color-sard)",
  leetcode: "var(--color-agate)",
  atcoder: "var(--color-chalk-2)",
  codechef: "var(--color-warn)",
};

function HandleRow({ platform }: { platform: (typeof PLATFORMS)[number] }) {
  const saved = useOnyx((s) => s.profile.handles[platform.id] ?? "");
  const stats = useOnyx((s) => s.stats[platform.id]);
  const setHandle = useOnyx((s) => s.setHandle);
  const [value, setValue] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sync(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    setHandle(platform.id, value);
    const err = await syncPlatform(platform.id, value);
    setError(err ?? "");
    setBusy(false);
  }

  return (
    <form onSubmit={sync} className="grid gap-2 border-b border-seam py-3 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[14px] text-chalk">
          <span className="size-2 rounded-full" style={{ background: PLATFORM_COLOR[platform.id] }} aria-hidden />
          {platform.name}
        </span>
        {stats && <span className="text-[12px] text-chalk-3">synced {ago(stats.fetchedAt)}</span>}
      </div>
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="handle" aria-label={`${platform.name} handle`} spellCheck={false} />
        <Button type="submit" size="md" disabled={busy || (!value.trim() && !stats)}>
          {busy ? <Spinner /> : stats && value === saved ? "Refresh" : value.trim() ? "Sync" : "Remove"}
        </Button>
      </div>
      <ErrorLine>{error}</ErrorLine>
    </form>
  );
}

export function Ratings() {
  const stats = useOnyx((s) => s.stats);
  const handles = useOnyx((s) => s.profile.handles);
  const [syncing, setSyncing] = useState(false);
  const synced = PLATFORMS.filter((p) => stats[p.id]);

  const series = synced.map((p) => ({ id: p.id, name: p.name, color: PLATFORM_COLOR[p.id], points: stats[p.id]!.history }));

  const recent = synced
    .flatMap((p) =>
      stats[p.id]!.history.map((h, i, arr) => ({ ...h, platform: p, delta: i ? h.rating - arr[i - 1].rating : null })),
    )
    .sort((a, b) => b.t - a.t)
    .slice(0, 12);

  async function syncAll() {
    setSyncing(true);
    await Promise.all(PLATFORMS.filter((p) => handles[p.id]).map((p) => syncPlatform(p.id, handles[p.id]!)));
    setSyncing(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="grid content-start gap-5">
        <section className="rounded-xl border border-seam bg-slab">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-t-xl bg-seam md:grid-cols-4">
            {PLATFORMS.map((p) => {
              const st = stats[p.id];
              const last = st?.history.at(-1);
              const prev = st?.history.at(-2);
              const delta = last && prev ? last.rating - prev.rating : null;
              return (
                <div key={p.id} className="bg-slab p-4">
                  <div className="flex items-center gap-1.5 text-[13px] text-chalk-2">
                    <span className="size-2 rounded-full" style={{ background: PLATFORM_COLOR[p.id] }} aria-hidden />
                    {p.name}
                  </div>
                  {st ? (
                    <>
                      <div className="num mt-1.5 font-display text-[28px] leading-none font-semibold">{st.rating ?? "–"}</div>
                      <div className="num mt-1.5 text-[12px] text-chalk-3">
                        {delta != null && (
                          <span className={delta >= 0 ? "text-good" : "text-bad"}>
                            {delta >= 0 ? "+" : ""}
                            {delta}{" "}
                          </span>
                        )}
                        max {st.maxRating ?? "–"}
                        {st.rank ? ` · ${st.rank}` : ""}
                      </div>
                    </>
                  ) : (
                    <div className="mt-1.5 font-display text-[28px] leading-none text-chalk-3">–</div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-t border-seam p-4">
            {synced.length ? (
              <RatingChart series={series} height={300} />
            ) : (
              <Empty>Add a handle on the right and every rated contest you have played is drawn here, one line per judge.</Empty>
            )}
          </div>
        </section>

        <Panel title="Recent contests" bodyClassName="p-0">
          {recent.length === 0 ? (
            <p className="p-4 text-[14px] text-chalk-3">Your last rated contests across every judge will be listed here.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-seam text-left text-chalk-3">
                  <th className="px-4 py-2 font-normal">Contest</th>
                  <th className="hidden px-4 py-2 font-normal sm:table-cell">Judge</th>
                  <th className="px-4 py-2 text-right font-normal">Change</th>
                  <th className="px-4 py-2 text-right font-normal">Rating</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={`${r.platform.id}-${r.t}-${r.contest}`} className="border-b border-seam last:border-0">
                    <td className="max-w-[280px] truncate px-4 py-2.5 text-chalk">
                      {r.contest}
                      <div className="text-[12px] text-chalk-3">{new Date(r.t).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </td>
                    <td className="hidden px-4 py-2.5 text-chalk-2 sm:table-cell">{r.platform.name}</td>
                    <td className={cn("num px-4 py-2.5 text-right", r.delta == null ? "text-chalk-3" : r.delta >= 0 ? "text-good" : "text-bad")}>
                      {r.delta == null ? "–" : `${r.delta >= 0 ? "+" : ""}${r.delta}`}
                    </td>
                    <td className="num px-4 py-2.5 text-right text-chalk">{r.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      <Panel
        title="Handles"
        className="self-start"
        action={
          Object.values(handles).some(Boolean) && (
            <Button size="sm" variant="ghost" onClick={syncAll} disabled={syncing}>
              {syncing ? <Spinner /> : "Refresh all"}
            </Button>
          )
        }
        bodyClassName="py-1"
      >
        {PLATFORMS.map((p) => (
          <HandleRow key={p.id} platform={p} />
        ))}
        <p className="pt-2 pb-3 text-[12px] leading-relaxed text-chalk-3">
          Read from each judge&rsquo;s public profile. No passwords, nothing posted.
        </p>
      </Panel>
    </div>
  );
}
