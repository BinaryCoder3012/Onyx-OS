"use client";

import { useRef, useState } from "react";
import { useOnyx } from "@/lib/store";
import type { ResumeReview } from "@/lib/types";
import { ago, cn, readError } from "@/lib/util";
import { Button, ErrorLine, Input, Label, Meter, Panel, Pill, Spinner, Textarea } from "@/components/ui";

function scoreTone(n: number) {
  return n >= 75 ? "good" : n >= 55 ? "agate" : "sard";
}

function Uploader({ onCancel }: { onCancel?: () => void }) {
  const setResume = useOnyx((s) => s.setResume);
  const profileRole = useOnyx((s) => s.profile.targetRole);
  const previous = useOnyx((s) => s.resume);
  const [file, setFile] = useState<File | null>(null);
  const [paste, setPaste] = useState("");
  const [mode, setMode] = useState<"file" | "text">("file");
  const [role, setRole] = useState(previous?.targetRole || profileRole || "");
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function analyse(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("targetRole", role);
    if (mode === "file" && file) form.set("file", file);
    else form.set("text", paste);
    try {
      const res = await fetch("/api/ai/resume", { method: "POST", body: form });
      if (!res.ok) throw new Error(await readError(res));
      const data = (await res.json()) as { text: string; review: ResumeReview };
      setResume({
        fileName: mode === "file" && file ? file.name : "Pasted text",
        text: data.text,
        targetRole: role,
        review: data.review,
        analyzedAt: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyse the resume.");
    } finally {
      setBusy(false);
    }
  }

  const ready = mode === "file" ? !!file : paste.trim().length >= 200;

  return (
    <Panel title="Review your resume" className="max-w-[760px]">
      <form onSubmit={analyse} className="grid gap-5">
        <label className="block">
          <Label hint="shapes the scoring">Role you are applying for</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Backend engineer intern" />
        </label>

        <div className="flex gap-1" role="tablist" aria-label="Resume source">
          {(["file", "text"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn("h-8 rounded-md px-3 text-[13px]", mode === m ? "bg-shelf text-chalk" : "text-chalk-3 hover:text-chalk")}
            >
              {m === "file" ? "Upload a file" : "Paste text"}
            </button>
          ))}
        </div>

        {mode === "file" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files[0];
              if (f) setFile(f);
            }}
            className={cn(
              "flex flex-col items-start gap-3 rounded-xl border border-dashed px-5 py-8 transition-colors",
              drag ? "border-sard bg-sard/5" : "border-seam-strong",
            )}
          >
            <p className="text-[14px] text-chalk">{file ? file.name : "Drop your resume here"}</p>
            <p className="text-[13px] text-chalk-3">
              {file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF, DOCX or TXT, up to 4 MB. Text PDFs work; scans have no text to read."}
            </p>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.docx,.txt,.md,application/pdf"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              id="resume-file"
            />
            <Button size="sm" onClick={() => fileInput.current?.click()}>
              {file ? "Choose another file" : "Choose a file"}
            </Button>
          </div>
        ) : (
          <label className="block">
            <Label hint={`${paste.trim().length} characters`}>Resume text</Label>
            <Textarea value={paste} onChange={(e) => setPaste(e.target.value)} className="min-h-[220px]" placeholder="Paste the full text of your resume" />
          </label>
        )}

        <ErrorLine>{error}</ErrorLine>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={!ready || busy}>
            {busy ? (
              <>
                <Spinner className="border-onyx/40 border-t-transparent" /> Reading it, about 20 seconds
              </>
            ) : (
              "Review it"
            )}
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Keep the last review
            </Button>
          )}
        </div>
      </form>
    </Panel>
  );
}

export function Resume() {
  const resume = useOnyx((s) => s.resume);
  const [again, setAgain] = useState(false);

  if (!resume?.review || again) return <Uploader onCancel={resume?.review ? () => setAgain(false) : undefined} />;
  const r = resume.review;

  return (
    <div className="grid gap-5">
      <section className="grid gap-6 rounded-xl border border-seam bg-slab p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div>
          <div className="text-[13px] text-chalk-2">Score</div>
          <div className={cn("num font-display text-[56px] leading-none font-semibold", { good: "text-good", agate: "text-agate", sard: "text-sard" }[scoreTone(r.score)])}>{r.score}</div>
        </div>
        <div className="max-w-[640px]">
          <p className="text-[15px] leading-relaxed text-chalk">{r.verdict}</p>
          <p className="mt-2 text-[13px] text-chalk-3">
            {resume.fileName} · for {resume.targetRole || "software engineer"} · reviewed {ago(resume.analyzedAt ?? 0)}
          </p>
        </div>
        <Button onClick={() => setAgain(true)}>Review a new version</Button>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="grid content-start gap-5">
          <Panel title="Bullets, rewritten">
            {r.rewrites.length === 0 ? (
              <p className="text-[14px] text-chalk-3">No rewrites suggested.</p>
            ) : (
              <ul className="grid gap-5">
                {r.rewrites.map((w, i) => (
                  <li key={i} className="grid gap-2">
                    <p className="text-[13px] leading-relaxed text-chalk-3 line-through decoration-seam-strong">{w.before}</p>
                    <div className="flex items-start gap-3">
                      <p className="flex-1 text-[14px] leading-relaxed text-chalk">{w.after}</p>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard?.writeText(w.after)}>
                        Copy
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Section by section">
            <ul className="grid gap-5">
              {r.sections.map((s) => (
                <li key={s.name}>
                  <div className="flex items-baseline justify-between text-[14px]">
                    <span className="font-medium text-chalk">{s.name}</span>
                    <span className="num text-chalk-2">{s.score}</span>
                  </div>
                  <Meter value={s.score} tone={scoreTone(s.score) === "good" ? "good" : scoreTone(s.score) === "agate" ? "agate" : "sard"} className="mt-2" />
                  <ul className="mt-2 grid gap-1">
                    {s.notes.map((n, i) => (
                      <li key={i} className="text-[13px] leading-relaxed text-chalk-2">
                        {n}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="grid content-start gap-5">
          <Panel title="Missing for this role">
            {r.missingKeywords.length ? (
              <div className="flex flex-wrap gap-1.5">
                {r.missingKeywords.map((k) => (
                  <Pill key={k} tone="sard">
                    {k}
                  </Pill>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-chalk-3">Nothing obvious is missing.</p>
            )}
          </Panel>
          <Panel title="Text Onyx read">
            <p className="scroll-quiet max-h-[320px] overflow-y-auto text-[12px] leading-relaxed whitespace-pre-wrap text-chalk-3">{resume.text}</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
