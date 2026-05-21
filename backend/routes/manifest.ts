export const ROUTE_MANIFEST = {
  auth: { path: "/api/auth", methods: ["GET", "POST"] as const },
  profile: { path: "/api/profile", methods: ["GET"] as const },
  roadmap: { path: "/api/roadmap", methods: ["GET"] as const },
  ai: { path: "/api/ai", methods: ["GET", "POST"] as const },
  analytics: { path: "/api/analytics", methods: ["GET"] as const },
} as const;
