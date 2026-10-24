"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useOnyx } from "@/lib/store";
import { candidateProfile } from "@/lib/context";
import type { Opening, OpeningStage } from "@/lib/types";
import { cn, daysUntil, readError } from "@/lib/util";
import { Button, Empty, ErrorLine, Input, Label, Panel, Pill, Select, Spinner, Textarea } from "@/components/ui";

const STAGES: { id: OpeningStage; label: string }[] = [
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interviewing" },
  { id: "offer", label: "Offer" },
];

function AddOpening({ onDone }: { onDone: () => void }) {
  const addOpening = useOnyx((s) => s.addOpening);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [kind, setKind] = useState<Opening["kind"]>("internship");
  const [url, setUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addOpening({ company: company.trim(), role: role.trim(), kind, url: url.trim() || undefined, deadline: deadline || undefined, notes: notes.trim() || undefined, stage: "saved" });
    onDone();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <Label>Company</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Stripe" required autoFocus />
        </label>
        <label className="block">
          <Label>Role</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software engineering intern" required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <Label>Type</Label>
          <Select value={kind} onChange={(e) => setKind(e.target.value as Opening["kind"])}>
            <option value="internship">Internship</option>
            <option value="full-time">Full-time</option>
            <option value="contract">Contract</option>
          </Select>
        </label>
        <label className="block">
          <Label hint="optional">Apply by</Label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </label>
        <label className="block">
          <Label hint="optional">Link</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
        </label>
      </div>
      <label className="block">
        <Label hint="paste the job description for a better fit check">Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Requirements, recruiter name, referral…" />
      </label>
      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={!company.trim() || !role.trim()}>
          Save opening
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Close
        </Button>
      </div>
    </form>
  );
}

function Card({ o }: { o: Opening }) {
  const updateOpening = useOnyx((s) => s.updateOpening);
  const removeOpening = useOnyx((s) => s.removeOpening);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const idx = STAGES.findIndex((s) => s.id === o.stage);
  const left = o.deadline ? daysUntil(o.deadline) : null;

  async function checkFit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: o.company, role: o.role, notes: o.notes ?? "", profile: candidateProfile(useOnyx.getState()) }),
      });
      if (!res.ok) throw new Error(await readError(res));
      updateOpening(o.id, { fit: await res.json() });
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fit check failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-lg border border-seam bg-onyx p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-medium text-chalk">{o.company}</div>
          <div className="truncate text-[13px] text-chalk-2">
            {o.url ? (
              <a href={o.url} target="_blank" rel="noreferrer" className="hover:underline">
                {o.role}
              </a>
            ) : (
              o.role
            )}
          </div>
        </div>
        {o.fit && (
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="shrink-0">
            <Pill tone={o.fit.score >= 70 ? "good" : o.fit.score >= 45 ? "agate" : "sard"}>fit {o.fit.score}</Pill>
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Pill>{o.kind}</Pill>
        {left != null && o.stage === "saved" && (
          <Pill tone={left < 0 ? "bad" : left <= 3 ? "sard" : left <= 7 ? "warn" : undefined}>
            {left < 0 ? "deadline passed" : left === 0 ? "due today" : `${left} days to apply`}
          </Pill>
        )}
      </div>
      {open && o.fit && (
        <div className="mt-3 grid gap-2 border-t border-seam pt-3 text-[12px] leading-relaxed">
          <ul className="grid gap-1 text-chalk-2">
            {o.fit.reasons.map((r, i) => (
              <li key={i}>+ {r}</li>
            ))}
          </ul>
          <ul className="grid gap-1 text-sard">
            {o.fit.gaps.map((g, i) => (
              <li key={i}>− {g}</li>
            ))}
          </ul>
        </div>
      )}
      <ErrorLine>{error}</ErrorLine>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        {idx > 0 && (
          <Button size="sm" variant="ghost" onClick={() => updateOpening(o.id, { stage: STAGES[idx - 1].id })} aria-label={`Move back to ${STAGES[idx - 1].label}`}>
            ← {STAGES[idx - 1].label}
          </Button>
        )}
        {idx >= 0 && idx < STAGES.length - 1 && (
          <Button size="sm" onClick={() => updateOpening(o.id, { stage: STAGES[idx + 1].id })}>
            {STAGES[idx + 1].label} →
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={checkFit} disabled={busy}>
          {busy ? <Spinner /> : o.fit ? "Recheck fit" : "Check fit"}
        </Button>
        <span className="ml-auto flex">
          {o.stage !== "closed" ? (
            <Button size="sm" variant="ghost" onClick={() => updateOpening(o.id, { stage: "closed" })}>
              Close
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => updateOpening(o.id, { stage: "saved" })}>
              Reopen
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => removeOpening(o.id)} aria-label={`Delete ${o.company}`}>
            Delete
          </Button>
        </span>
      </div>
    </li>
  );
}

export function Openings() {
  const openings = useOnyx((s) => s.openings);
  const params = useSearchParams();
  const [adding, setAdding] = useState(params.get("new") === "1");
  const [showClosed, setShowClosed] = useState(false);
  const closed = openings.filter((o) => o.stage === "closed");

  const byStage = (id: OpeningStage) =>
    openings
      .filter((o) => o.stage === id)
      .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") || b.updatedAt - a.updatedAt);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-chalk-2">
          <span className="num text-chalk">{openings.length - closed.length}</span> open ·{" "}
          <span className="num text-chalk">{byStage("applied").length + byStage("interview").length}</span> in flight ·{" "}
          <span className="num text-chalk">{byStage("offer").length}</span> offers
        </p>
        {!adding && (
          <Button variant="primary" onClick={() => setAdding(true)}>
            Add an opening
          </Button>
        )}
      </div>

      {adding && (
        <Panel title="Add an opening">
          <AddOpening onDone={() => setAdding(false)} />
        </Panel>
      )}

      {openings.length === 0 && !adding ? (
        <Empty action={<Button variant="primary" size="sm" onClick={() => setAdding(true)}>Add your first opening</Button>}>
          Save roles you want to apply to. Each one counts down to its deadline and can be checked against your resume.
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((s) => {
            const list = byStage(s.id);
            return (
              <section key={s.id} className="flex flex-col rounded-xl border border-seam bg-slab">
                <header className="flex h-11 items-center justify-between border-b border-seam px-3.5">
                  <h2 className={cn("text-[14px] font-semibold", s.id === "offer" && list.length ? "text-good" : "text-chalk")}>{s.label}</h2>
                  <span className="num text-[13px] text-chalk-3">{list.length}</span>
                </header>
                <ul className="grid content-start gap-2 p-2.5">
                  {list.map((o) => (
                    <Card key={o.id} o={o} />
                  ))}
                  {list.length === 0 && <li className="px-1.5 py-3 text-[13px] text-chalk-3">None yet.</li>}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowClosed(!showClosed)} className="text-[13px] text-chalk-3 hover:text-chalk" aria-expanded={showClosed}>
            {showClosed ? "Hide" : "Show"} {closed.length} closed
          </button>
          {showClosed && (
            <ul className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {closed.map((o) => (
                <Card key={o.id} o={o} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
