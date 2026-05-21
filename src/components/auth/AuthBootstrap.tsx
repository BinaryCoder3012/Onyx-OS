"use client";

import { apiFetch } from "@/lib/api";
import { useOnyxStore } from "@/store/useOnyxStore";
import type { OnyxContext, User } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";

const DEMO_EMAIL = "operator@onyx.dev";

interface AuthPayload {
  user: User | null;
  context: OnyxContext | null;
}

async function ensureSession(): Promise<AuthPayload> {
  let data = await apiFetch<AuthPayload>("/api/auth");
  if (!data.user) {
    data = await apiFetch<AuthPayload>("/api/auth", {
      method: "POST",
      body: JSON.stringify({ email: DEMO_EMAIL, displayName: "Operator" }),
    });
  }
  return data;
}

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const setContext = useOnyxStore((s) => s.setContext);

  const { isLoading, isError } = useQuery({
    queryKey: ["auth", "bootstrap"],
    queryFn: async () => {
      const data = await ensureSession();
      if (data.context) setContext(data.context);
      return data;
    },
    staleTime: Infinity,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-carbon font-mono text-2xs uppercase tracking-widest text-onyx-muted">
        Initializing Onyx OS...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-carbon p-8">
        <p className="font-mono text-sm text-onyx-fg">Failed to initialize session.</p>
        <p className="mt-2 font-mono text-2xs text-onyx-muted">
          Run: npm run db:push &amp;&amp; npm run db:seed
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
