import { cn } from "@/lib/cn";
import { type InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full border border-graphite-border bg-carbon px-3 py-2 font-mono text-sm text-onyx-fg placeholder:text-onyx-subtle outline-none transition-colors focus:border-neon-cyan/50",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
