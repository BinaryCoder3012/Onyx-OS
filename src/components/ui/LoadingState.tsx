import { cn } from "@/lib/cn";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Loading", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16",
        className
      )}
    >
      <div className="flex items-center gap-1">
        <span className="inline-block h-1.5 w-1.5 animate-pulse bg-neon-cyan/80" style={{ animationDelay: "0ms" }} />
        <span className="inline-block h-1.5 w-1.5 animate-pulse bg-neon-cyan/60" style={{ animationDelay: "150ms" }} />
        <span className="inline-block h-1.5 w-1.5 animate-pulse bg-neon-cyan/40" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="font-mono text-2xs uppercase tracking-[0.25em] text-onyx-subtle">
        {label}
      </span>
    </div>
  );
}
