"use client";

import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { pickData, useOnyx } from "@/lib/store";
import { Button, ErrorLine, Input, Label, Panel } from "@/components/ui";

export function Settings() {
  const profile = useOnyx((s) => s.profile);
  const updateProfile = useOnyx((s) => s.updateProfile);
  const importWorkspace = useOnyx((s) => s.importWorkspace);
  const resetWorkspace = useOnyx((s) => s.resetWorkspace);
  const counts = useOnyx(
    useShallow((s) => ({ p: s.problems.length, o: s.openings.length, g: s.goals.length, f: s.sessions.length })),
  );
  const [status, setStatus] = useState<{ configured: boolean; model: string; host: string } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  function exportFile() {
    const data = JSON.stringify({ app: "onyx-os", version: 2, exportedAt: new Date().toISOString(), data: pickData(useOnyx.getState()) }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `onyx-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Workspace exported.");
  }

  async function importFile(f: File) {
    setError("");
    setMessage("");
    try {
      const json = JSON.parse(await f.text()) as { app?: string; data?: Record<string, unknown> };
      if (json.app !== "onyx-os" || !json.data) throw new Error("That file is not an Onyx OS export.");
      importWorkspace(json.data);
      setMessage(`Loaded ${f.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
    }
  }

  return (
    <div className="grid max-w-[760px] gap-5">
      <Panel title="You">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <Label>Name</Label>
            <Input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} placeholder="Lakshya" />
          </label>
          <label className="block">
            <Label>Target role</Label>
            <Input value={profile.targetRole} onChange={(e) => updateProfile({ targetRole: e.target.value })} placeholder="Backend engineer" />
          </label>
          <label className="block">
            <Label hint="problems a day">Daily goal</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={profile.dailyGoal}
              onChange={(e) => updateProfile({ dailyGoal: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })}
            />
          </label>
        </div>
        <p className="mt-4 text-[13px] text-chalk-3">Contest handles live on the Ratings page.</p>
      </Panel>

      <Panel title="Assistant">
        {status ? (
          <p className="text-[14px] leading-relaxed text-chalk-2">
            {status.configured ? (
              <>
                Connected to <span className="text-chalk">{status.host}</span> using <span className="text-chalk">{status.model}</span>.
              </>
            ) : (
              <>
                <span className="text-bad">Not connected.</span> Set <code className="text-chalk">OLLAMA_API_KEY</code> in the server
                environment (<code className="text-chalk">.env.local</code> locally, project settings on Vercel) and restart.
              </>
            )}
          </p>
        ) : (
          <p className="text-[14px] text-chalk-3">Checking…</p>
        )}
      </Panel>

      <Panel title="Your data">
        <p className="text-[14px] leading-relaxed text-chalk-2">
          Everything is stored in this browser: <span className="num text-chalk">{counts.p}</span> problems,{" "}
          <span className="num text-chalk">{counts.o}</span> openings, <span className="num text-chalk">{counts.g}</span> goals and{" "}
          <span className="num text-chalk">{counts.f}</span> focus sessions. Export it to keep a copy or move to another machine.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={exportFile}>Export workspace</Button>
          <Button onClick={() => file.current?.click()}>Import a file</Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importFile(f);
              e.target.value = "";
            }}
          />
        </div>
        {message && <p className="mt-3 text-[13px] text-good">{message}</p>}
        <div className="mt-3">
          <ErrorLine>{error}</ErrorLine>
        </div>
      </Panel>

      <Panel title="Start over">
        <p className="text-[14px] leading-relaxed text-chalk-2">Clears every problem, rating, roadmap, review, goal, opening and session from this browser.</p>
        <div className="mt-4 flex gap-2">
          {confirmReset ? (
            <>
              <Button
                variant="danger"
                className="border border-bad/40"
                onClick={() => {
                  resetWorkspace();
                  setConfirmReset(false);
                  setMessage("");
                }}
              >
                Yes, clear everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Keep it
              </Button>
            </>
          ) : (
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              Clear workspace
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
}
