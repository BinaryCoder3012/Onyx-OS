# Onyx OS — System Architecture

## High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│  App Router Pages          │  Components (layout/ui/command) │
│  Zustand Store             │  TanStack Query (future data)   │
│  Hooks (keyboard/commands) │  Command Registry               │
└────────────────────────────┬────────────────────────────────┘
                             │ fetch /api/*
┌────────────────────────────▼────────────────────────────────┐
│                    Next.js Server (App Router)                 │
├─────────────────────────────────────────────────────────────┤
│  middleware.ts          │  api-handler.ts (createApiHandler)  │
│  Route Handlers /api/*  │  withAuth middleware (stub)         │
│  services/ai.ts         │  lib/db.ts (Prisma singleton)       │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                     PostgreSQL (Prisma ORM)                    │
│  User │ OnyxContext │ DSAVault │ PlatformProfile │ StudySession│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  backend/ (parallel layer — microservice-ready stubs)        │
│  controllers │ services │ validators │ routes │ jobs │ models  │
└─────────────────────────────────────────────────────────────┘
```

## Layer responsibilities

### Presentation (`src/app`, `src/components`)
- Renders UI only
- Reads/writes Zustand for UI state
- Fetches via TanStack Query (when wired)
- Never calls LLM APIs directly

### Application (`src/hooks`, `src/store`, `src/features`)
- Orchestrates client behavior
- Command registration, keyboard shortcuts
- Feature flags per module

### Domain (`src/types`, `src/constants`, `src/modules` — future)
- Business types and module boundaries
- `src/modules/` reserved for feature domain logic

### Infrastructure (`src/lib`, `src/server`, `src/config`)
- DB client, API helpers, env validation
- Route handler factory, auth middleware

### Services (`src/services`)
- External integrations (AI, future: email, scraping)
- Provider pattern with stubs

### Backend folder (`backend/`)
- Mirrors classic MVC for future extraction to microservices
- Currently thin stubs delegating patterns to `src/`

## Data flow — API request

```
Client → POST /api/ai
       → middleware.ts (adds x-onyx-version header)
       → route.ts
       → createApiHandler({ schema, handler })
       → zod validation
       → handler logic (future)
       → apiSuccess(data) | apiError(code, message)
       → JSON APIResponse<T>
```

## Data flow — Command palette

```
User Ctrl+K
  → useCommandPaletteShortcut
  → useOnyxStore.toggleCommandPalette()
  → CommandPaletteHost renders
  → useCommandInit (on mount) registered nav commands
  → User selects command → cmd.action() → router.push() + close
```

## State persistence

Zustand `persist` middleware stores to `localStorage` key `onyx-store`:
- Partialized: `ui.sidebarCollapsed`, `onboarding`
- NOT persisted: context, commandPaletteOpen, roadmap

## Extension points

| Extension | Location | How |
|-----------|----------|-----|
| New module route | `src/app/[name]/page.tsx` + `NAV_ITEMS` | Add nav entry + ModuleShell page |
| New API route | `src/app/api/[name]/route.ts` | Use `createApiHandler` |
| New command | `registerCommand()` in `useCommandInit` or module | CommandItem interface |
| New AI provider | `src/services/ai/providers.ts` | Implement `ProviderAdapter` |
| New DB model | `prisma/schema.prisma` | Add model + migrate |
| Feature flag | `src/features/registry.ts` | `registerFeature()` |

## Security (planned, not implemented)

- `withAuth` checks `x-user-id` header (placeholder)
- Real auth should set session/JWT and populate header or use Next.js `auth()`
- Never expose API keys client-side — `config/env.ts` is server-only

## Scalability decisions

- Domain-driven folder split for team parallelism
- `backend/` can become separate Node service
- Prisma indexes on `userId`, `isDeleted`, `startedAt` for analytics
- JSON `metadata` fields for schema-flexible extensions
- Feature registry for gradual module rollout
