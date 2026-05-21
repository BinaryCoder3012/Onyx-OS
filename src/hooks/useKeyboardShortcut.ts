"use client";

import { useEffect, useRef } from "react";

type Modifier = "ctrl" | "meta" | "alt" | "shift";

interface ShortcutConfig {
  key: string;
  modifiers?: Modifier[];
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean;
}

function matchesShortcut(
  event: KeyboardEvent,
  key: string,
  modifiers: Modifier[] = []
): boolean {
  const normalizedKey = key.toLowerCase();
  if (event.key.toLowerCase() !== normalizedKey) return false;

  const needsCtrl = modifiers.includes("ctrl");
  const needsMeta = modifiers.includes("meta");
  const needsAlt = modifiers.includes("alt");
  const needsShift = modifiers.includes("shift");

  if (needsCtrl && !event.ctrlKey) return false;
  if (needsMeta && !event.metaKey) return false;
  if (needsAlt !== event.altKey) return false;
  if (needsShift !== event.shiftKey) return false;

  if (modifiers.length === 0) {
    return !event.ctrlKey && !event.metaKey && !event.altKey;
  }

  return true;
}

export function useKeyboardShortcut(config: ShortcutConfig): void {
  const { key, modifiers = [], handler, enabled = true } = config;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!matchesShortcut(event, key, modifiers)) return;
      event.preventDefault();
      handlerRef.current(event);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, modifiers, enabled]);
}

export function useCommandPaletteShortcut(
  onToggle: () => void,
  enabled = true
): void {
  useKeyboardShortcut({
    key: "k",
    modifiers: ["meta"],
    handler: onToggle,
    enabled,
  });
  useKeyboardShortcut({
    key: "k",
    modifiers: ["ctrl"],
    handler: onToggle,
    enabled,
  });
}
