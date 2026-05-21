# Onyx OS Documentation

Documentation for developers and AI agents continuing this project.

## Start here (for Anti-Gravity / AI)

**Primary context file:** [`ANTI-GRAVITY-CONTEXT.md`](./ANTI-GRAVITY-CONTEXT.md)

Copy or attach that file plus any relevant sections below when starting a new AI session.

## Document index

| Document | Use when |
|----------|----------|
| [ANTI-GRAVITY-CONTEXT.md](./ANTI-GRAVITY-CONTEXT.md) | Full project context in one file |
| [DEVELOPMENT-LOG.md](./DEVELOPMENT-LOG.md) | What was done and when |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flows |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | UI tokens, classes, rules |
| [FILE-REFERENCE.md](./FILE-REFERENCE.md) | What each file does |
| [API-CONTRACTS.md](./API-CONTRACTS.md) | Types, API shapes, env vars |
| [../onyx-architecture.md](../onyx-architecture.md) | Product design laws |

## Quick status

- **Phase 1:** ✅ Complete
- **Phase 2:** ✅ Complete — all modules functional
- **Dev server:** `npm run dev` → http://localhost:3000
- **Build:** `npm run build` passes
- **Database:** SQLite `prisma/dev.db` — run `npm run db:seed` after push

## Maintenance

After each work session, update:
1. `DEVELOPMENT-LOG.md` — dated entry
2. `ANTI-GRAVITY-CONTEXT.md` — phase status section
3. This README if new docs are added
