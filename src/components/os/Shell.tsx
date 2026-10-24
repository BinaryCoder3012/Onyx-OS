"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Wordmark } from "@/components/brand/Mark";
import { useOnyx } from "@/lib/store";
import { cn, useHydrated } from "@/lib/util";
import { Ask } from "./Ask";
import { Palette } from "./Palette";
import { NAV, navFor } from "./nav";
import { useShell } from "./ui-store";
import { clock, elapsedMs, useTimer, useTimerTick } from "./timer";

/** Shows the running focus block in the header from any page, and completes it on time. */
function TimerChip() {
  useTimerTick();
  const hydrated = useHydrated();
  const t = useTimer();
  if (!hydrated || (!t.startedAt && !t.accumulatedMs)) return null;
  return (
    <Link
      href="/os/focus"
      className="num hidden h-9 items-center gap-2 rounded-lg px-3 text-[14px] text-chalk-2 hover:text-chalk sm:flex"
      aria-label="Focus timer"
    >
      <span className={cn("size-1.5 rounded-full", t.startedAt ? "bg-good" : "bg-warn")} aria-hidden />
      {clock(t.plannedMin * 60000 - elapsedMs(t))}
    </Link>
  );
}

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
}

function Nav({ onPick }: { onPick?: () => void }) {
  const pathname = usePathname();
  const current = navFor(pathname);
  return (
    <nav aria-label="Workspace" className="flex flex-col gap-0.5">
      {NAV.map((n) => {
        const on = n.href === current.href;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onPick}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex h-9 items-center rounded-lg px-3 text-[14px] transition-colors",
              on ? "bg-shelf text-chalk" : "text-chalk-2 hover:text-chalk",
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Identity() {
  const hydrated = useHydrated();
  const name = useOnyx((s) => s.profile.name);
  const role = useOnyx((s) => s.profile.targetRole);
  if (!hydrated) return <div className="h-10" />;
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <Link href="/os/settings" className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-shelf">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sard/15 text-[13px] font-semibold text-sard">{initial}</span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] text-chalk">{name || "Add your name"}</span>
        <span className="block truncate text-[12px] text-chalk-3">{role || "Set a target role"}</span>
      </span>
    </Link>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = navFor(pathname);
  const { setAsk, setPalette, setNav, navOpen, askOpen, paletteOpen } = useShell();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(!useShell.getState().paletteOpen);
        return;
      }
      if (e.key === "Escape") {
        if (useShell.getState().paletteOpen) setPalette(false);
        else if (useShell.getState().askOpen) setAsk(false);
        return;
      }
      if (e.key === "/" && !isTyping(e)) {
        e.preventDefault();
        setAsk(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setAsk, setPalette]);

  useEffect(() => setNav(false), [pathname, setNav]);

  return (
    <div className="min-h-dvh overflow-x-clip bg-onyx">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-seam bg-onyx px-3 py-4 lg:flex">
        <Link href="/" className="mb-6 px-2 py-1" aria-label="Onyx OS landing page">
          <Wordmark />
        </Link>
        <Nav />
        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={() => setPalette(true)}
            className="flex w-full items-center justify-between rounded-lg border border-seam px-3 py-2 text-[13px] text-chalk-3 hover:text-chalk"
          >
            Jump anywhere <kbd className="text-[12px]">Ctrl K</kbd>
          </button>
          <Identity />
        </div>
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setNav(false)} aria-hidden />
          <div className="absolute inset-y-0 left-0 flex w-[260px] flex-col border-r border-seam bg-onyx px-3 py-4">
            <Link href="/" className="mb-6 px-2 py-1">
              <Wordmark />
            </Link>
            <Nav onPick={() => setNav(false)} />
            <div className="mt-auto">
              <Identity />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-[232px]">
        <header className="sticky top-0 z-20 border-b border-seam bg-onyx/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-3 px-4 md:px-8">
            <button
              type="button"
              className="-ml-1 rounded-lg px-2 py-1.5 text-[14px] text-chalk-2 hover:text-chalk lg:hidden"
              onClick={() => setNav(true)}
              aria-label="Open navigation"
              aria-expanded={navOpen}
            >
              Menu
            </button>
            <h1 className="text-[15px] font-semibold text-chalk">{current.label}</h1>
            <span className="hidden text-[13px] text-chalk-3 md:inline">{current.hint}</span>
            <div className="ml-auto flex items-center gap-2">
              <TimerChip />
              <button
                type="button"
                onClick={() => setAsk(!askOpen)}
                aria-expanded={askOpen}
                className="flex h-9 items-center gap-2.5 rounded-lg border border-seam-strong bg-slab px-3 text-[14px] text-chalk hover:border-chalk-3"
              >
                <span className="size-1.5 rounded-full bg-sard" aria-hidden />
                Ask Onyx
                <kbd className="hidden text-[12px] text-chalk-3 sm:inline">/</kbd>
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1240px] px-4 py-6 md:px-8 md:py-8" aria-hidden={paletteOpen || undefined}>
          {children}
        </main>
      </div>

      <Ask />
      <Palette />
    </div>
  );
}
