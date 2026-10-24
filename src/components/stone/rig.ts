import { create } from "zustand";
import type { Band } from "./bands";

/**
 * Plain mutable values GSAP tweens and the render loop reads every frame.
 * Kept outside React state so scrolling never re-renders the scene.
 */
export const stoneRig = {
  /** 0 = one solid stone, 1 = layers fanned apart */
  split: 0,
  /** which layer is pulled forward (fractional while scrolling), -1 for none */
  active: -1,
  /** extra turn added when a new history is cut */
  spin: 0,
  /** horizontal placement of the stone in view units */
  offsetX: 0,
  scale: 1,
};

export const LAYERS = 7;

interface BandsState {
  bands: Band[] | null;
  setBands: (b: Band[] | null) => void;
}

export const useBands = create<BandsState>((set) => ({
  bands: null,
  setBands: (bands) => set({ bands }),
}));
