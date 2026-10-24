"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useOnyx } from "@/lib/store";
import { TOPICS } from "@/lib/sync";
import type { Difficulty, Problem, ProblemStatus } from "@/lib/types";
import { ago, cn, startOfDay, streak } from "@/lib/util";
import { Button, Empty, Figure, Input, Label, Panel, Pill, Select, Textarea } from "@/components/ui";
import { SolveGrid } from "@/components/charts/Small";

const STATUS: { id: ProblemStatus; label: string; tone?: "good" | "warn" | "sard" }[] = [
  { id: "todo", label: "To do" },
  { id: "attempted", label: "Attempted", tone: "warn" },
  { id: "revisit", label: "Revisit", tone: "sard" },
  { id: "solved", label: "Solved", tone: "good" },
];
const SOURCES = ["LeetCode", "Codeforces", "AtCoder", "CodeChef", "CSES", "GeeksforGeeks", "Other"];
const DIFF: Difficulty[] = ["easy", "medium", "hard"];

function guessSource(url: string) {
  const u = url.toLowerCase();
  if (u.includes("leetcode")) return "LeetCode";
  if (u.includes("codeforces")) return "Codeforces";
  if (u.includes("atcoder")) return "AtCoder";
  if (u.includes("codechef")) return "CodeChef";
  if (u.includes("cses")) return "CSES";
  if (u.includes("geeksforgeeks")) return "GeeksforGeeks";
  return null;
}

function titleFromUrl(url: string) {
  const m = url.match(/problems\/([a-z0-9-]+)/i) ?? url.match(/problem\/(\d+\/[A-Z]\d?)/i) ?? url.match(/tasks\/([a-z0-9_]+)/i);
  if (!m) return "";
  return m[1].replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function AddProblem({ onDone, autoFocus }: { onDone: () => void; autoFocus?: boolean }) {
  const addProblem = useOnyx((s) => s.addProblem);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("LeetCode");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [topics, setTopics] = useState<string[]>([]);
  const [status, setStatus] = useState<ProblemStatus>("solved");
  const [notes, setNotes] = useState("");
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) first.current?.focus();
  }, [autoFocus]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addProblem({ title: title.trim(), url: url.trim() || undefined, source, difficulty, topics, status, notes: notes.trim() || undefined });
    setUrl("");
    setTitle("");
    setTopics([]);
    setNotes("");
    onDone();
    first.current?.focus();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <Label hint="optional">Link</Label>
          <Input
            ref={first}
            value={url}
            placeholder="https://leetcode.com/problems/two-sum"
            onChange={(e) => {
              const v = e.target.value;
              setUrl(v);
              const s = guessSource(v);
              if (s) setSource(s);
              if (!title) setTitle(titleFromUrl(v));
            }}
          />
        </label>
        <label className="block">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Two Sum" required />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <label className="block">
          <Label>From</Label>
          <Select value={source} onChange={(e) => setSource(e.target.value)}>
            {SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </label>
        <label className="block">
          <Label>Difficulty</Label>
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            {DIFF.map((d) => (
              <option key={d} value={d}>
                {d[0].toUpperCase() + d.slice(1)}
              </option>
            ))}
          </Select>
        </label>
        <label className="col-span-2 block md:col-span-1">
          <Label>How it went</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as ProblemStatus)}>
            {STATUS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <fieldset>
        <legend className="mb-1.5 text-[13px] text-chalk-2">Topics</legend>
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((t) => {
            const on = topics.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTopics((cur) => (on ? cur.filter((x) => x !== t) : [...cur, t]))}
                className={cn(
                  "h-7 rounded-md border px-2 text-[12px] transition-colors",
                  on ? "border-sard/50 bg-sard/15 text-chalk" : "border-seam-strong text-chalk-2 hover:text-chalk",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="block">
        <Label hint="the idea, the trap, what to remember">Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Prefix sums + hashmap of first index; watch k = 0." />
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={!title.trim()}>
          Log problem
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Close
        </Button>
      </div>
    </form>
  );
}

function Row({ p }: { p: Problem }) {
  const updateProblem = useOnyx((s) => s.updateProblem);
  const removeProblem = useOnyx((s) => s.removeProblem);
  const [open, setOpen] = useState(false);
  const st = STATUS.find((s) => s.id === p.status)!;
  return (
    <li className="border-b border-seam last:border-0">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 md:grid-cols-[1fr_140px_100px_130px]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {p.url ? (
              <a href={p.url} target="_blank" rel="noreferrer" className="truncate text-[14px] font-medium text-chalk hover:underline">
                {p.title}
              </a>
            ) : (
              <span className="truncate text-[14px] font-medium text-chalk">{p.title}</span>
            )}
            {p.notes && (
              <button type="button" onClick={() => setOpen(!open)} className="text-[12px] text-chalk-3 hover:text-chalk" aria-expanded={open}>
                notes
              </button>
            )}
          </div>
          <div className="mt-0.5 truncate text-[12px] text-chalk-3">
            {p.source}
            {p.topics.length > 0 && ` · ${p.topics.join(", ")}`}
          </div>
        </div>
        <div className="hidden text-[13px] text-chalk-2 capitalize md:block">{p.difficulty}</div>
        <div className="num hidden text-right text-[12px] text-chalk-3 md:block">{ago(p.solvedAt ?? p.createdAt)}</div>
        <div className="flex items-center justify-end gap-1">
          <label className="sr-only" htmlFor={`st-${p.id}`}>
            Status of {p.title}
          </label>
          <select
            id={`st-${p.id}`}
            value={p.status}
            onChange={(e) => updateProblem(p.id, { status: e.target.value as ProblemStatus })}
            className={cn(
              "h-7 rounded-md border bg-onyx px-1.5 text-[12px] focus:outline-none",
              st.tone === "good" && "border-good/30 text-good",
              st.tone === "warn" && "border-warn/30 text-warn",
              st.tone === "sard" && "border-sard/35 text-sard",
              !st.tone && "border-seam-strong text-chalk-2",
            )}
          >
            {STATUS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeProblem(p.id)}
            className="rounded-md px-1.5 py-1 text-[12px] text-chalk-3 hover:text-bad"
            aria-label={`Delete ${p.title}`}
          >
            Delete
          </button>
        </div>
      </div>
      {open && p.notes && <p className="-mt-1 mb-3 rounded-lg bg-onyx px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap text-chalk-2">{p.notes}</p>}
    </li>
  );
}

export function Problems() {
  const problems = useOnyx((s) => s.problems);
  const params = useSearchParams();
  const [adding, setAdding] = useState(params.get("new") === "1");
  const [status, setStatus] = useState<ProblemStatus | "all">("all");
  const [topic, setTopic] = useState("");
  const [q, setQ] = useState("");

  const solved = problems.filter((p) => p.status === "solved");
  const solvedTimes = solved.map((p) => p.solvedAt ?? p.createdAt);
  const weekAgo = startOfDay() - 6 * 86400000;

  const topicStats = useMemo(() => {
    const m = new Map<string, { solved: number; open: number }>();
    for (const p of problems)
      for (const t of p.topics) {
        const e = m.get(t) ?? { solved: 0, open: 0 };
        if (p.status === "solved") e.solved++;
        else e.open++;
        m.set(t, e);
      }
    return [...m.entries()].sort((a, b) => b[1].solved + b[1].open - (a[1].solved + a[1].open));
  }, [problems]);

  const filtered = problems.filter(
    (p) =>
      (status === "all" || p.status === status) &&
      (!topic || p.topics.includes(topic)) &&
      (!q || p.title.toLowerCase().includes(q.toLowerCase()) || p.notes?.toLowerCase().includes(q.toLowerCase())),
  );
  const maxTopic = Math.max(1, ...topicStats.map(([, e]) => e.solved + e.open));

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-seam bg-slab p-5 md:grid-cols-4">
        <Figure label="Solved" value={solved.length} sub={`${solved.filter((p) => (p.solvedAt ?? 0) > weekAgo).length} this week`} />
        <Figure label="Streak" value={`${streak(solvedTimes)} days`} sub={solved.length ? `last ${ago(Math.max(...solvedTimes))}` : "solve one to start"} />
        <Figure label="To revisit" value={problems.filter((p) => p.status === "revisit" || p.status === "attempted").length} tone="sard" sub="attempted or flagged" />
        <Figure
          label="Hard solved"
          value={solved.filter((p) => p.difficulty === "hard").length}
          sub={`${solved.filter((p) => p.difficulty === "medium").length} medium · ${solved.filter((p) => p.difficulty === "easy").length} easy`}
        />
      </div>

      {adding && (
        <Panel title="Log a problem">
          <AddProblem onDone={() => setAdding(false)} autoFocus />
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Panel
          title={`Problems ${filtered.length !== problems.length ? `(${filtered.length} of ${problems.length})` : ""}`}
          action={
            !adding && (
              <Button variant="primary" size="sm" onClick={() => setAdding(true)}>
                Log a problem
              </Button>
            )
          }
          bodyClassName="p-0"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-seam px-4 py-3">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles and notes" className="h-8 max-w-[240px]" aria-label="Search problems" />
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
              {(["all", ...STATUS.map((s) => s.id)] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={status === s}
                  onClick={() => setStatus(s)}
                  className={cn("h-8 rounded-md px-2.5 text-[13px]", status === s ? "bg-shelf text-chalk" : "text-chalk-3 hover:text-chalk")}
                >
                  {s === "all" ? "All" : STATUS.find((x) => x.id === s)!.label}
                </button>
              ))}
            </div>
            {topic && (
              <button type="button" onClick={() => setTopic("")} className="ml-auto">
                <Pill tone="sard">{topic} ×</Pill>
              </button>
            )}
          </div>
          <div className="px-4">
            {problems.length === 0 ? (
              <div className="py-4">
                <Empty action={<Button variant="primary" size="sm" onClick={() => setAdding(true)}>Log your first problem</Button>}>
                  Nothing logged yet. Paste a problem link and Onyx fills in the title and judge.
                </Empty>
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-6 text-[14px] text-chalk-3">No problems match these filters.</p>
            ) : (
              <ul>
                {filtered.map((p) => (
                  <Row key={p.id} p={p} />
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <div className="grid content-start gap-5">
          <Panel title="Solves, last 20 weeks">
            <SolveGrid times={solvedTimes} />
          </Panel>
          <Panel title="By topic">
            {topicStats.length === 0 ? (
              <p className="text-[13px] text-chalk-3">Tag problems with topics to see where you are thin.</p>
            ) : (
              <ul className="grid gap-2.5">
                {topicStats.map(([t, e]) => (
                  <li key={t}>
                    <button type="button" onClick={() => setTopic(topic === t ? "" : t)} className="w-full text-left">
                      <div className="flex items-baseline justify-between text-[13px]">
                        <span className={topic === t ? "text-sard" : "text-chalk"}>{t}</span>
                        <span className="num text-chalk-3">
                          {e.solved} solved{e.open ? `, ${e.open} open` : ""}
                        </span>
                      </div>
                      <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-seam" style={{ width: `${((e.solved + e.open) / maxTopic) * 100}%` }}>
                        <div className="h-full bg-good/80" style={{ width: `${(e.solved / (e.solved + e.open)) * 100}%` }} />
                        <div className="h-full bg-sard/70" style={{ width: `${(e.open / (e.solved + e.open)) * 100}%` }} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
