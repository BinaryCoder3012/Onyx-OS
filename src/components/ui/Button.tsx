import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "ghost" | "outline" | "accent" | "cyber" | "neon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  ghost: "bg-transparent hover:bg-carbon-elevated text-onyx-muted hover:text-onyx-fg",
  outline:
    "bg-graphite border border-graphite-border/70 text-onyx-fg/80 hover:text-white hover:border-graphite-muted hover:bg-carbon-elevated/40",
  accent:
    "bg-carbon-elevated/50 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.15)]",
  cyber:
    "bg-carbon-elevated/50 border border-cyber-yellow/30 text-cyber-yellow hover:bg-cyber-yellow/10 hover:border-cyber-yellow hover:shadow-[0_0_15px_rgba(245,230,66,0.15)]",
  neon:
    "bg-neon-cyan text-carbon border border-neon-cyan hover:bg-neon-cyan/90 font-bold hover:shadow-[0_0_15px_rgba(0,240,255,0.35)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", type = "button", loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center px-4 py-2 font-mono text-2xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-sm border border-transparent select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-3.5 w-3.5 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";
