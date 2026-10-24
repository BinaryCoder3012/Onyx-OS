"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/util";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "quiet" | "ghost" | "danger";
  size?: "sm" | "md";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "quiet", size = "md", className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-45",
        size === "md" ? "h-9 px-3.5 text-[14px]" : "h-7 px-2.5 text-[13px]",
        variant === "primary" && "bg-chalk text-onyx hover:bg-white",
        variant === "quiet" && "border border-seam-strong bg-shelf text-chalk hover:border-chalk-3",
        variant === "ghost" && "text-chalk-2 hover:bg-shelf hover:text-chalk",
        variant === "danger" && "text-bad hover:bg-bad/10",
        className,
      )}
      {...rest}
    />
  );
});

const field =
  "w-full rounded-lg border border-seam-strong bg-onyx px-3 text-[14px] text-chalk placeholder:text-chalk-3 focus:border-sard focus:outline-none";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn(field, "h-9", className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn(field, "min-h-[84px] py-2 leading-relaxed", className)} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...rest },
  ref,
) {
  return <select ref={ref} className={cn(field, "h-9 pr-8", className)} {...rest} />;
});

export function Label({ children, hint, className }: { children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <span className={cn("mb-1.5 flex items-baseline justify-between gap-2 text-[13px] text-chalk-2", className)}>
      <span>{children}</span>
      {hint && <span className="text-[12px] text-chalk-3">{hint}</span>}
    </span>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-seam bg-slab", className)}>
      {(title || action) && (
        <header className="flex min-h-12 items-center justify-between gap-3 border-b border-seam px-4 py-2">
          <h2 className="text-[14px] font-semibold text-chalk">{title}</h2>
          {action && <div className="flex items-center gap-1.5">{action}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Figure({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "good" | "bad" | "sard";
}) {
  return (
    <div className="min-w-0">
      <div className="text-[13px] text-chalk-2">{label}</div>
      <div className="num mt-1 font-display text-[30px] leading-none font-semibold tracking-[-0.02em] text-chalk">{value}</div>
      {sub && (
        <div
          className={cn(
            "num mt-1.5 text-[13px]",
            tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : tone === "sard" ? "text-sard" : "text-chalk-3",
          )}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function Empty({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-seam-strong px-4 py-6 text-[14px] leading-relaxed text-chalk-2">
      <div>{children}</div>
      {action}
    </div>
  );
}

export function Pill({ children, tone, className }: { children: React.ReactNode; tone?: "good" | "warn" | "bad" | "sard" | "agate"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2 text-[12px] whitespace-nowrap",
        !tone && "border-seam-strong text-chalk-2",
        tone === "good" && "border-good/30 bg-good/10 text-good",
        tone === "warn" && "border-warn/30 bg-warn/10 text-warn",
        tone === "bad" && "border-bad/30 bg-bad/10 text-bad",
        tone === "sard" && "border-sard/35 bg-sard/10 text-sard",
        tone === "agate" && "border-agate/30 bg-agate/10 text-agate",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-3.5 animate-spin rounded-full border-2 border-chalk-3 border-t-transparent", className)}
    />
  );
}

export function ErrorLine({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-[13px] leading-relaxed text-bad">
      {children}
    </p>
  );
}

export function Meter({ value, tone = "sard", className }: { value: number; tone?: "sard" | "good" | "agate"; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-seam", className)} role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn("h-full rounded-full", tone === "sard" ? "bg-sard" : tone === "good" ? "bg-good" : "bg-agate")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
