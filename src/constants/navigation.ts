import type { OnyxModuleId } from "@/types";

export interface NavItem {
  id: OnyxModuleId;
  label: string;
  icon: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "◈", href: "/" },
  { id: "dsa-vault", label: "DSA Vault", icon: "⬡", href: "/dsa-vault" },
  { id: "cp-matrix", label: "CP Matrix", icon: "▣", href: "/cp-matrix" },
  { id: "roadmap-engine", label: "Roadmap", icon: "◎", href: "/roadmap" },
  { id: "career-radar", label: "Career", icon: "◉", href: "/career" },
  { id: "resume-intelligence", label: "Resume", icon: "▤", href: "/resume" },
  { id: "opportunity-radar", label: "Opportunities", icon: "◇", href: "/opportunities" },
  { id: "analytics", label: "Analytics", icon: "▥", href: "/analytics" },
  { id: "settings", label: "Settings", icon: "⚙", href: "/settings" },
];

export const MODULE_LABELS: Record<OnyxModuleId, string> = {
  dashboard: "Dashboard",
  "dsa-vault": "DSA Vault",
  "cp-matrix": "CP Matrix",
  "roadmap-engine": "Roadmap Engine",
  "career-radar": "Career Radar",
  "resume-intelligence": "Resume Intelligence",
  "opportunity-radar": "Opportunity Radar",
  analytics: "Analytics",
  settings: "Settings",
};
