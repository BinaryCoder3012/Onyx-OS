import { Badge } from "@/components/ui";

interface ModuleShellProps {
  title: string;
  status?: "idle" | "active";
}

export function ModuleShell({ title, status = "idle" }: ModuleShellProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between border-b border-graphite-border pb-3">
        <h1 className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-onyx-fg">
          {title}
        </h1>
        <Badge variant={status === "active" ? "neon" : "default"}>
          {status === "active" ? "Active" : "Standby"}
        </Badge>
      </header>
      <div className="flex-1 border border-graphite-border bg-graphite-matte" />
    </div>
  );
}
