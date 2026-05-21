import { cn } from "@/lib/cn";

interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Divider({ className, orientation = "horizontal" }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn(
        orientation === "horizontal" ? "h-px w-full bg-graphite-border" : "h-full w-px bg-graphite-border",
        className
      )}
    />
  );
}
