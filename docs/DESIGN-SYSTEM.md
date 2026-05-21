# Obsidian-UI Design System

Canonical reference for all UI work. Violations break product identity.

## Philosophy

- **Dense** — maximize information per pixel
- **Sharp** — brutalist borders, minimal radius
- **Dark** — ultra-dark only, no light mode
- **Terminal-inspired** — monospace labels, tabular numbers
- **Keyboard-first** — command palette, kbd hints
- **Elite** — premium engineering, not student dashboard

**References:** Linear, Arc, Vercel, GitHub dark, Bloomberg Terminal, Raycast

**Anti-patterns:** rounded bubbly cards, colorful gradients, fake chart filler, SaaS template sidebars

---

## Color tokens (Tailwind)

| Token | Hex | Usage |
|-------|-----|-------|
| `carbon` | `#0a0a0b` | Page background |
| `carbon-deep` | `#050506` | Overlays, palette backdrop |
| `carbon-elevated` | `#0f0f11` | Hover states |
| `graphite` | `#161618` | Sidebar, panels |
| `graphite-matte` | `#1c1c1f` | Content surfaces |
| `graphite-border` | `#2a2a2e` | All borders |
| `graphite-muted` | `#3f3f46` | Hover borders |
| `cyber-yellow` | `#f5e642` | Logo accent, warnings |
| `cyber-yellow-dim` | `#c4b835` | Muted yellow |
| `neon-cyan` | `#00e5ff` | Active states, focus, links |
| `neon-cyan-dim` | `#00b8cc` | Muted cyan |
| `onyx-fg` | `#e4e4e7` | Primary text |
| `onyx-muted` | `#71717a` | Secondary text |
| `onyx-subtle` | `#52525b` | Tertiary / placeholders |

---

## Typography

- **Sans:** `var(--font-geist-sans)` — body
- **Mono:** `var(--font-geist-mono)` — labels, nav, commands, headings
- **Size `2xs`:** `0.625rem` — metadata, badges, kbd
- **Tabular nums:** class `onyx-tabular` or `font-variant-numeric: tabular-nums`

---

## Border radius

Only:
- `rounded-none` (default)
- `rounded-sm` (2px) — kbd chips only

Never: `rounded-md`, `rounded-lg`, `rounded-full` on containers

---

## CSS utility classes (`globals.css`)

| Class | Purpose |
|-------|---------|
| `onyx-border` | Standard 1px border |
| `onyx-surface` | Matte graphite background |
| `onyx-panel` | Graphite + border panel |
| `onyx-accent-line` | Left neon border |
| `onyx-active-glow` | Inset left cyan bar (nav active) |
| `onyx-tabular` | Tabular numerics |
| `onyx-scrollbar` | Thin dark scrollbar |
| `onyx-kbd` | Keyboard hint chip |
| `onyx-nav-item` | Sidebar nav button base |
| `onyx-nav-item-active` | Active nav state |

---

## Layout dimensions

| Token | Value |
|-------|-------|
| `--sidebar-width` / `w-sidebar` | 52px |
| `--topbar-height` / `h-topbar` | 40px |

Sidebar: fixed left, icon-first, collapses to 40px (`w-10`)

---

## UI primitives (`src/components/ui/`)

| Component | Variants | Notes |
|-----------|----------|-------|
| `Button` | ghost, outline, accent | Mono uppercase 2xs |
| `Input` | — | Carbon bg, cyan focus border |
| `Badge` | default, cyber, neon | Uppercase tracking |
| `Divider` | horizontal, vertical | 1px graphite-border |
| `Panel` | optional `title` | Bordered content container |

Import: `import { Button, Panel } from "@/components/ui"`

---

## Shadows

Minimal only:
- `shadow-onyx` — 1px bottom highlight
- `shadow-onyx-inset` — inset highlight

No large drop shadows.

---

## Interaction

- Transition duration: `duration-75` (fast)
- Hover: subtle bg/border change, never scale transforms
- Focus: `border-neon-cyan/50` on inputs
- Selection: `bg-neon-cyan/20`

---

## Icons

Unicode geometric symbols in nav (not icon library yet):
`◈ ⬡ ▣ ◎ ◉ ▤ ◇ ▥ ⚙`

Future: consider Lucide with 16px stroke-1.5 mono style.
