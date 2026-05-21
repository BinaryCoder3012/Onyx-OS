import { Badge } from "@/components/ui";

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  status?: "idle" | "active";
}

export function ModuleHeader({ title, subtitle, status = "active" }: ModuleHeaderProps) {
  return (
    <header className="flex items-end justify-between border-b border-graphite-border pb-3">
      <div>
        <h1 className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-onyx-fg">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 font-mono text-2xs text-onyx-muted">{subtitle}</p>
        )}
      </div>
      <Badge variant={status === "active" ? "neon" : "default"}>
        {status === "active" ? "Live" : "Standby"}
      </Badge>
    </header>
  );
}
