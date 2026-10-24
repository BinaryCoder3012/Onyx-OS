# Onyx OS

**Your progress, set in stone.** One workspace for the problems you solve, your contest ratings, a learning roadmap, your resume and the job hunt, with an AI that has read all of it.

Onyx is banded stone, and the app is built around that idea: the landing page is a polished onyx block rendered in WebGL that splits into its seven layers as you scroll, and you can type a Codeforces handle to cut your own rating history into it, one band per contest (chalk for climbs, sard for falls).

## What is inside

| Layer | What it does |
| --- | --- |
| **Today** | Daily goal, streak, ratings and deadlines at a glance; an AI brief picks the three moves with the most leverage today. |
| **Problems** | Log problems (paste a link and the title and judge fill in), tag topics, mark revisits, see solves by week and topic. |
| **Ratings** | Codeforces, LeetCode, AtCoder and CodeChef on one interactive chart, from each judge's public data. |
| **Roadmap** | Describe a goal and your hours; the AI drafts phases of checkable steps with real resources. |
| **Resume** | Upload a PDF, DOCX or TXT; get a score, section notes, missing keywords and sharper rewrites of your own bullets. |
| **Career** | Dated goals and a target role that shapes every AI answer. |
| **Openings** | Applications from saved to offer, deadline countdowns, and an AI fit check against your resume. |
| **Focus** | A focus timer that keeps running across pages and logs what you studied. |
| **Ask Onyx** | Press `/` anywhere. Answers stream in and cite your own workspace. `Ctrl K` jumps anywhere. |

## Stack

- **Next.js 16** (App Router, Turbopack) and **React 19**, TypeScript
- **Tailwind CSS 4** with a token palette taken from the stone (onyx, chalk, sard, agate)
- **Three.js** via **React Three Fiber** and **drei**: the stone is a stack of physical-material slabs whose bands are sampled in stone space by a patched shader, so they run continuously through every face
- **GSAP** with **ScrollTrigger** and `@gsap/react`: the intro, the pinned strata scene and the assistant drawer
- **Zustand** for state, persisted to `localStorage`; **zod** validates every API body and every model reply
- **Ollama Cloud** for AI (any Ollama host works), **unpdf** and **mammoth** for resume text

## Your data

There is no account and no database. The workspace lives in your browser's storage; Settings exports it as JSON and loads it back on another machine. Route handlers only proxy public judge APIs and the model. An AI request carries a short text snapshot of your workspace and nothing is sent in the background.

## Run it

```bash
npm install
cp .env.example .env.local   # then add your key
npm run dev
```

Open http://localhost:3000.

### Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `OLLAMA_API_KEY` | – | Create one at https://ollama.com/settings/keys. Required for Ollama Cloud. |
| `OLLAMA_MODEL` | `gpt-oss:120b` | Any model your key can use. |
| `OLLAMA_HOST` | `https://ollama.com` | Set to `http://localhost:11434` to use a local Ollama instead (no key needed). |

Without a key, everything except the AI features works, and the AI buttons say what is missing.

### Deploy on Vercel

Import the repo, add the three variables above under **Settings → Environment Variables**, and deploy. AI routes allow up to 60 seconds.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Layout

```
src/
  app/               routes: landing, /os/* workspace pages, /api/* handlers
  components/
    stone/           WebGL stone: band textures, slab shader, scroll rig
    landing/         landing page sections and interface fragments
    os/              workspace shell, assistant, palette, timer, modules/*
    charts/          rating chart, week bars, solve grid
    ui/              buttons, fields, panels, figures
  lib/               store, types, Ollama client, judge fetchers, workspace snapshot
```

Made by Lakshya Sachdeva.
