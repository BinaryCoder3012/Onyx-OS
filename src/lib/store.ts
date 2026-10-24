"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CareerGoal,
  ChatTurn,
  FocusSession,
  Opening,
  Platform,
  PlatformStats,
  Problem,
  Profile,
  ResumeState,
  Roadmap,
} from "./types";
import { uid } from "./util";

/**
 * The whole workspace lives in the browser (localStorage). Nothing personal is stored
 * on a server; route handlers only proxy public platform APIs and the model.
 */
export interface OnyxState {
  profile: Profile;
  problems: Problem[];
  stats: Partial<Record<Platform, PlatformStats>>;
  roadmap: Roadmap | null;
  resume: ResumeState | null;
  goals: CareerGoal[];
  openings: Opening[];
  sessions: FocusSession[];
  chat: ChatTurn[];
  brief: { day: string; items: { title: string; why: string; href: string }[] } | null;

  updateProfile: (patch: Partial<Profile>) => void;
  setHandle: (platform: Platform, handle: string) => void;

  addProblem: (p: Omit<Problem, "id" | "createdAt">) => void;
  updateProblem: (id: string, patch: Partial<Problem>) => void;
  removeProblem: (id: string) => void;

  setStats: (platform: Platform, stats: PlatformStats | null) => void;

  setRoadmap: (r: Roadmap | null) => void;
  toggleStep: (phaseId: string, stepId: string) => void;

  setResume: (r: ResumeState | null) => void;

  addGoal: (g: Omit<CareerGoal, "id" | "createdAt" | "status">) => void;
  updateGoal: (id: string, patch: Partial<CareerGoal>) => void;
  removeGoal: (id: string) => void;

  addOpening: (o: Omit<Opening, "id" | "createdAt" | "updatedAt">) => void;
  updateOpening: (id: string, patch: Partial<Opening>) => void;
  removeOpening: (id: string) => void;

  logSession: (s: Omit<FocusSession, "id">) => void;
  removeSession: (id: string) => void;

  pushChat: (turn: Omit<ChatTurn, "id">) => string;
  patchChat: (id: string, content: string) => void;
  clearChat: () => void;

  setBrief: (b: OnyxState["brief"]) => void;

  importWorkspace: (data: Partial<OnyxState>) => void;
  resetWorkspace: () => void;
}

const empty = {
  profile: { name: "", targetRole: "", handles: {}, dailyGoal: 3 } as Profile,
  problems: [] as Problem[],
  stats: {} as OnyxState["stats"],
  roadmap: null,
  resume: null,
  goals: [] as CareerGoal[],
  openings: [] as Opening[],
  sessions: [] as FocusSession[],
  chat: [] as ChatTurn[],
  brief: null,
};

export const useOnyx = create<OnyxState>()(
  persist(
    (set) => ({
      ...empty,

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      setHandle: (platform, handle) =>
        set((s) => ({
          profile: { ...s.profile, handles: { ...s.profile.handles, [platform]: handle.trim() || undefined } },
        })),

      addProblem: (p) =>
        set((s) => ({
          problems: [
            { ...p, id: uid(), createdAt: Date.now(), solvedAt: p.status === "solved" ? Date.now() : undefined },
            ...s.problems,
          ],
        })),
      updateProblem: (id, patch) =>
        set((s) => ({
          problems: s.problems.map((p) => {
            if (p.id !== id) return p;
            const next = { ...p, ...patch };
            if (patch.status === "solved" && !p.solvedAt) next.solvedAt = Date.now();
            if (patch.status && patch.status !== "solved") next.solvedAt = undefined;
            return next;
          }),
        })),
      removeProblem: (id) => set((s) => ({ problems: s.problems.filter((p) => p.id !== id) })),

      setStats: (platform, stats) =>
        set((s) => {
          const next = { ...s.stats };
          if (stats) next[platform] = stats;
          else delete next[platform];
          return { stats: next };
        }),

      setRoadmap: (roadmap) => set({ roadmap }),
      toggleStep: (phaseId, stepId) =>
        set((s) => {
          if (!s.roadmap) return {};
          return {
            roadmap: {
              ...s.roadmap,
              phases: s.roadmap.phases.map((ph) =>
                ph.id !== phaseId
                  ? ph
                  : { ...ph, steps: ph.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st)) },
              ),
            },
          };
        }),

      setResume: (resume) => set({ resume }),

      addGoal: (g) =>
        set((s) => ({ goals: [{ ...g, id: uid(), status: "active", createdAt: Date.now() }, ...s.goals] })),
      updateGoal: (id, patch) => set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      removeGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      addOpening: (o) =>
        set((s) => ({
          openings: [{ ...o, id: uid(), createdAt: Date.now(), updatedAt: Date.now() }, ...s.openings],
        })),
      updateOpening: (id, patch) =>
        set((s) => ({
          openings: s.openings.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: Date.now() } : o)),
        })),
      removeOpening: (id) => set((s) => ({ openings: s.openings.filter((o) => o.id !== id) })),

      logSession: (session) => set((s) => ({ sessions: [{ ...session, id: uid() }, ...s.sessions] })),
      removeSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),

      pushChat: (turn) => {
        const id = uid();
        set((s) => ({ chat: [...s.chat, { ...turn, id }].slice(-60) }));
        return id;
      },
      patchChat: (id, content) => set((s) => ({ chat: s.chat.map((t) => (t.id === id ? { ...t, content } : t)) })),
      clearChat: () => set({ chat: [] }),

      setBrief: (brief) => set({ brief }),

      importWorkspace: (data) => set(() => ({ ...empty, ...pickData(data) })),
      resetWorkspace: () => set(() => ({ ...empty })),
    }),
    {
      name: "onyx-os",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => pickData(s),
    },
  ),
);

const DATA_KEYS = [
  "profile",
  "problems",
  "stats",
  "roadmap",
  "resume",
  "goals",
  "openings",
  "sessions",
  "chat",
  "brief",
] as const;

export function pickData(s: Partial<OnyxState>) {
  const out: Record<string, unknown> = {};
  for (const k of DATA_KEYS) if (s[k] !== undefined) out[k] = s[k];
  return out as Partial<Pick<OnyxState, (typeof DATA_KEYS)[number]>>;
}
