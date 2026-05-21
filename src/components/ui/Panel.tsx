import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  variant?: "default" | "glass" | "bordered";
}

export function Panel({ className, title, subtitle, headerAction, variant = "default", children, ...props }: PanelProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        variant === "default" && "border border-graphite-border/70 bg-gradient-to-b from-graphite/90 to-carbon-elevated/95 shadow-lg",
        variant === "glass" && "onyx-glass border border-white/5 shadow-2xl",
        variant === "bordered" && "border border-graphite-border bg-transparent",
        className
      )}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between border-b border-graphite-border/60 px-4 py-3 bg-graphite/40 backdrop-blur-sm">
          <div className="flex flex-col gap-0.5">
            {title && (
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
                <span className="font-mono text-2xs font-bold uppercase tracking-wider text-white">
                  {title}
                </span>
              </div>
            )}
            {subtitle && (
              <span className="font-mono text-[9px] text-onyx-muted tracking-wide mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}
      <div className="p-4 h-full">{children}</div>
    </div>
  );
}
