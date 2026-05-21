"use client";

import { NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/cn";
import { useOnyxStore } from "@/store/useOnyxStore";
import type { OnyxModuleId } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";

function resolveActiveModule(pathname: string): OnyxModuleId {
  const match = NAV_ITEMS.find(
    (item) =>
      item.href === pathname ||
      (item.href !== "/" && pathname.startsWith(item.href))
  );
  return match?.id ?? "dashboard";
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useOnyxStore((s) => s.ui?.sidebarCollapsed) ?? false;
  const toggleSidebar = useOnyxStore((s) => s.toggleSidebar);
  const activeModule = resolveActiveModule(pathname);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-graphite-border bg-graphite transition-[width] duration-75",
        collapsed ? "w-12" : "w-48"
      )}
      aria-label="Primary navigation"
    >
      {/* Logo bar */}
      <div className="flex h-topbar items-center border-b border-graphite-border px-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex items-center gap-2 text-left transition-colors hover:opacity-80"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="font-mono text-sm font-bold text-cyber-yellow">◆</span>
          {!collapsed && (
            <span className="font-mono text-2xs font-bold tracking-[0.2em] text-onyx-fg">
              ONYX
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-px overflow-y-auto overflow-x-hidden py-2 onyx-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 font-mono text-2xs text-onyx-muted transition-colors duration-75",
                "hover:bg-carbon-elevated hover:text-onyx-fg",
                isActive && "bg-carbon-elevated text-neon-cyan",
                collapsed && "justify-center px-0"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="shrink-0 text-sm leading-none">{item.icon}</span>
              {!collapsed && (
                <span className="truncate uppercase tracking-wider">
                  {item.label}
                </span>
              )}
              {isActive && (
                <span className="absolute right-0 top-1/2 h-4 w-px -translate-y-1/2 bg-neon-cyan" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex h-8 items-center justify-center border-t border-graphite-border">
        <span className="font-mono text-2xs text-onyx-subtle onyx-tabular">v0.1</span>
      </div>
    </aside>
  );
}
