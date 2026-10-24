"use client";

import { create } from "zustand";

/** Transient UI state for the workspace shell (not persisted). */
interface ShellState {
  askOpen: boolean;
  paletteOpen: boolean;
  navOpen: boolean;
  askDraft: string;
  setAsk: (open: boolean, draft?: string) => void;
  setDraft: (draft: string) => void;
  setPalette: (open: boolean) => void;
  setNav: (open: boolean) => void;
}

export const useShell = create<ShellState>((set) => ({
  askOpen: false,
  paletteOpen: false,
  navOpen: false,
  askDraft: "",
  setAsk: (askOpen, draft) => set((s) => ({ askOpen, askDraft: draft ?? s.askDraft, paletteOpen: false })),
  setDraft: (askDraft) => set({ askDraft }),
  setPalette: (paletteOpen) => set({ paletteOpen }),
  setNav: (navOpen) => set({ navOpen }),
}));
