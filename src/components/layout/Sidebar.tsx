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
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 bg-graphite/40 backdrop-blur-xl transition-[width] duration-300 ease-in-out",
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
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden py-4 onyx-scrollbar px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.label}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 font-mono text-[10px] text-onyx-muted transition-all duration-300 rounded-sm select-none",
                "hover:bg-carbon-elevated/80 hover:text-white",
                isActive && "bg-gradient-to-r from-neon-cyan/10 to-neon-cyan/[0.01] text-neon-cyan border border-neon-cyan/20 shadow-[0_0_15px_rgba(0,240,255,0.03)]",
                !isActive && "border border-transparent",
                collapsed && "justify-center px-0"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={cn(
                "shrink-0 text-sm leading-none transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-neon-cyan" : "text-onyx-muted group-hover:text-white"
              )}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate uppercase tracking-widest font-medium transition-transform duration-300 group-hover:translate-x-0.5">
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f0ff]" />
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
