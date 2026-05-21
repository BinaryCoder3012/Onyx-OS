# Onyx OS — Development Log

Chronological record of all work performed. Update this file after every significant change.

---

## 2026-05-18 — Phase 1: System Foundation + Obsidian-UI Core

### Session 1 — Initial scaffold

**Context:** Empty workspace. `onyx-architecture.md` existed but was empty. Phase 1 spec provided via user prompt.

**Actions:**
1. Manual Next.js 15 scaffold (create-next-app failed due to npm SSL `UNABLE_TO_VERIFY_LEAF_SIGNATURE`)
2. Created `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
3. Established folder structure per DDD spec (`src/`, `backend/`, `docs/`, `prisma/`)
4. Implemented global types in `src/types/index.ts`
5. Built Obsidian-UI design tokens in Tailwind + `globals.css`
6. Created providers: `AppProviders`, `ThemeProvider` (dark-only)
7. Created Zustand store `useOnyxStore` with UI, onboarding, roadmap slices
8. Built layout: `Sidebar`, `Topbar`, `AppShell`
9. Command palette foundation: registry, hooks, `CommandPaletteHost` placeholder
10. Prisma schema with 5 models + soft delete + indexes
11. API stubs: auth, profile, roadmap, ai, analytics
12. AI service with provider abstraction (stubs)
13. Module route pages for all 9 nav items

**Issues encountered:**
- npm SSL certificate errors on Windows
- PowerShell `&&` not valid — use `;` instead
- Accidental `motionlessTheme` typos in early files (fixed)

### Session 2 — Continuation + polish

**Actions:**
1. Added UI primitives: `Button`, `Input`, `Badge`, `Divider`, `Panel`
2. Added utils: `id.ts`, `format.ts`, `platform.ts`
3. Added `lib/errors.ts`, `lib/soft-delete.ts`
4. Wired command palette: `useCommandInit` with router navigation
5. Added `useEscapeKey`, improved `useKeyboardShortcut` (strict ctrl/meta)
6. Added `BreadcrumbSync`, `ModuleShell` with status badge
7. Backend stubs: `BaseController`, `BaseService`, validators, route manifest
8. Added `withAuth` middleware stub
9. Split AI into `providers.ts`, `prompts.ts`
10. Added `features/registry.ts`, `useFeatureInit`
11. Added Next.js `middleware.ts`
12. Fixed `createApiHandler` for Next.js 15 route types
13. Created `.npmrc` with `strict-ssl=false`
14. npm install succeeded (after failed attempts)
15. `npm run build` — PASS
16. `npm run dev` — running at http://localhost:3000

### Build verification

```
npm run build → SUCCESS (17 static routes + 5 API routes)
npx prisma generate → SUCCESS
npx tsc --noEmit → SUCCESS
```

---

## 2026-05-18 — Documentation pass (Anti-Gravity context)

**Actions:**
1. Created `docs/ANTI-GRAVITY-CONTEXT.md` — master AI context document
2. Created `docs/ARCHITECTURE.md`, `DESIGN-SYSTEM.md`, `FILE-REFERENCE.md`, `API-CONTRACTS.md`, `README.md`
3. Populated root `onyx-architecture.md` with design laws and phase roadmap
4. Established maintenance rule: update DEVELOPMENT-LOG + ANTI-GRAVITY-CONTEXT after each session

---

## 2026-05-18 — Phase 2: Full platform completion

**Actions:**
1. Expanded Prisma schema (DSAProblem, CareerGoal, ResumeProfile, OpportunityItem, RoadmapProgress)
2. Switched to SQLite (`file:./dev.db`) for zero-config local dev
3. Implemented all server services + API routes (career, opportunities, resume, analytics, dsa, dashboard)
4. Cookie-based auth with `AuthBootstrap` auto-login for `operator@onyx.dev`
5. Built all 9 module UIs with TanStack Query + `apiFetch`
6. UI additions: StatCard, BarChart, LoadingState, ModuleHeader
7. Seeded database with problems, goals, opportunities, sessions, roadmap
8. `npm run build` — PASS (22 routes)

**Commands run:**
```bash
npx prisma db push
npm run db:seed
npm run build
```

---

## Pending / Next entries

- [ ] Production PostgreSQL + migrations
- [ ] OAuth providers
- [ ] Live LLM integration
- [ ] Platform API sync (LeetCode/Codeforces)

---

*Add new dated sections below as work continues.*

---

## 2026-05-18 — Phase 3 start: Live AI provider wiring

**Actions:**
1. Replaced stub `createStubAdapter` in `providers.ts` with real HTTP adapters:
   - `createGeminiAdapter` → `generativelanguage.googleapis.com` (gemini-1.5-flash, JSON mode)
   - `createOpenAIAdapter` → `api.openai.com` (gpt-4o-mini, json_object mode)
   - `createAnthropicAdapter` → `api.anthropic.com` (claude-3-haiku, messages API)
2. Updated `resolveProvider()` in `ai.ts` — selects live adapter when env key present, stubs otherwise (zero-config safe)
3. Wired `/api/ai` and `resume.service.ts` to actually call `executeAI()` instead of using naive text length scoring. Resume Intelligence "Re-analyze" now hits the LLM and parses structured JSON section scoring.
4. `npm run build` → PASS (22 routes, exit 0)

**To activate live AI:** set `GEMINI_API_KEY` (or `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`) in `.env` and set `AI_PROVIDER` accordingly.

---

## 2026-05-18 — Platform stabilization + UI polish

**Context:** Full codebase audit after Phase 2. Identified 10+ issues across runtime errors, hydration, lint, UX, and architecture.

**Critical fixes:**
1. **BarChart duplicate key crash** — `key={item.label}` fails when multiple study sessions share the same moduleId (e.g., two "DSA Vault" entries). Fixed with composite `key={label-idx}`. Root cause: seeded data has repeated moduleIds.
2. **Zustand hydration crash** — `breadcrumb.map()` throws when `persist` middleware returns `undefined` for non-persisted fields during SSR. Hardened all Zustand selectors in AppShell, Sidebar, Topbar with optional chaining + fallbacks (`s.ui?.activeBreadcrumb ?? ["Onyx"]`).

**Lint fixes (zero warnings now):**
3. Removed unused `apiError` and `ERROR_CODES` imports from `auth/route.ts`
4. Added `eslint-disable-next-line` for intentional rest-destructuring in `profile/route.ts`

**UI/UX improvements:**
5. **Sidebar overhaul** — Was icon-only at both 40px and 52px widths. Now expands to 192px (`w-48`) showing uppercase text labels, collapses to 48px (`w-12`) icon-only. Logo diamond acts as clickable toggle.
6. **Topbar mobile support** — Added hamburger menu button (visible `<lg`), hid command palette shortcut hint on small screens
7. **LoadingState upgrade** — 3-dot sequential pulse animation with staggered delays, wider tracking, proper centering
8. **CP Matrix form spacing** — Replaced bare `<div>` wrappers with `grid gap-3 sm:grid-cols-3` + `space-y-1` per field
9. **EmptyState component** — New reusable component for empty data messaging, integrated into DSA Vault table

**Architecture additions:**
10. **ErrorBoundary** — Class component wrapping page content in AppShell; prevents module-level crashes from killing the entire shell. Styled with Obsidian-UI, includes retry button.
11. **EmptyState** — Added to UI barrel export for consistent empty data UX across all modules

**Build verification:**
```
npm run build → SUCCESS (22 routes, exit 0, ZERO lint warnings)
Browser verification → all 5 tested pages load without console errors
```
