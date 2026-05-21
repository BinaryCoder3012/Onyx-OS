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
        "sticky top-0 z-30 flex h-topbar items-center justify-between border-b border-graphite-border/40 bg-carbon/70 backdrop-blur-xl px-6 shadow-[0_2px_15px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex items-center justify-center text-onyx-muted transition-colors hover:text-white lg:hidden"
          aria-label="Toggle navigation"
        >
          <span className="text-sm">☰</span>
        </button>
 
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-onyx-muted"
        >
          {breadcrumb.map((segment, index) => (
            <span key={`${segment}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && <span className="text-graphite-muted">/</span>}
              <span
                className={cn(
                  "transition-colors duration-200",
                  index === breadcrumb.length - 1
                    ? "text-neon-cyan font-bold"
                    : "text-onyx-muted hover:text-onyx-fg cursor-default"
                )}
              >
                {segment}
              </span>
            </span>
          ))}
        </nav>
      </div>
 
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={open}
          className="hidden items-center gap-2 border border-graphite-border/80 bg-graphite-matte/40 px-3 py-1 font-mono text-[10px] text-onyx-muted transition-all duration-300 hover:border-neon-cyan/40 hover:text-neon-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.05)] rounded-sm sm:flex group"
          aria-label="Open command palette"
        >
          <span className="group-hover:text-white transition-colors">{getModKeyLabel()}</span>
          <span className="onyx-kbd border-graphite-border group-hover:border-neon-cyan/30 group-hover:text-neon-cyan transition-colors">K</span>
        </button>
 
        <div className="h-4 w-px bg-graphite-border/60" />
 
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-neon-cyan/30 bg-neon-cyan/5 font-mono text-[10px] font-bold text-neon-cyan shadow-[0_0_8px_rgba(0,240,255,0.1)] uppercase">
            {displayName.substring(0, 2)}
          </div>
          <span className="hidden font-mono text-[10px] tracking-wider text-onyx-muted hover:text-white transition-colors duration-300 sm:inline uppercase">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
