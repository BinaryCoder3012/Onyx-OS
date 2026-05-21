export function isMacOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export function getModKeyLabel(): string {
  return isMacOS() ? "⌘" : "Ctrl";
}
