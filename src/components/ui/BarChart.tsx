import { cn } from "@/lib/cn";

interface BarChartItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartItem[];
  className?: string;
}

export function BarChart({ data, className }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {data.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate font-mono text-2xs text-onyx-muted">
            {item.label}
          </span>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-3 flex-1 bg-carbon">
                <div
                className="h-full bg-neon-cyan/70"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
            <span className="w-8 font-mono text-2xs text-onyx-muted onyx-tabular">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
