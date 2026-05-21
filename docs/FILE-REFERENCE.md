# Onyx OS — File Reference

Every project file explained for AI/human context.

---

## Root

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts (`dev`, `build`, `db:*`) |
| `tsconfig.json` | Strict TS, `@/*` path alias |
| `next.config.ts` | `reactStrictMode`, no `X-Powered-By` |
| `tailwind.config.ts` | Obsidian color tokens, fonts, spacing |
| `postcss.config.mjs` | Tailwind PostCSS plugin |
| `eslint.config.mjs` | Next.js ESLint flat config |
| `.env.example` | Env var template |
| `.npmrc` | `strict-ssl=false` (Windows SSL workaround) |
| `.gitignore` | node_modules, .next, .env |
| `onyx-architecture.md` | Canonical product/design laws |

---

## `prisma/`

| File | Purpose |
|------|---------|
| `schema.prisma` | User, OnyxContext, DSAVault, PlatformProfile, StudySession |

---

## `src/app/`

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout: AppProviders → AppShell → children + CommandPaletteHost |
| `page.tsx` | Dashboard with Panel grid + Online badge |
| `globals.css` | Tailwind layers + Obsidian utilities |
| `api/auth/route.ts` | Auth stub (GET ready, POST 501) |
| `api/profile/route.ts` | Profile stub |
| `api/roadmap/route.ts` | Roadmap stub |
| `api/ai/route.ts` | AI stub |
| `api/analytics/route.ts` | Analytics stub |
| `*/page.tsx` | Module pages using `ModuleShell` |

---

## `src/components/layout/`

| File | Purpose |
|------|---------|
| `AppShell.tsx` | Main layout wrapper, keyboard init, margin for sidebar |
| `Sidebar.tsx` | Fixed icon nav, active cyan accent |
| `Topbar.tsx` | Breadcrumb, command trigger, profile placeholder |
| `BreadcrumbSync.tsx` | Syncs pathname → Zustand breadcrumb |
| `ModuleShell.tsx` | Standard module page header + empty viewport |
| `index.ts` | Barrel exports |

---

## `src/components/ui/`

| File | Purpose |
|------|---------|
| `Button.tsx` | ghost / outline / accent variants |
| `Input.tsx` | Text input, Obsidian styled |
| `Badge.tsx` | Status chips |
| `Divider.tsx` | 1px separator |
| `Panel.tsx` | Titled content panel |
| `index.ts` | Barrel exports |

---

## `src/components/command/`

| File | Purpose |
|------|---------|
| `CommandPaletteHost.tsx` | Modal palette UI, search, execute commands |
| `index.ts` | Export |

---

## `src/hooks/`

| File | Purpose |
|------|---------|
| `useOnyxStore` access via store import | — |
| `useCommandPalette.ts` | Open/close/toggle palette |
| `useCommandInit.ts` | Register nav + system commands on mount |
| `useKeyboardShortcut.ts` | Generic shortcut + Cmd/Ctrl+K |
| `useEscapeKey.ts` | Escape handler |
| `useFeatureInit.ts` | Register features in registry |
| `index.ts` | Barrel exports |

---

## `src/lib/`

| File | Purpose |
|------|---------|
| `cn.ts` | clsx + tailwind-merge |
| `db.ts` | Prisma singleton (dev hot-reload safe) |
| `api-response.ts` | `apiSuccess`, `apiError`, meta/requestId |
| `errors.ts` | `ERROR_CODES` constant map |
| `soft-delete.ts` | Prisma filter helpers |
| `commands/registry.ts` | Command Map CRUD |
| `commands/index.ts` | Exports |
| `index.ts` | Lib barrel |

---

## `src/store/`

| File | Purpose |
|------|---------|
| `useOnyxStore.ts` | Global Zustand store |
| `index.ts` | Export |

---

## `src/services/`

| File | Purpose |
|------|---------|
| `ai.ts` | `executeAI`, `buildPrompt`, `aiSchemas` |
| `ai/providers.ts` | ProviderAdapter interface + stubs |
| `ai/prompts.ts` | System prompts + builders |
| `ai/index.ts` | AI submodule exports |
| `index.ts` | Services barrel |

---

## `src/server/`

| File | Purpose |
|------|---------|
| `api-handler.ts` | `createApiHandler` factory |
| `middleware/with-auth.ts` | Auth wrapper stub (`x-user-id`) |
| `middleware/index.ts` | Export |

---

## `src/types/index.ts`

All global interfaces: User, OnyxContext, DSAVault, PlatformProfile, StudySession, ProjectArchitecture, ResumeIntelligence, OpportunityRadar, APIResponse, AIResponse, GlobalThemeConfig, CommandItem, RoadmapNode, OnyxModuleId

---

## `src/constants/`

| File | Purpose |
|------|---------|
| `navigation.ts` | NAV_ITEMS, MODULE_LABELS |
| `theme.ts` | ONYX_THEME config object |
| `index.ts` | Barrel |

---

## `src/config/`

| File | Purpose |
|------|---------|
| `env.ts` | Zod env schema + `getEnv()` |
| `index.ts` | Export |

---

## `src/features/registry.ts`

Feature module registration for gradual rollout.

---

## `src/middleware.ts`

Next.js middleware — adds `x-onyx-version`, `x-onyx-api` headers.

---

## `src/providers/`

| File | Purpose |
|------|---------|
| `AppProviders.tsx` | QueryClient + Theme + Geist fonts |
| `ThemeProvider.tsx` | Dark theme context (ONYX_THEME) |
| `index.ts` | Export |

---

## `src/utils/`

| File | Purpose |
|------|---------|
| `id.ts` | `generateId()` |
| `format.ts` | `formatDuration`, `formatTabular` |
| `platform.ts` | `isMacOS`, `getModKeyLabel` |
| `index.ts` | Barrel |

---

## `src/validators/`

| File | Purpose |
|------|---------|
| `common.ts` | paginationSchema, idParamSchema |
| `index.ts` | Export |

---

## `backend/`

| File | Purpose |
|------|---------|
| `controllers/base.controller.ts` | Abstract controller with success helper |
| `services/base.service.ts` | Abstract service with soft-delete filter |
| `middleware/error-handler.ts` | BackendError type |
| `validators/request.validator.ts` | Zod request validation helper |
| `routes/index.ts` | API_ROUTES paths |
| `routes/manifest.ts` | Route methods manifest |
| `models/index.ts` | Re-exports Prisma-related types |

---

## Empty / reserved

| Path | Reserved for |
|------|--------------|
| `src/modules/` | Domain module logic |
| `src/features/.gitkeep` | Feature implementations |
| `backend/jobs/` | Background jobs |
| `backend/controllers/.gitkeep` | Concrete controllers |
