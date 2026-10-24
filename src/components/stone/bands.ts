import * as THREE from "three";
import type { RatingPoint } from "@/lib/types";

/**
 * Onyx is layered: dark chalcedony crossed by thin milky bands, with sard (red-orange) in sardonyx.
 * A band list is drawn into a canvas texture with a little warp so it reads as stone, not stripes.
 */
export interface Band {
  /** relative thickness */
  w: number;
  tone: "onyx" | "smoke" | "chalk" | "sard";
}

const TONES: Record<Band["tone"], [number, number, number]> = {
  onyx: [16, 14, 13],
  smoke: [74, 67, 60],
  chalk: [226, 219, 207],
  sard: [184, 86, 44],
};

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The stone's own banding, used until someone cuts their history into it. */
export function naturalBands(seed = 7): Band[] {
  const rnd = mulberry(seed);
  const out: Band[] = [];
  for (let i = 0; i < 46; i++) {
    out.push({ w: 2 + rnd() * 7, tone: "onyx" });
    const r = rnd();
    if (r < 0.45) out.push({ w: 0.5 + rnd() * 1.2, tone: "chalk" });
    else if (r < 0.75) out.push({ w: 1.5 + rnd() * 4, tone: "smoke" });
    else if (r < 0.88) out.push({ w: 0.8 + rnd() * 2.4, tone: "sard" });
  }
  return out;
}

/**
 * The contest history as bands: chalk where the rating rose, sard where it fell hard, smoke for small dips.
 * Long histories are grouped so the stone keeps a readable number of bands.
 */
export function historyBands(history: RatingPoint[]): Band[] {
  const deltas = history.map((h, i) => (i === 0 ? 0 : h.rating - history[i - 1].rating)).slice(1);
  const groups = Math.min(60, deltas.length);
  const size = deltas.length / groups;
  const out: Band[] = [];
  for (let g = 0; g < groups; g++) {
    const slice = deltas.slice(Math.floor(g * size), Math.floor((g + 1) * size));
    const delta = slice.reduce((a, d) => a + d, 0);
    const mag = Math.min(Math.abs(delta), 300) / 300;
    out.push({ w: 2.2 + (1 - mag) * 3, tone: "onyx" });
    out.push({
      w: 0.5 + mag * 3.4,
      tone: delta >= 0 ? "chalk" : delta < -40 ? "sard" : "smoke",
    });
  }
  return out;
}

function noise1(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const h = (n: number) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };
  const u = f * f * (3 - 2 * f);
  return h(i) * (1 - u) + h(i + 1) * u;
}

export function bandTexture(bands: Band[], size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);

  const total = bands.reduce((a, b) => a + b.w, 0);
  const edges: number[] = [];
  let acc = 0;
  for (const b of bands) {
    acc += b.w / total;
    edges.push(acc);
  }

  // Precompute per-column warp so each row lookup stays cheap.
  const warp = new Float32Array(size);
  for (let x = 0; x < size; x++) {
    const u = x / size;
    warp[x] =
      0.09 * Math.sin(u * Math.PI * 2 * 0.8 + 0.7) +
      0.06 * (noise1(u * 3) - 0.5) +
      0.003 * (noise1(u * 23) - 0.5);
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = y / size + warp[x] * (0.7 + 0.3 * Math.sin(y * 0.006 + x * 0.002));
      v = v - Math.floor(v);
      // binary search the band
      let lo = 0;
      let hi = edges.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (edges[mid] < v) lo = mid + 1;
        else hi = mid;
      }
      const a = TONES[bands[lo].tone];
      const b = TONES[bands[(lo + 1) % bands.length].tone];
      const edge = edges[lo];
      const width = (bands[lo].w / total);
      const f = Math.max(0, 1 - (edge - v) / Math.max(width * 0.35, 0.0008));
      const m = f * f * 0.5;
      const c = [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m, a[2] + (b[2] - a[2]) * m];
      const grain = (noise1(x * 0.9 + y * 13.7) - 0.5) * 3;
      const i = (y * size + x) * 4;
      img.data[i] = c[0] + grain;
      img.data[i + 1] = c[1] + grain;
      img.data[i + 2] = c[2] + grain;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}
