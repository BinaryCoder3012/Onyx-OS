import type { OnyxState } from "./store";
import { PLATFORMS } from "./types";
import { daysUntil, fmtMinutes, startOfDay, streak } from "./util";

/** A compact plain-text snapshot of the workspace, sent to the model with each AI request. */
export function workspaceSnapshot(s: Pick<OnyxState, "profile" | "problems" | "stats" | "roadmap" | "resume" | "goals" | "openings" | "sessions">) {
  const lines: string[] = [];
  const today = new Date().toDateString();
  lines.push(`Today: ${today}`);
  if (s.profile.name) lines.push(`Name: ${s.profile.name}`);
  if (s.profile.targetRole) lines.push(`Aiming for: ${s.profile.targetRole}`);

  // Problems
  const solved = s.problems.filter((p) => p.status === "solved");
  const solvedTimes = solved.map((p) => p.solvedAt ?? p.createdAt);
  const lastSolve = solvedTimes.length ? Math.max(...solvedTimes) : null;
  lines.push(
    `\nProblems: ${s.problems.length} logged, ${solved.length} solved, streak ${streak(solvedTimes)} days` +
      (lastSolve ? `, last solve ${Math.floor((Date.now() - lastSolve) / 86400000)} days ago` : ", none solved yet"),
  );
  const byTopic = new Map<string, { solved: number; open: number }>();
  for (const p of s.problems)
    for (const t of p.topics) {
      const e = byTopic.get(t) ?? { solved: 0, open: 0 };
      if (p.status === "solved") e.solved++;
      else e.open++;
      byTopic.set(t, e);
    }
  if (byTopic.size)
    lines.push(
      "By topic: " +
        [...byTopic.entries()]
          .sort((a, b) => b[1].solved - a[1].solved)
          .slice(0, 14)
          .map(([t, e]) => `${t} ${e.solved}✓/${e.open} open`)
          .join(", "),
    );
  const revisit = s.problems.filter((p) => p.status === "revisit" || p.status === "attempted").slice(0, 6);
  if (revisit.length) lines.push("Needs another go: " + revisit.map((p) => `${p.title} (${p.difficulty})`).join("; "));

  // Ratings
  const rated = PLATFORMS.filter((p) => s.stats[p.id]);
  if (rated.length) {
    lines.push("\nContest ratings:");
    for (const p of rated) {
      const st = s.stats[p.id]!;
      const last = st.history.at(-1);
      const prev = st.history.at(-2);
      lines.push(
        `- ${p.name} @${st.handle}: ${st.rating ?? "unrated"} (max ${st.maxRating ?? "-"}${st.rank ? `, ${st.rank}` : ""}), ${st.history.length} contests` +
          (last && prev ? `, last change ${last.rating - prev.rating >= 0 ? "+" : ""}${last.rating - prev.rating} in ${last.contest}` : "") +
          (st.solved != null ? `, ${st.solved} solved on site` : ""),
      );
    }
  } else {
    const handles = Object.entries(s.profile.handles).filter(([, h]) => h);
    lines.push(handles.length ? `\nHandles set but not synced: ${handles.map(([k, h]) => `${k}:${h}`).join(", ")}` : "\nNo contest handles added.");
  }

  // Roadmap
  if (s.roadmap) {
    const steps = s.roadmap.phases.flatMap((ph) => ph.steps.map((st) => ({ ...st, phase: ph.title })));
    const done = steps.filter((x) => x.done).length;
    const next = steps.find((x) => !x.done);
    lines.push(`\nRoadmap "${s.roadmap.goal}": ${done}/${steps.length} steps done` + (next ? `; next step: "${next.title}" in ${next.phase}` : "; finished"));
  } else lines.push("\nNo roadmap yet.");

  // Resume
  if (s.resume?.review) {
    const r = s.resume.review;
    lines.push(
      `\nResume (${s.resume.fileName}) scored ${r.score}/100 for ${s.resume.targetRole || "SWE"}. Weakest: ` +
        [...r.sections].sort((a, b) => a.score - b.score).slice(0, 2).map((x) => `${x.name} ${x.score}`).join(", ") +
        (r.missingKeywords.length ? `. Missing: ${r.missingKeywords.slice(0, 8).join(", ")}` : ""),
    );
    lines.push(`Resume text (first part): ${s.resume.text.slice(0, 1800)}`);
  } else lines.push("\nNo resume uploaded.");

  // Goals
  const active = s.goals.filter((g) => g.status === "active");
  if (active.length)
    lines.push("\nCareer goals: " + active.map((g) => `${g.title}${g.due ? ` (due ${g.due}, ${daysUntil(g.due)} days)` : ""}`).join("; "));

  // Openings
  const live = s.openings.filter((o) => o.stage !== "closed");
  if (live.length) {
    lines.push("\nOpenings:");
    for (const o of live.slice(0, 12))
      lines.push(
        `- ${o.role} at ${o.company} [${o.stage}]` +
          (o.deadline ? ` deadline ${o.deadline} (${daysUntil(o.deadline)} days)` : "") +
          (o.fit ? ` fit ${o.fit.score}` : ""),
      );
  }

  // Focus
  const weekAgo = startOfDay() - 6 * 86400000;
  const week = s.sessions.filter((x) => x.endedAt >= weekAgo);
  lines.push(`\nFocus last 7 days: ${fmtMinutes(week.reduce((a, x) => a + x.minutes, 0))} across ${week.length} sessions.`);

  return lines.join("\n").slice(0, 11500);
}

/** Shorter profile used when judging fit for one opening. */
export function candidateProfile(s: Pick<OnyxState, "profile" | "problems" | "stats" | "resume">) {
  const parts = [`Target role: ${s.profile.targetRole || "software engineer"}`];
  const solved = s.problems.filter((p) => p.status === "solved").length;
  parts.push(`Problems solved in tracker: ${solved}`);
  for (const p of PLATFORMS) {
    const st = s.stats[p.id];
    if (st) parts.push(`${p.name}: ${st.rating ?? "unrated"} (max ${st.maxRating ?? "-"})`);
  }
  parts.push(s.resume?.text ? `Resume:\n${s.resume.text.slice(0, 9000)}` : "No resume uploaded.");
  return parts.join("\n");
}
