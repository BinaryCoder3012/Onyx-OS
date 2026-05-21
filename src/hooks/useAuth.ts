"use client";

import { apiFetch } from "@/lib/api";
import type { OnyxContext, User } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface AuthPayload {
  user: User | null;
  context: OnyxContext | null;
}

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: () => apiFetch<AuthPayload>("/api/auth"),
  });
}
