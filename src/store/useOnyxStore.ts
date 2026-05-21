import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { OnyxContext, OnyxModuleId, RoadmapNode } from "@/types";

interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  activeBreadcrumb: string[];
}

interface OnboardingState {
  step: number;
  completed: boolean;
}

interface RoadmapState {
  nodes: RoadmapNode[];
  activeNodeId: string | null;
}

interface OnyxStore {
  context: OnyxContext | null;
  ui: UIState;
  onboarding: OnboardingState;
  roadmap: RoadmapState;

  setContext: (context: OnyxContext | null) => void;
  setActiveModule: (moduleId: OnyxModuleId) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  setBreadcrumb: (trail: string[]) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  setRoadmapNodes: (nodes: RoadmapNode[]) => void;
  setActiveRoadmapNode: (nodeId: string | null) => void;
  reset: () => void;
}

const initialUI: UIState = {
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  activeBreadcrumb: ["Dashboard"],
};

const initialOnboarding: OnboardingState = {
  step: 0,
  completed: false,
};

const initialRoadmap: RoadmapState = {
  nodes: [],
  activeNodeId: null,
};

export const useOnyxStore = create<OnyxStore>()(
  devtools(
    persist(
      (set) => ({
        context: null,
        ui: initialUI,
        onboarding: initialOnboarding,
        roadmap: initialRoadmap,

        setContext: (context) => set({ context }),

        setActiveModule: (moduleId) =>
          set((state) => ({
            context: state.context
              ? { ...state.context, activeModule: moduleId }
              : null,
          })),

        toggleSidebar: () =>
          set((state) => ({
            ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
          })),

        setSidebarCollapsed: (collapsed) =>
          set((state) => ({
            ui: { ...state.ui, sidebarCollapsed: collapsed },
          })),

        openCommandPalette: () =>
          set((state) => ({
            ui: { ...state.ui, commandPaletteOpen: true },
          })),

        closeCommandPalette: () =>
          set((state) => ({
            ui: { ...state.ui, commandPaletteOpen: false },
          })),

        toggleCommandPalette: () =>
          set((state) => ({
            ui: {
              ...state.ui,
              commandPaletteOpen: !state.ui.commandPaletteOpen,
            },
          })),

        setBreadcrumb: (trail) =>
          set((state) => ({
            ui: { ...state.ui, activeBreadcrumb: trail },
          })),

        setOnboardingStep: (step) =>
          set((state) => ({
            onboarding: { ...state.onboarding, step },
          })),

        completeOnboarding: () =>
          set((state) => ({
            onboarding: { ...state.onboarding, completed: true, step: -1 },
          })),

        setRoadmapNodes: (nodes) =>
          set((state) => ({
            roadmap: { ...state.roadmap, nodes },
          })),

        setActiveRoadmapNode: (nodeId) =>
          set((state) => ({
            roadmap: { ...state.roadmap, activeNodeId: nodeId },
          })),

        reset: () =>
          set({
            context: null,
            ui: initialUI,
            onboarding: initialOnboarding,
            roadmap: initialRoadmap,
          }),
      }),
      {
        name: "onyx-store",
        partialize: (state) => ({
          ui: {
            sidebarCollapsed: state.ui.sidebarCollapsed,
          },
          onboarding: state.onboarding,
        }),
      }
    ),
    { name: "OnyxStore" }
  )
);
