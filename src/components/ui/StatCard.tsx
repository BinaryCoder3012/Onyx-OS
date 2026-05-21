import { cn } from "@/lib/cn";
import { formatTabular } from "@/utils/format";

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  variant?: "default" | "cyber" | "neon";
  className?: string;
}

export function StatCard({ label, value, suffix, variant = "default", className }: StatCardProps) {
  const display = typeof value === "number" ? formatTabular(value) : value;
  return (
    <div className={cn("border border-graphite-border bg-graphite-matte p-3", className)}>
      <span className="font-mono text-2xs uppercase tracking-wider text-onyx-subtle">{label}</span>
      <p
        className={cn(
          "mt-1 font-mono text-lg onyx-tabular",
          variant === "cyber" && "text-cyber-yellow",
          variant === "neon" && "text-neon-cyan",
          variant === "default" && "text-onyx-fg"
        )}
      >
        {display}
        {suffix && <span className="ml-1 text-2xs text-onyx-muted">{suffix}</span>}
      </p>
    </div>
  );
}
