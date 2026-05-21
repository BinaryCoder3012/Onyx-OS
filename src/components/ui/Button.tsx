import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "ghost" | "outline" | "accent" | "cyber";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  ghost: "bg-transparent hover:bg-carbon-elevated text-onyx-muted hover:text-onyx-fg",
  outline:
    "bg-graphite border border-graphite-border text-onyx-muted hover:text-onyx-fg hover:border-graphite-muted",
  accent:
    "bg-carbon-elevated border border-neon-cyan/40 text-neon-cyan hover:border-neon-cyan",
  cyber:
    "bg-carbon-elevated border border-cyber-yellow/40 text-cyber-yellow hover:border-cyber-yellow",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 font-mono text-2xs uppercase tracking-wider transition-colors duration-75 disabled:opacity-40",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
