"use client";

import { NAV_ITEMS } from "@/constants/navigation";
import { registerFeature } from "@/features/registry";
import { useEffect } from "react";

export function useFeatureInit(): void {
  useEffect(() => {
    for (const item of NAV_ITEMS) {
      registerFeature({
        id: item.id,
        enabled: true,
        version: "0.1.0",
      });
    }
  }, []);
}
