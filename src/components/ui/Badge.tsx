import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "cyber" | "neon" | "danger" | "success";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "border-graphite-border text-onyx-muted bg-graphite/40",
  cyber: "border-cyber-yellow/30 text-cyber-yellow bg-cyber-yellow/5 hover:bg-cyber-yellow/10",
  neon: "border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5 hover:bg-neon-cyan/10",
  danger: "border-onyx-danger/30 text-onyx-danger bg-onyx-danger/5 hover:bg-onyx-danger/10",
  success: "border-onyx-success/30 text-onyx-success bg-onyx-success/5 hover:bg-onyx-success/10",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
