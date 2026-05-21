"use client";

import { useCommandInit } from "@/hooks/useCommandInit";
import { useFeatureInit } from "@/hooks/useFeatureInit";
import { useCommandPaletteShortcut } from "@/hooks/useKeyboardShortcut";
import { cn } from "@/lib/cn";
import { useOnyxStore } from "@/store/useOnyxStore";
import { type ReactNode } from "react";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import { OnboardingModal } from "../shared/OnboardingModal";
import { BreadcrumbSync } from "./BreadcrumbSync";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AssistantWidget } from "../assistant/AssistantWidget";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const collapsed = useOnyxStore((s) => s.ui?.sidebarCollapsed) ?? false;
  const toggleCommandPalette = useOnyxStore((s) => s.toggleCommandPalette);

  useCommandInit();
  useFeatureInit();
  useCommandPaletteShortcut(toggleCommandPalette);

  return (
    <div className="min-h-screen bg-carbon">
      <OnboardingModal />
      <BreadcrumbSync />
      <AssistantWidget />
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-75",
          collapsed ? "ml-12" : "ml-48"
        )}
      >
        <Topbar />
        <main
          className="flex-1 overflow-auto onyx-scrollbar"
          data-resizable-panes="future"
        >
          <div className="h-full p-4">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
