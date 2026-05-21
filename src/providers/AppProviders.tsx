"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { useState, type ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";

const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div
          className={`${GeistSans.variable} ${GeistMono.variable} dark font-sans min-h-screen bg-carbon text-onyx-fg`}
          data-theme="onyx-dark"
        >
          {children}
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
