"use client";

import { useHydrated } from "@/lib/util";

/** Renders children only on the client, after the persisted workspace has loaded from storage. */
export function Gate({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className="grid gap-4" aria-busy="true" aria-label="Loading workspace">
        <div className="h-28 rounded-xl border border-seam bg-slab" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-64 rounded-xl border border-seam bg-slab" />
          <div className="h-64 rounded-xl border border-seam bg-slab" />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
