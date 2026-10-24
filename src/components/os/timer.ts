"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useOnyx } from "@/lib/store";

/** The focus timer lives outside any page so it keeps running while you move around the workspace. */
interface TimerState {
  label: string;
  plannedMin: number;
  startedAt: number | null;
  accumulatedMs: number;
  setLabel: (label: string) => void;
  setPlanned: (min: number) => void;
  start: () => void;
  pause: () => void;
  finish: () => number;
  discard: () => void;
}

export function elapsedMs(s: Pick<TimerState, "startedAt" | "accumulatedMs">, now = Date.now()) {
  return s.accumulatedMs + (s.startedAt ? now - s.startedAt : 0);
}

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      label: "",
      plannedMin: 50,
      startedAt: null,
      accumulatedMs: 0,
      setLabel: (label) => set({ label }),
      setPlanned: (plannedMin) => set({ plannedMin }),
      start: () => set((s) => (s.startedAt ? {} : { startedAt: Date.now() })),
      pause: () => set((s) => (s.startedAt ? { accumulatedMs: elapsedMs(s), startedAt: null } : {})),
      finish: () => {
        const s = get();
        const minutes = Math.round(Math.min(elapsedMs(s), s.plannedMin * 60000) / 60000);
        if (minutes >= 1) useOnyx.getState().logSession({ label: s.label.trim() || "Focus", minutes, endedAt: Date.now() });
        set({ startedAt: null, accumulatedMs: 0 });
        return minutes;
      },
      discard: () => set({ startedAt: null, accumulatedMs: 0 }),
    }),
    { name: "onyx-timer", storage: createJSONStorage(() => localStorage) },
  ),
);

/** Re-renders every second while the timer runs and completes the block when time is up. */
export function useTimerTick() {
  const startedAt = useTimer((s) => s.startedAt);
  const [, setNow] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => {
      const s = useTimer.getState();
      if (elapsedMs(s) >= s.plannedMin * 60000) s.finish();
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
}

export function clock(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
