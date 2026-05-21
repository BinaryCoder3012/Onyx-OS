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
      <div className="flex min-h-screen flex-col items-center justify-center bg-carbon-deep p-8">
        <div className="w-full max-w-lg border border-red-500/20 bg-graphite/80 p-8 shadow-onyx backdrop-blur-md rounded-xl">
          <div className="mb-4 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-xl text-red-500">
              ⚠️
            </span>
          </div>
          <h1 className="mb-2 text-center font-mono text-lg font-bold text-onyx-fg">
            Database Connection Failed
          </h1>
          <p className="mb-6 text-center font-mono text-xs text-onyx-muted">
            Onyx OS requires a valid PostgreSQL database to store your session and progress.
          </p>
          <div className="space-y-4 rounded-lg bg-carbon p-4 font-mono text-2xs text-graphite-muted">
            <p>
              <strong className="text-neon-cyan">Step 1:</strong> Provision a free PostgreSQL database (e.g., Supabase, Neon).
            </p>
            <p>
              <strong className="text-neon-cyan">Step 2:</strong> Add your connection string to your Vercel Environment Variables as <code className="bg-graphite px-1 py-0.5 text-onyx-fg">DATABASE_URL</code>.
            </p>
            <p>
              <strong className="text-neon-cyan">Step 3:</strong> Trigger a new deployment on Vercel to apply the changes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
