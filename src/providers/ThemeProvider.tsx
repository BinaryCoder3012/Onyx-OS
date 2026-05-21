"use client";

import { ONYX_THEME } from "@/constants/theme";
import { createContext, useContext, type ReactNode } from "react";
import type { GlobalThemeConfig } from "@/types";

const ThemeContext = createContext<GlobalThemeConfig>(ONYX_THEME);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={ONYX_THEME}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): GlobalThemeConfig {
  return useContext(ThemeContext);
}
