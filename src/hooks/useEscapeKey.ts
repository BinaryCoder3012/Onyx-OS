"use client";

import { useKeyboardShortcut } from "./useKeyboardShortcut";

export function useEscapeKey(handler: () => void, enabled = true): void {
  useKeyboardShortcut({
    key: "Escape",
    handler,
    enabled,
  });
}
