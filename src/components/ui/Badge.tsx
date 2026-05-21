import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "cyber" | "neon";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "border-graphite-border text-onyx-muted bg-graphite",
  cyber: "border-cyber-yellow/30 text-cyber-yellow bg-carbon-elevated",
  neon: "border-neon-cyan/30 text-neon-cyan bg-carbon-elevated",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
