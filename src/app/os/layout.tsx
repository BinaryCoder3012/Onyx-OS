import type { Metadata } from "next";
import { Shell } from "@/components/os/Shell";

export const metadata: Metadata = {
  title: "Workspace — Onyx OS",
};

export default function OsLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
