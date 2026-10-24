"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useOnyx } from "@/lib/store";
import { workspaceSnapshot } from "@/lib/context";
import { PLATFORMS } from "@/lib/types";
import { cn, dayKey, daysUntil, fmtMinutes, readError, startOfDay, streak } from "@/lib/util";
import { Button, ErrorLine, Figure, Meter, Panel, Pill, Spinner } from "@/components/ui";
import { RatingChart } from "@/components/charts/RatingChart";
import { PLATFORM_COLOR } from "./Ratings";

gsap.registerPlugin(useGSAP);

function Brief() {
  const brief = useOnyx((s) => s.brief);
  const setBrief = useOnyx((s) => s.setBrief);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const list = useRef<HTMLOListElement>(null);
  const fresh = brief?.day === dayKey();

  useGSAP(
    () => {
      if (!brief) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".move", { x: -16, autoAlpha: 0, duration: 0.6, stagger: 0.1, ease: "expo.out" });
      });
    },
    { scope: list, dependencies: [brief?.items] },
  );

  async function plan() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: workspaceSnapshot(useOnyx.getState()) }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = (await res.json()) as { items: { title: string; why: string; href: string }[] };
      setBrief({ day: dayKey(), items: data.items });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not plan the day.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      title={fresh ? "Three moves for today" : "Today's moves"}
      action={
        <Button size="sm" variant={fresh ? "ghost" : "primary"} onClick={plan} disabled={busy}>
          {busy ? <Spinner className={fresh ? "" : "border-onyx/40 border-t-transparent"} /> : fresh ? "Plan again" : "Plan my day"}
        </Button>
      }
    >
      {brief ? (
        <>
          <ol ref={list} className="divide-y divide-seam">
            {brief.items.map((m, i) => (
              <li key={m.title} className="move">
                <Link href={m.href} className="group flex gap-4 py-3.5 first:pt-0">
                  <span className="num mt-0.5 font-display text-[18px] leading-none text-sard">{i + 1}</span>
                  <span>
                    <span className="block text-[15px] font-medium text-chalk group-hover:underline">{m.title}</span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-chalk-2">{m.why}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          {!fresh && <p className="mt-2 text-[12px] text-chalk-3">From {brief.day}. Plan again for today.</p>}
        </>
      ) : (
        <p className="text-[14px] leading-relaxed text-chalk-2">
          Onyx reads your workspace and picks the three moves with the most leverage today: the closest deadline, the topic you
          are avoiding, the next roadmap step.
        </p>
      )}
      <div className="mt-2">
        <ErrorLine>{error}</ErrorLine>
      </div>
    </Panel>
  );
}

function Setup() {
  const s = useOnyx();
  const steps = [
    { done: !!s.profile.name && !!s.profile.targetRole, label: "Add your name and target role", href: "/os/settings" },
    { done: Object.keys(s.stats).length > 0, label: "Add a contest handle", href: "/os/ratings" },
    { done: s.problems.length > 0, label: "Log a problem you solved", href: "/os/problems?new=1" },
    { done: !!s.resume?.review, label: "Upload your resume for a review", href: "/os/resume" },
    { done: !!s.roadmap, label: "Plan a roadmap", href: "/os/roadmap" },
  ];
  const left = steps.filter((x) => !x.done);
  if (!left.length) return null;
  return (
    <Panel title="Set up your stone" action={<span className="num text-[13px] text-chalk-3">{steps.length - left.length} of {steps.length}</span>}>
      <ul className="grid gap-1">
        {steps.map((st) => (
          <li key={st.label}>
            <Link href={st.href} className={cn("flex items-center gap-3 rounded-lg px-2 py-2 text-[14px] hover:bg-shelf", st.done ? "text-chalk-3 line-through" : "text-chalk")}>
              <span className={cn("size-2 shrink-0 rounded-full", st.done ? "bg-good" : "bg-seam-strong")} aria-hidden />
              {st.label}
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function Today() {
  const profile = useOnyx((s) => s.profile);
  const problems = useOnyx((s) => s.problems);
  const stats = useOnyx((s) => s.stats);
  const roadmap = useOnyx((s) => s.roadmap);
  const sessions = useOnyx((s) => s.sessions);
  const openings = useOnyx((s) => s.openings);
  const goals = useOnyx((s) => s.goals);

  const today = startOfDay();
  const solved = problems.filter((p) => p.status === "solved");
  const solvedTimes = solved.map((p) => p.solvedAt ?? p.createdAt);
  const solvedToday = solvedTimes.filter((t) => t >= today).length;
  const weekMin = sessions.filter((s) => s.endedAt >= today - 6 * 86400000).reduce((a, s) => a + s.minutes, 0);
  const steps = roadmap?.phases.flatMap((p) => p.steps) ?? [];
  const nextStep = steps.find((s) => !s.done);

  const synced = PLATFORMS.filter((p) => stats[p.id]);
  const main = synced[0];
  const mainStats = main ? stats[main.id]! : null;
  const lastDelta = mainStats && mainStats.history.length > 1 ? mainStats.history.at(-1)!.rating - mainStats.history.at(-2)!.rating : null;

  const upcoming = [
    ...openings
      .filter((o) => o.deadline && o.stage === "saved")
      .map((o) => ({ id: o.id, label: `Apply: ${o.role}, ${o.company}`, date: o.deadline!, href: "/os/openings" })),
    ...goals.filter((g) => g.due && g.status === "active").map((g) => ({ id: g.id, label: g.title, date: g.due!, href: "/os/career" })),
  ]
    .map((x) => ({ ...x, left: daysUntil(x.date) }))
    .filter((x) => x.left >= -3)
    .sort((a, b) => a.left - b.left)
    .slice(0, 6);

  const revisit = problems.filter((p) => p.status === "revisit" || p.status === "attempted").slice(0, 5);
  const date = new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] text-chalk-3">{date}</p>
          <h2 className="mt-1 font-display text-[28px] leading-tight font-semibold tracking-[-0.02em]">
            {solvedToday >= profile.dailyGoal
              ? `Daily goal met${profile.name ? `, ${profile.name.split(" ")[0]}` : ""}.`
              : `${profile.dailyGoal - solvedToday} ${profile.dailyGoal - solvedToday === 1 ? "problem" : "problems"} to go today${profile.name ? `, ${profile.name.split(" ")[0]}` : ""}.`}
          </h2>
        </div>
        <div className="flex gap-2">
          <Link href="/os/problems?new=1" className="inline-flex h-9 items-center rounded-lg border border-seam-strong bg-shelf px-3.5 text-[14px] text-chalk hover:border-chalk-3">
            Log a problem
          </Link>
          <Link href="/os/focus" className="inline-flex h-9 items-center rounded-lg bg-chalk px-3.5 text-[14px] font-medium text-onyx hover:bg-white">
            Start focus
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-seam bg-slab p-5 md:grid-cols-4">
        <Figure
          label={main ? main.name : "Rating"}
          value={mainStats?.rating ?? "–"}
          sub={lastDelta != null ? `${lastDelta >= 0 ? "+" : ""}${lastDelta} last contest` : main ? "no contests yet" : "add a handle"}
          tone={lastDelta == null ? undefined : lastDelta >= 0 ? "good" : "bad"}
        />
        <Figure label="Solve streak" value={`${streak(solvedTimes)} days`} sub={`${solvedToday} of ${profile.dailyGoal} today`} />
        <Figure label="Focus this week" value={fmtMinutes(weekMin)} sub={`${solved.filter((p) => (p.solvedAt ?? 0) >= today - 6 * 86400000).length} solved alongside`} />
        <div className="min-w-0">
          <div className="text-[13px] text-chalk-2">Roadmap</div>
          {roadmap ? (
            <>
              <div className="num mt-1 font-display text-[30px] leading-none font-semibold">
                {steps.filter((s) => s.done).length}
                <span className="text-[18px] text-chalk-3">/{steps.length}</span>
              </div>
              <Meter value={(steps.filter((s) => s.done).length / Math.max(1, steps.length)) * 100} className="mt-2.5" />
            </>
          ) : (
            <Link href="/os/roadmap" className="mt-1 block font-display text-[30px] leading-none text-chalk-3 hover:text-chalk">
              –
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid content-start gap-5">
          <Brief />
          <Panel
            title="Ratings"
            action={
              <Link href="/os/ratings" className="text-[13px] text-chalk-3 hover:text-chalk">
                All judges
              </Link>
            }
          >
            {synced.length ? (
              <RatingChart series={synced.map((p) => ({ id: p.id, name: p.name, color: PLATFORM_COLOR[p.id], points: stats[p.id]!.history }))} height={220} />
            ) : (
              <p className="text-[14px] text-chalk-2">
                <Link href="/os/ratings" className="text-chalk underline underline-offset-4">
                  Add a Codeforces, LeetCode, AtCoder or CodeChef handle
                </Link>{" "}
                and your contest history is drawn here.
              </p>
            )}
          </Panel>
        </div>
        <div className="grid content-start gap-5">
          <Setup />
          <Panel title="Coming up">
            {upcoming.length === 0 ? (
              <p className="text-[13px] leading-relaxed text-chalk-3">Deadlines from openings and dated goals appear here.</p>
            ) : (
              <ul className="grid gap-2.5">
                {upcoming.map((u) => (
                  <li key={u.id}>
                    <Link href={u.href} className="flex items-start justify-between gap-3 text-[13px] hover:underline">
                      <span className="text-chalk">{u.label}</span>
                      <Pill tone={u.left < 0 ? "bad" : u.left <= 3 ? "sard" : u.left <= 7 ? "warn" : undefined}>
                        {u.left < 0 ? "overdue" : u.left === 0 ? "today" : `${u.left}d`}
                      </Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          {nextStep && (
            <Panel title="Next roadmap step">
              <Link href="/os/roadmap" className="block hover:underline">
                <span className="text-[14px] font-medium text-chalk">{nextStep.title}</span>
              </Link>
              <p className="mt-1 text-[13px] leading-relaxed text-chalk-2">{nextStep.detail}</p>
            </Panel>
          )}
          {revisit.length > 0 && (
            <Panel title="Worth another go">
              <ul className="grid gap-2">
                {revisit.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3 text-[13px]">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer" className="truncate text-chalk hover:underline">
                        {p.title}
                      </a>
                    ) : (
                      <span className="truncate text-chalk">{p.title}</span>
                    )}
                    <span className="shrink-0 text-chalk-3 capitalize">{p.difficulty}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
