"use client";

import { useOnyxStore } from "@/store/useOnyxStore";
import { useCallback } from "react";

export function useCommandPalette() {
  const open = useOnyxStore((s) => s.ui.commandPaletteOpen);
  const openCommandPalette = useOnyxStore((s) => s.openCommandPalette);
  const closeCommandPalette = useOnyxStore((s) => s.closeCommandPalette);
  const toggleCommandPalette = useOnyxStore((s) => s.toggleCommandPalette);

  const handleOpen = useCallback(() => openCommandPalette(), [openCommandPalette]);
  const handleClose = useCallback(() => closeCommandPalette(), [closeCommandPalette]);
  const handleToggle = useCallback(() => toggleCommandPalette(), [toggleCommandPalette]);

  return {
    isOpen: open,
    open: handleOpen,
    close: handleClose,
    toggle: handleToggle,
  };
}
