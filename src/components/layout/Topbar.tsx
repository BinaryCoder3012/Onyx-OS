"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { cn } from "@/lib/cn";
import { useOnyxStore } from "@/store/useOnyxStore";
import { getModKeyLabel } from "@/utils/platform";

interface TopbarProps {
  className?: string;
}

export function Topbar({ className }: TopbarProps) {
  const breadcrumb = useOnyxStore((s) => s.ui?.activeBreadcrumb) ?? ["Onyx"];
  const toggleSidebar = useOnyxStore((s) => s.toggleSidebar);
  const { open } = useCommandPalette();
  const { data: authData } = useAuth();
  const displayName = authData?.user?.displayName ?? "operator";

  return (
    <header
      className={cn(
        "flex h-topbar items-center justify-between border-b border-graphite-border bg-carbon-elevated px-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex items-center justify-center text-onyx-muted transition-colors hover:text-onyx-fg lg:hidden"
          aria-label="Toggle navigation"
        >
          <span className="text-sm">☰</span>
        </button>

        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-onyx-muted"
        >
          {breadcrumb.map((segment, index) => (
            <span key={`${segment}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-graphite-muted">/</span>}
              <span
                className={cn(
                  index === breadcrumb.length - 1
                    ? "text-onyx-fg"
                    : "text-onyx-muted"
                )}
              >
                {segment}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={open}
          className="hidden items-center gap-2 border border-graphite-border bg-graphite px-2.5 py-1 font-mono text-2xs text-onyx-muted transition-colors hover:border-graphite-muted hover:text-onyx-fg sm:flex"
          aria-label="Open command palette"
        >
          <span>{getModKeyLabel()}</span>
          <span className="onyx-kbd">K</span>
        </button>

        <div className="h-4 w-px bg-graphite-border" />

        <div className="flex items-center gap-2">
          <div className="h-6 w-6 border border-graphite-border bg-graphite-matte" />
          <span className="hidden font-mono text-2xs text-onyx-muted sm:inline">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
