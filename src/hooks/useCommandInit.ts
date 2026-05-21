"use client";

import { NAV_ITEMS } from "@/constants/navigation";
import { registerCommand, initCommandRegistry } from "@/lib/commands";
import { useOnyxStore } from "@/store/useOnyxStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useCommandInit(): void {
  const router = useRouter();
  const toggleSidebar = useOnyxStore((s) => s.toggleSidebar);
  const closeCommandPalette = useOnyxStore((s) => s.closeCommandPalette);

  useEffect(() => {
    initCommandRegistry();

    for (const item of NAV_ITEMS) {
      registerCommand({
        id: `nav-${item.id}`,
        label: `Go to ${item.label}`,
        group: "Navigation",
        action: () => {
          router.push(item.href);
          closeCommandPalette();
        },
      });
    }

    registerCommand({
      id: "toggle-sidebar",
      label: "Toggle Sidebar",
      group: "System",
      action: () => {
        toggleSidebar();
        closeCommandPalette();
      },
    });
  }, [router, toggleSidebar, closeCommandPalette]);
}
