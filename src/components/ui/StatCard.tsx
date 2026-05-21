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
    <div 
      className={cn(
        "relative overflow-hidden border border-graphite-border/70 bg-gradient-to-br from-graphite/90 to-carbon-elevated/90 p-4 transition-all duration-300 hover:-translate-y-0.5 group",
        variant === "neon" && "hover:border-neon-cyan/30 hover:shadow-[0_0_20px_rgba(0,240,255,0.08)]",
        variant === "cyber" && "hover:border-cyber-yellow/30 hover:shadow-[0_0_20px_rgba(245,230,66,0.08)]",
        variant === "default" && "hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.04)]",
        className
      )}
    >
      {/* Top accent line */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 h-[2px] transition-all duration-300",
          variant === "neon" && "bg-neon-cyan/40 group-hover:bg-neon-cyan",
          variant === "cyber" && "bg-cyber-yellow/40 group-hover:bg-cyber-yellow",
          variant === "default" && "bg-graphite-border group-hover:bg-onyx-muted"
        )}
      />

      {/* Decorative background grid pattern */}
      <div className="absolute -right-2 -bottom-2 h-12 w-12 opacity-5 pointer-events-none select-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
      </div>

      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-onyx-muted group-hover:text-onyx-fg transition-colors duration-300 block">
        {label}
      </span>
      <p
        className={cn(
          "mt-2 font-mono text-xl md:text-2xl font-bold tracking-tight onyx-tabular transition-all duration-300",
          variant === "cyber" && "text-cyber-yellow drop-shadow-[0_0_6px_rgba(245,230,66,0.2)]",
          variant === "neon" && "text-neon-cyan drop-shadow-[0_0_6px_rgba(0,240,255,0.25)]",
          variant === "default" && "text-white"
        )}
      >
        {display}
        {suffix && (
          <span className="ml-1 text-xs font-normal tracking-normal text-onyx-muted group-hover:text-onyx-subtle transition-colors">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
