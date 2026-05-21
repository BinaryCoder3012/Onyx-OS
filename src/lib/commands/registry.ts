import type { CommandItem } from "@/types";

export type CommandRegistry = Map<string, CommandItem>;

const registry: CommandRegistry = new Map();
let initialized = false;

export function registerCommand(item: CommandItem): void {
  registry.set(item.id, item);
}

export function unregisterCommand(id: string): void {
  registry.delete(id);
}

export function getCommands(): CommandItem[] {
  return Array.from(registry.values());
}

export function getCommandsByGroup(group: string): CommandItem[] {
  return getCommands().filter((cmd) => cmd.group === group);
}

export function initCommandRegistry(): void {
  if (initialized) return;
  initialized = true;

  registerCommand({
    id: "close-palette",
    label: "Close Command Palette",
    group: "System",
    shortcut: "Esc",
    action: () => undefined,
  });
}

export function resetCommandRegistry(): void {
  registry.clear();
  initialized = false;
}
