// src/components/shared/NavBar.tsx
import Link from "next/link";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cp-matrix", label: "CP Matrix" },
  { href: "/careers", label: "Careers" },
  { href: "/resume", label: "Resume" },
  { href: "/settings", label: "Settings" },
];

export function NavBar() {
  return (
    <nav className="bg-carbon/30 backdrop-blur-md border-b border-graphite-border/20 p-2 flex gap-4 justify-center">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "text-onyx-fg text-sm font-medium hover:text-neon-cyan transition-colors",
            "relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-neon-cyan after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
