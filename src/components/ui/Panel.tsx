import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Panel({ className, title, children, ...props }: PanelProps) {
  return (
    <div className={cn("border border-graphite-border bg-graphite-matte", className)} {...props}>
      {title && (
        <div className="border-b border-graphite-border px-3 py-2">
          <span className="font-mono text-2xs uppercase tracking-wider text-onyx-subtle">
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
