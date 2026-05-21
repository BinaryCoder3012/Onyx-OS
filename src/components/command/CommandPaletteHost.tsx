"use client";

import { Input } from "@/components/ui";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { getCommands } from "@/lib/commands";
import { cn } from "@/lib/cn";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function CommandPaletteHost() {
  const { isOpen, close } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEscapeKey(close, isOpen);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  const commands = useMemo(() => {
    const all = getCommands().filter((c) => c.id !== "close-palette");
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((cmd) => cmd.label.toLowerCase().includes(q));
  }, [query]);

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [commands.length]);

  const executeCommand = useCallback(
    (index: number) => {
      const cmd = commands[index];
      if (cmd) {
        cmd.action();
        close();
        setQuery("");
      }
    },
    [commands, close]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(commands.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev <= 0 ? Math.max(commands.length - 1, 0) : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        executeCommand(activeIndex);
      }
    },
    [commands.length, activeIndex, executeCommand]
  );

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.children[activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-carbon-deep/80 pt-[20vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={close}
    >
      <div
        className="w-full max-w-lg border border-graphite-border bg-graphite shadow-onyx"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <Input
          type="text"
          placeholder="Type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-0 border-b focus:border-neon-cyan/50"
          autoFocus
        />
        <ul ref={listRef} className="max-h-64 overflow-auto onyx-scrollbar py-1">
          {commands.length === 0 ? (
            <li className="px-4 py-3 font-mono text-2xs text-onyx-subtle">
              No commands found
            </li>
          ) : (
            commands.map((cmd, idx) => (
              <li key={cmd.id}>
                <button
                  type="button"
                  onClick={() => executeCommand(idx)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2 font-mono text-2xs text-onyx-muted",
                    "hover:bg-carbon-elevated hover:text-onyx-fg",
                    idx === activeIndex && "bg-carbon-elevated text-onyx-fg"
                  )}
                >
                  <span>{cmd.label}</span>
                  {cmd.shortcut && <span className="onyx-kbd">{cmd.shortcut}</span>}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
