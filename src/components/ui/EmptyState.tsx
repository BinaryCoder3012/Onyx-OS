import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: string;
  message: string;
  hint?: string;
  className?: string;
}

export function EmptyState({ icon = "◇", message, hint, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-12", className)}>
      <span className="text-lg text-onyx-subtle">{icon}</span>
      <p className="font-mono text-2xs uppercase tracking-wider text-onyx-muted">{message}</p>
      {hint && (
        <p className="font-mono text-2xs text-onyx-subtle">{hint}</p>
      )}
    </div>
  );
}
