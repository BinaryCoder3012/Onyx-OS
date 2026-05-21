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
    <div className={cn("flex flex-col gap-3.5", className)}>
      {data.map((item, idx) => {
        const percentage = (item.value / max) * 100;
        return (
          <div key={`${item.label}-${idx}`} className="flex items-center gap-4 group">
            <span className="w-24 shrink-0 truncate font-mono text-[10px] uppercase tracking-wider text-onyx-muted group-hover:text-white transition-colors duration-200">
              {item.label}
            </span>
            <div className="flex flex-1 items-center gap-3">
              <div className="h-2.5 flex-1 bg-carbon border border-graphite-border/40 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-neon-cyan/90 to-neon-cyan/35 rounded-full transition-all duration-1000 ease-out origin-left group-hover:shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-10 font-mono text-2xs text-onyx-fg font-semibold text-right onyx-tabular group-hover:text-neon-cyan transition-colors">
                {item.value}m
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
