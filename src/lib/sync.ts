"use client";

import { useOnyx } from "./store";
import type { Platform, PlatformStats } from "./types";
import { readError } from "./util";

/** Fetches a judge profile through our API and stores it. Returns an error message or null. */
export async function syncPlatform(platform: Platform, handle: string): Promise<string | null> {
  const h = handle.trim();
  if (!h) {
    useOnyx.getState().setStats(platform, null);
    return null;
  }
  try {
    const res = await fetch(`/api/platforms/${platform}?handle=${encodeURIComponent(h)}`);
    if (!res.ok) return await readError(res);
    const stats = (await res.json()) as PlatformStats;
    useOnyx.getState().setStats(platform, stats);
    return null;
  } catch {
    return "Network error. Check your connection and try again.";
  }
}

export const TOPICS = [
  "Arrays",
  "Strings",
  "Hashing",
  "Two pointers",
  "Sliding window",
  "Binary search",
  "Sorting",
  "Greedy",
  "Stack",
  "Queue",
  "Linked list",
  "Trees",
  "BST",
  "Heap",
  "Graphs",
  "BFS/DFS",
  "Shortest paths",
  "Union-find",
  "Dynamic programming",
  "Bit manipulation",
  "Math",
  "Number theory",
  "Combinatorics",
  "Geometry",
  "Tries",
  "Segment tree",
  "Backtracking",
  "Implementation",
];
