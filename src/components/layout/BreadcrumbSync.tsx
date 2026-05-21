"use client";

import { MODULE_LABELS } from "@/constants/navigation";
import { useOnyxStore } from "@/store/useOnyxStore";
import type { OnyxModuleId } from "@/types";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PATH_MODULE_MAP: Record<string, OnyxModuleId> = {
  "/": "dashboard",
  "/dsa-vault": "dsa-vault",
  "/cp-matrix": "cp-matrix",
  "/roadmap": "roadmap-engine",
  "/career": "career-radar",
  "/resume": "resume-intelligence",
  "/opportunities": "opportunity-radar",
  "/analytics": "analytics",
  "/settings": "settings",
};

export function BreadcrumbSync() {
  const pathname = usePathname();
  const setBreadcrumb = useOnyxStore((s) => s.setBreadcrumb);

  useEffect(() => {
    const moduleId = PATH_MODULE_MAP[pathname] ?? "dashboard";
    setBreadcrumb(["Onyx", MODULE_LABELS[moduleId]]);
  }, [pathname, setBreadcrumb]);

  return null;
}
