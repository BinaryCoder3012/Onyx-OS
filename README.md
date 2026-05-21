# Onyx OS — Futuristic Developer Operating System 🧠

Onyx OS is a premium, AI-native productivity operating system and telemetry cockpit for software engineers. Designed with a high-density, keyboard-first **Obsidian-UI** aesthetic, it acts as a "Bloomberg Terminal for developers," unifying DSA tracking, competitive programming metrics, career goals, resume scoring, opportunity tracking, learning roadmaps, and study analytics.
This project is engineered with a clean modular architecture, strict TypeScript types, and a zero-boilerplate design for maximum developer velocity and maintainability.


---

## 🛠️ Tech Stack & Foundations

- **Frontend & Routing:** Next.js 15 (App Router, Strict React 19 compatibility)
- **Styling & UI:** Tailwind CSS, custom Geist fonts, CSS variables for ultra-dark mode
- **State Orchestration:** Zustand (client state slices) + TanStack React Query v5 (cached server state)
- **Database:** Prisma 6 + SQLite (for zero-config local development, easily migratable to PostgreSQL)
- **Authentication:** Custom session cookies (`onyx_session`) with HMAC signing and auto-login bootstrap
- **AI Orchestration:** Centralized `ai.ts` abstraction layer with live support for **Gemini 1.5/2.0**, **OpenAI GPT-4o**, and **Anthropic Claude 3.5** via server-side environment keys.

---

## 📂 Domain-Driven Folder Architecture

```
src/
  ├── app/                  # Next.js app routing and route API handlers
  ├── components/           # UI primitives (Panel, StatCard, Button) & shared layout (Sidebar, Topbar)
  ├── modules/              # Core page features (Dashboard, DSAVault, CPMatrix, Roadmap, etc.)
  ├── services/             # Centralized business logic & AI orchestration layers
  ├── store/                # Zustand global state slices (UI, Roadmap, etc.)
  ├── types/                # Strict TypeScript global typings
  ├── utils/                # Standard formatters, IDs, and platform calculations
  └── lib/                  # Database connections, apiFetch clients, and auth/session management

backend/                    # Microservice-ready server Controllers, Routes, and Controllers
prisma/                     # Database schema definition and seed data scripts
```

---

## 🪐 Obsidian-UI Design System

Implemented via `tailwind.config.ts` and `src/app/globals.css`:
- **Deep Carbon** (`#0a0a0b`) — Main viewport background
- **Matte Graphite** (`#161618` / `#1c1c1f`) — Panels, modals, and container surfaces
- **Cyber Yellow** (`#f5e642`) — Secondary warning, highlights, and badge accents
- **Neon Cyan** (`#00e5ff`) — Active states, focus borders, and interactive highlights
- **Brutalist Bordering:** 1px graphite borders (`border-graphite-border`) with sharp corners (`rounded-none` or `rounded-sm`)
- **Typography:** Geist Mono for data displays and navigation labels; Geist Sans for body text
- **Tabular Numbers:** `tabular-nums` used on all statistics and charts to align numeric readouts

---

## 🗄️ Database Models

Configured with index optimizations, foreign key cascade rules, and **soft delete support** (`isDeleted`) on all records:
- **User / OnyxContext:** Account identities and dynamic user study preferences.
- **DSAVault / DSAProblem:** LeetCode/Codeforces problem statuses (`todo`, `solved`), notes, and difficulty ratings.
- **PlatformProfile:** Usernames/handles and rating caches for platforms (Codeforces, LeetCode, AtCoder, etc.).
- **StudySession:** Focus durations, module activities, and daily analytics history.
- **CareerGoal / ResumeProfile:** Trackable milestones and resume section scores.
- **OpportunityItem:** Scrapable/trackable job matches scored by AI relevancy.
- **RoadmapProgress:** Interactive learning paths.

---

## ⚙️ AI Integration Pipeline

Located in `src/services/ai.ts`:
- **Provider Abstraction:** Swaps transparently between Gemini, OpenAI, and Anthropic based on available environment keys.
- **Strict Contracts:** Employs Zod schemas to guarantee structured JSON outputs (e.g. resume bullet formatting, ATS grading).
- **Security:** Zero client-side LLM calls. All AI executions run server-side.

---

## ⚡ Quick Start

### 1. Set Up Environment Variables
Create a `.env` file in the project root:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="generate-a-secure-32-byte-hex-string-for-hmac-signing"

# AI Keys (Optional - activates live AI features, otherwise uses smart mocks)
AI_PROVIDER="gemini" # or "openai" / "anthropic"
GEMINI_API_KEY=""
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
```

### 2. Install and Initialize Database
```bash
# Disable SSL strictness if hitting corporate proxy errors
npm install

# Push database schema & seed with Operator demo account and stats
npx prisma db push
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**. The page will auto-login as `operator@onyx.dev` via cookie authentication.

---

## 🎯 Command Palette & Keyboard Navigation
Press `Ctrl+K` or `Cmd+K` from any screen to activate the Onyx Shell Command Palette. Navigate modules, trigger UI state changes, or toggle sidebar visibility entirely from the keyboard.
