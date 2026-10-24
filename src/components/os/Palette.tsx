"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/util";
import { NAV } from "./nav";
import { useShell } from "./ui-store";

interface Command {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

/** Ctrl/Cmd+K: jump anywhere or hand the typed text to the assistant. */
export function Palette() {
  const open = useShell((s) => s.paletteOpen);
  return open ? <PaletteBody /> : null;
}

function PaletteBody() {
  const setPalette = useShell((s) => s.setPalette);
  const setAsk = useShell((s) => s.setAsk);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(
    () => [
      ...NAV.map((n) => ({ id: n.href, label: `Go to ${n.label}`, hint: n.hint, run: () => router.push(n.href) })),
      { id: "log", label: "Log a problem", hint: "Problems", run: () => router.push("/os/problems?new=1") },
      { id: "timer", label: "Start a focus block", hint: "Focus", run: () => router.push("/os/focus") },
      { id: "opening", label: "Add an opening", hint: "Openings", run: () => router.push("/os/openings?new=1") },
      { id: "home", label: "Back to the landing page", hint: "onyx", run: () => router.push("/") },
    ],
    [router],
  );

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? commands.filter((c) => c.label.toLowerCase().includes(needle) || c.hint.toLowerCase().includes(needle))
      : commands;
    const ask: Command[] = needle
      ? [{ id: "ask", label: `Ask Onyx: “${q.trim()}”`, hint: "Assistant", run: () => setAsk(true, q.trim()) }]
      : [];
    return [...list, ...ask];
  }, [q, commands, setAsk]);

  useEffect(() => {
    input.current?.focus();
  }, []);

  function choose(c: Command | undefined) {
    if (!c) return;
    setPalette(false);
    c.run();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/55 px-4 pt-[14vh]" onMouseDown={() => setPalette(false)}>
      <div
        role="dialog"
        aria-label="Command palette"
        className="w-full max-w-[560px] overflow-hidden rounded-xl border border-seam-strong bg-slab shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(results.length - 1, s + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(0, s - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(results[sel]);
            } else if (e.key === "Escape") setPalette(false);
          }}
          placeholder="Jump to a page, or type a question"
          aria-label="Search commands"
          className="h-13 w-full border-b border-seam bg-transparent px-4 text-[15px] text-chalk placeholder:text-chalk-3 focus:outline-none"
        />
        <ul className="scroll-quiet max-h-[360px] overflow-y-auto p-1.5" role="listbox">
          {results.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === sel}>
              <button
                type="button"
                onMouseEnter={() => setSel(i)}
                onClick={() => choose(c)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[14px]",
                  i === sel ? "bg-shelf text-chalk" : "text-chalk-2",
                )}
              >
                <span>{c.label}</span>
                <span className="text-[12px] text-chalk-3">{c.hint}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-3 py-3 text-[14px] text-chalk-3">Nothing matches.</li>}
        </ul>
      </div>
    </div>
  );
}
