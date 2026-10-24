import { clsx, type ClassValue } from "clsx";
import { useSyncExternalStore } from "react";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

const noop = () => () => {};

/** True once on the client, so persisted localStorage state can render without a hydration mismatch. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function dayKey(t: number | Date = Date.now()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function startOfDay(t: number = Date.now()) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function ago(t: number) {
  const diff = (t - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  return new Date(t).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntil(date: string) {
  const target = new Date(date + "T23:59:59").getTime();
  return Math.ceil((target - Date.now()) / 86400000);
}

export function fmtMinutes(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

/** Consecutive days (ending today or yesterday) that contain at least one timestamp. */
export function streak(timestamps: number[]) {
  const days = new Set(timestamps.map((t) => dayKey(t)));
  let count = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export async function readError(res: Response) {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
