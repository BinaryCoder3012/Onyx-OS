# 🌌 Onyx OS — Professional Developer Workspace & Career Engine

> Onyx OS is a premium, obsidian-UI brutalist developer platform designed to centralize and automate your coding profiles, track learning roadmap progress, optimize your resume using advanced Gemini AI, and discover high-impact internships and roles.

---

## ⚡ Key Highlights

### 🛡️ Local-First Data Privacy (Non-Training Policy)
We respect developer data integrity. Your credentials, API keys, code files, and resumes are processed locally or dynamically during your session. **We never use your data to train AI models.** 

### 🔄 Dynamic Platform Synchronizers
No more manually typing your stats. With single-click OAuth/API actions, Onyx OS dynamically pulls and stores:
- **LeetCode**: Contest ratings and solve statistics.
- **Codeforces**: Global ranking and real-time rating updates.
- **GitHub**: Contributions and profile indicators.

### 🧠 Gemini AI Resume Intelligence
- **Target Role Adaptability**: Input the career path you are targeting (e.g. *Machine Learning Engineer*, *Backend developer*).
- **Interactive Review Panel**: Edit and refine individual sections (Experience, Projects, Education) and instantly prompt Gemini to evaluate impact, ATS compatibility, and tailored relevance.

### 🗺️ Learner Roadmap & DSA Vault
- **Mastery Tracker**: Dynamic stats of problems solved, topics mastered, and streak days.
- **Interactive Roadmap Engine**: Track learning progression across CS Foundations, Interview Preparation, and Career Launch.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, TailwindCSS, React 19)
- **Database**: [Prisma](https://www.prisma.io/) with local SQLite / production-ready schemas
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Hydration-hardened UI store)
- **AI Integrations**: Gemini API (with full adapter capability for OpenAI / Anthropic)
- **Queries**: TanStack React Query v5

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed.

### 2. Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development

# --- AI Configuration ---
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Install & Seed
Initialize the clean database schema and run the seed script:
```bash
# Install dependencies
npm install

# Push database schema & Seed clean default states
npx prisma db push
npm run db:seed
```

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port specified by the dev process) to launch Onyx OS.

---

## 📄 License & Safety
Built by developers, for developers. All local database structures remain locally on your machine (`prisma/dev.db`). Included in `.gitignore` to prevent any unintentional commits of credentials or api keys to public repositories.
