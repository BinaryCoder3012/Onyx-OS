// Made by Lakshya Sachdeva
import type { AIUsage } from "@/types";

export type AIProvider = "gemini" | "openai" | "claude";

export interface ProviderCompletionResult {
  raw: string;
  usage: AIUsage;
}

export interface ProviderAdapter {
  readonly name: AIProvider;
  complete(system: string, user: string, model?: string): Promise<ProviderCompletionResult>;
}

// ── Gemini ────────────────────────────────────────────────────────────

const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash-native-audio-latest";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function createGeminiAdapter(apiKey: string): ProviderAdapter {
  return {
    name: "gemini",
    async complete(system, user, model = GEMINI_DEFAULT_MODEL) {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini ${res.status}: ${text}`);
      }

      const json = (await res.json()) as {
        candidates: { content: { parts: { text: string }[] } }[];
        usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
      };

      const raw = json.candidates[0]?.content?.parts[0]?.text ?? "{}";
      const meta = json.usageMetadata;

      return {
        raw,
        usage: {
          promptTokens: meta?.promptTokenCount ?? 0,
          completionTokens: meta?.candidatesTokenCount ?? 0,
          model,
        },
      };
    },
  };
}

// ── OpenAI ────────────────────────────────────────────────────────────

const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_BASE = "https://api.openai.com/v1";

export function createOpenAIAdapter(apiKey: string): ProviderAdapter {
  return {
    name: "openai",
    async complete(system, user, model = OPENAI_DEFAULT_MODEL) {
      const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI ${res.status}: ${text}`);
      }

      const json = (await res.json()) as {
        choices: { message: { content: string } }[];
        usage?: { prompt_tokens: number; completion_tokens: number };
        model: string;
      };

      const raw = json.choices[0]?.message?.content ?? "{}";

      return {
        raw,
        usage: {
          promptTokens: json.usage?.prompt_tokens ?? 0,
          completionTokens: json.usage?.completion_tokens ?? 0,
          model: json.model,
        },
      };
    },
  };
}

// ── Anthropic ─────────────────────────────────────────────────────────

const ANTHROPIC_DEFAULT_MODEL = "claude-3-haiku-20240307";
const ANTHROPIC_BASE = "https://api.anthropic.com/v1";

export function createAnthropicAdapter(apiKey: string): ProviderAdapter {
  return {
    name: "claude",
    async complete(system, user, model = ANTHROPIC_DEFAULT_MODEL) {
      const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Anthropic ${res.status}: ${text}`);
      }

      const json = (await res.json()) as {
        content: { type: string; text: string }[];
        usage?: { input_tokens: number; output_tokens: number };
        model: string;
      };

      const raw = json.content.find((b) => b.type === "text")?.text ?? "{}";

      return {
        raw,
        usage: {
          promptTokens: json.usage?.input_tokens ?? 0,
          completionTokens: json.usage?.output_tokens ?? 0,
          model: json.model,
        },
      };
    },
  };
}

export function createStubAdapter(name: AIProvider): ProviderAdapter {
  return {
    name,
    async complete(system, user) {
      let raw = "{}";
      const promptLower = (system + "\n" + user).toLowerCase();
      
      if (promptLower.includes("roadmap")) {
        raw = JSON.stringify({
          roadmap: [
            {
              title: "Phase 1: Foundations",
              description: "Learn the core fundamentals and language basics.",
              duration: "Weeks 1-4",
              children: [
                {
                  title: "Syntax & Programming Concepts",
                  description: "Master variables, loops, control structures, and basic algorithms.",
                  duration: "Week 1",
                  resources: ["MDN Web Docs - JS Basics", "W3Schools programming foundations"]
                },
                {
                  title: "Data Structures Basics",
                  description: "Understand arrays, objects, lists, and basic operations on them.",
                  duration: "Week 2",
                  resources: ["LeetCode Beginner's Guide", "GeeksforGeeks basics"]
                },
                {
                  title: "Version Control & Git",
                  description: "Learn to use Git, branching, merging, and collaboration on GitHub.",
                  duration: "Week 3",
                  resources: ["Git Handbook", "GitHub Learning Labs"]
                },
                {
                  title: "Basic Web Stack",
                  description: "Introduction to HTML, CSS, and styling fundamentals.",
                  duration: "Week 4",
                  resources: ["HTML/CSS MDN Guide", "CSS Tricks Flexbox Guide"]
                }
              ]
            },
            {
              title: "Phase 2: Core Development & Tooling",
              description: "Build interactive applications and learn core libraries.",
              duration: "Weeks 5-12",
              children: [
                {
                  title: "Frontend Frameworks",
                  description: "Deep dive into React, state management (Zustand/Redux), and custom hooks.",
                  duration: "Weeks 5-7",
                  resources: ["React Official Documentation", "Zustand Docs"]
                },
                {
                  title: "Backend Foundations",
                  description: "Learn HTTP protocol, Node.js, Express, REST APIs, and database basics (SQL/NoSQL).",
                  duration: "Weeks 8-10",
                  resources: ["Node.js Guide", "Prisma ORM Tutorials"]
                },
                {
                  title: "Full-Stack Integration",
                  description: "Connect frontend with backend, handle CORS, cookies, and tokens.",
                  duration: "Weeks 11-12",
                  resources: ["MDN Client-Server communications", "JWT Auth Overview"]
                }
              ]
            },
            {
              title: "Phase 3: Advanced Concepts & Projects",
              description: "Deepen your knowledge and build robust, deployed projects.",
              duration: "Weeks 13-20",
              children: [
                {
                  title: "Testing & CI/CD",
                  description: "Write unit, integration, and end-to-end tests. Set up GitHub Actions.",
                  duration: "Weeks 13-14",
                  resources: ["Jest Docs", "Cypress E2E Testing Guide"]
                },
                {
                  title: "Performance & Security",
                  description: "Optimize database queries, configure caching (Redis), implement rate limiting and HTTPS.",
                  duration: "Weeks 15-17",
                  resources: ["OWASP Top 10 Security Guide", "Redis caching patterns"]
                },
                {
                  title: "System Design & Architecture",
                  description: "Understand architectural patterns, monolithic vs microservices, and message queues.",
                  duration: "Weeks 18-20",
                  resources: ["ByteByteGo System Design primer", "AWS Architecture Center"]
                }
              ]
            },
            {
              title: "Phase 4: Interview Prep & Capstone",
              description: "Prepare for coding interviews and finalize your portfolio.",
              duration: "Weeks 21-24",
              children: [
                {
                  title: "DSA & Coding Problems",
                  description: "Solve array, string, dynamic programming, and graph problems on LeetCode/Codeforces.",
                  duration: "Weeks 21-22",
                  resources: ["NeetCode 150 roadmap", "DSA Vault practice tracker"]
                },
                {
                  title: "Resume & Portfolio Optimization",
                  description: "Perfect your resume, optimize your GitHub profile, and practice mock interviews.",
                  duration: "Weeks 23-24",
                  resources: ["Tech Resume templates", "Onyx Resume scanner insights"]
                }
              ]
            }
          ]
        });
      } else if (promptLower.includes("resume")) {
        raw = JSON.stringify({
          extractedSections: [
            {
              type: "experience",
              content: "Software Engineer Intern at Tech Corp (6 months). Built dashboard widgets in React. Optimized database queries by 20%. Worked in agile team.",
              score: 75
            },
            {
              type: "projects",
              content: "Developer Platform - Onyx OS: built Next.js app with real-time sync. Personal Portfolio: HTML/CSS responsive site.",
              score: 80
            },
            {
              type: "skills",
              content: "JavaScript, TypeScript, React, Next.js, Node.js, HTML, CSS, SQL, Git, DSA.",
              score: 85
            },
            {
              type: "education",
              content: "B.S. Computer Science, State University, GPA: 3.6/4.0.",
              score: 90
            }
          ],
          careerGoals: [
            {
              title: "Master Backend System Design",
              description: "Learn caching patterns, message brokers, and SQL query indexing to support high scalability."
            },
            {
              title: "Implement E2E Testing Suite",
              description: "Add comprehensive unit testing (Jest) and browser tests (Playwright) to existing projects."
            },
            {
              title: "Deploy to Production & Monitor",
              description: "Set up CI/CD pipelines, Dockerize applications, and add monitoring (Sentry/Datadog)."
            }
          ]
        });
      }

      return {
        raw,
        usage: { promptTokens: 0, completionTokens: 0, model: `${name}-stub` },
      };
    },
  };
}
