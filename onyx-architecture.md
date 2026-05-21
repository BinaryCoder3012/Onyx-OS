# 🧠 [ONYX_OS] - MASTER ARCHITECTURE & AI EXECUTION PROTOCOL
**Version:** 1.0.0-PROD | **Codename:** Onyx
**AI Persona:** Principal Systems Architect, Lead UI/UX Designer, & Backend Scalability Expert.

## 🛑 0. CRITICAL AI EXECUTION LAWS (TOKEN/CONTEXT PRESERVATION)
To the AI interpreting this document: You are bound by these absolute laws to prevent context exhaustion:
1. **Zero Boilerplate:** NEVER output unchanged code. Always use `// ... existing code ...` for unmodified sections.
2. **Atomic Delivery:** Output ONLY the specific file, function, or component requested in the user's prompt. Do NOT hallucinate subsequent steps.
3. **No Conversational Filler:** Output code directly. Omit explanations unless explicitly requested.
4. **Strict Typing:** Every component, state, and API route MUST have a defined TypeScript interface exported from `@/types/index.ts`. No implicit `any`.
5. **Component Fracture:** Any file exceeding 150 lines MUST be abstracted into smaller sub-components or custom hooks.

---

## 🎨 1. "OBSIDIAN-UI" DESIGN SYSTEM (ANTI-SLOP AESTHETIC)
Onyx OS must reject standard, bubbly SaaS aesthetics. It must feel like a premium, data-dense, hyper-fast terminal for engineers (think Arc Browser meets Bloomberg Terminal meets GitHub).
- **Theme Focus:** Ultra-Dark Mode Exclusive.
- **Base Backgrounds:** True Black (`#000000`) to Deep Carbon (`#0A0A0A`).
- **Elevated Surfaces:** Matte Graphite (`#121212`) with 1px solid borders (`#1E1E1E`). No heavy drop-shadows.
- **Corner Radius:** Brutalist. Use `rounded-none` or `rounded-sm`. NO `rounded-xl` or `rounded-full` containers.
- **Typography Matrix:** - *Data/Code/Metrics:* `Geist Mono` or `JetBrains Mono` (always tabular-nums).
  - *Headings/UI Text:* `Geist Sans` or `Inter` (tracking-tight).
- **The "Onyx Glow" (Accents):** Monochromatic UI punctuated by a SINGLE high-contrast neon accent for primary actions and active states: *Cyber-Yellow* (`#FACC15`) or *Neon-Cyan* (`#22D3EE`).
- **Layout Architecture:** Resizable split-panes, Bento-box grids, and a global Command Palette (`Cmd/Ctrl + K`) for 100% of app navigation.
- **Micro-Interactions:** Instantaneous. Framer Motion configurations must use high stiffness (`stiffness: 500, damping: 30`). 

---

## 🏗️ 2. GLOBAL TECH STACK & INFRASTRUCTURE
- **Frontend Engine:** Next.js 14 (App Router) + React 18 + Tailwind CSS.
- **State Orchestration:** Zustand (Global Client State) + TanStack React Query v5 (Server State/Caching).
- **Database Layer:** PostgreSQL (via Prisma OR Supabase) / MongoDB (via Mongoose).
- **Authentication:** NextAuth.js v5 (JWT, GitHub/Google OAuth, session rotation).
- **Data Visualization:** Recharts (custom styled with Obsidian-UI tokens), `react-calendar-heatmap`.
- **Rich Interaction:** Monaco Editor (embedded IDE), Novel/TipTap (Notion-style rich text).
- **Backend/API:** Next.js Server Actions + API Routes (Serverless).

---

## 🗄️ 3. UNIFIED DATABASE SCHEMA (Relational Mapping)
*AI Note: Map these to Prisma Models or Mongoose Schemas strictly upon request.*

### Core Identity & Context
- `User`: id, email, role, targetRole, targetCompanies[], cgpa, branch, githubHandle, leetcodeHandle, codeforcesHandle, onboardingCompleted.
- `OnyxContext`: id, userId, weakTopics[], strongTopics[], availableStudyHoursPerWeek, burnoutIndex(0-100), currentInternshipStatus.

### The Analytics & Coding Engine
- `DSAVault`: id, userId, problemName, platform, difficulty, topic, status (Solved/Stuck/Review), timeTakenMs, spaceComplexity, timeComplexity, notes (Markdown), nextRevisionDate (SM-2 Spaced Repetition Alg).
- `PlatformProfile`: id, userId, platform (LC/CF/CC), rating, maxRating, globalRank, totalSolved, lastSyncTimestamp.
- `StudySession (Pomodoro)`: id, userId, category, durationMinutes, timestamp, productivityScore, focusMood.

### Career & Opportunity Engine
- `ProjectArchitecture`: id, userId, title, techStack[], githubUrl, liveUrl, backendComplexityScore, frontendComplexityScore, architectureDiagramUrl.
- `ResumeIntelligence`: id, userId, parsedJson, atsScore, weakBullets[], strongBullets[], aiRecommendations[].
- `OpportunityRadar`: id, companyName, role, applicationUrl, eligibilityCriteria, matchScore, status (Applied/Interview/Rejected), interviewDates[].

---

## 🧠 4. AI ORCHESTRATION & RAG PIPELINE
**ABSOLUTE RULE:** Do NOT call LLMs directly from client components. All AI logic routes through a centralized `/services/ai.ts` module.
- **Models:** Primary: `gpt-4o-mini` or `claude-3.5-haiku` (latency focus). Fallback: `gpt-3.5-turbo`.
- **RAG (Retrieval-Augmented Generation):** Every AI prompt MUST inject the user's `OnyxContext` and `PlatformProfile` prior to generation. *(Example: "User is an ENI branch student, 8.3 CGPA, CF rating 1150, weak in DP. Generate a customized 7-day sprint.")*
- **Structured Outputs:** AI must ALWAYS return validated JSON via `zod`. Never output raw text paragraphs to the UI.

---

## 🔌 5. API INTEGRATION MATRIX (The Web Connectors)
1. **Alfa LeetCode API:** (`alfa-leetcode-api.onrender.com`) Fetch rating, contest history, recent submissions.
2. **Codeforces API:** (`codeforces.com/api`) Fetch user info, max rating, contest performance.
3. **GitHub GraphQL API:** Fetch daily commit counts, language breakdown, contribution graphs.
4. **OpenAI / Anthropic API:** For AI mock interviews, resume parsing, and roadmap generation.
5. **WakaTime API:** Sync actual hours spent coding in VS Code/Cursor.
6. **Stripe API:** Subscription tiers, usage-based token billing.

---

## 🚀 6. THE 1000+ FEATURE ROADMAP (Execution Modules)
*AI Assistant: Await explicit prompts to build specific features from these modules.*

### Module A: The "Omni-Matrix" Developer Dashboard
- **The "Syntax" Heatmap:** A single contribution graph merging GitHub commits, LeetCode submissions, and Codeforces contests.
- **Delta Velocity Visualizer:** Recharts overlay displaying rating growth trajectory against target company requirements.
- **Real-Time API Sync:** Background CRON jobs fetching coding profiles automatically.

### Module B: Adaptive Roadmap & Spaced Repetition
- **Algorithmic Pathing:** If a user fails 3 "Dynamic Programming" problems in the `DSAVault`, the engine automatically modifies their calendar to inject a DP fundamentals revision block.
- **SM-2 Flashcard CLI:** Command-palette interface for rapidly practicing CS Fundamentals (DBMS, OOP, OS).
- **Time-Boxed Sprints:** Generates dynamic Pomodoro sessions mapped exactly to the user's `availableStudyHoursPerWeek`.

### Module C: Career & Resume Intelligence
- **Semantic Bullet Optimizer:** User inputs "built chat app." AI returns 3 metric-driven, ATS-optimized resume bullets based on successful IT resumes.
- **Opportunity Filter:** Auto-filters the `OpportunityRadar` database, flagging roles that strictly match the user's CGPA, branch (ENI), and graduation year.
- **A/B Project Scorer:** AI analyzes the `ProjectArchitecture` stack and suggests 2 specific features to increase the project's complexity score for FAANG interviews.

### Module D: AI Mentorship & Simulation
- **AI Code Reviewer:** Embedded Monaco editor where users paste solutions. AI returns Time/Space complexity analysis and optimization suggestions.
- **The "Grind" Simulator:** AI voice/text agent simulating a harsh technical interviewer grilling the user on specific edge cases in their weak topics.

---

## 🛡️ 7. EDGE CASES & SYSTEM RESILIENCE
- **Optimistic UI:** When a user logs a problem or updates a status, update the UI instantly before the DB resolves. Revert on API failure.
- **API Rate Limiting:** Implement Upstash Redis rate limiting for all OpenAI and LeetCode API calls to prevent token exhaustion.
- **Data Integrity (Soft Deletes):** Never `DELETE FROM` the database. Use `isDeleted: boolean` for trash bin recovery.
- **Key Security:** User's personal OpenAI/GitHub keys MUST be encrypted at rest (AES-256) in the database.

---

## 🏁 8. INITIALIZATION PROTOCOL
To the AI reading this: Acknowledge that you have ingested the Onyx OS Architecture by responding ONLY with: 
`[SYSTEM LOADED] Onyx OS Architecture verified. Standby for Phase 1 execution commands.`