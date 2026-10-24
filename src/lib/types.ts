export type Platform = "codeforces" | "leetcode" | "atcoder" | "codechef";

export const PLATFORMS: { id: Platform; name: string; profileUrl: (h: string) => string }[] = [
  { id: "codeforces", name: "Codeforces", profileUrl: (h) => `https://codeforces.com/profile/${h}` },
  { id: "leetcode", name: "LeetCode", profileUrl: (h) => `https://leetcode.com/u/${h}` },
  { id: "atcoder", name: "AtCoder", profileUrl: (h) => `https://atcoder.jp/users/${h}` },
  { id: "codechef", name: "CodeChef", profileUrl: (h) => `https://www.codechef.com/users/${h}` },
];

export interface RatingPoint {
  /** unix ms */
  t: number;
  rating: number;
  contest: string;
}

export interface PlatformStats {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  solved: number | null;
  history: RatingPoint[];
  fetchedAt: number;
}

export type ProblemStatus = "todo" | "attempted" | "solved" | "revisit";
export type Difficulty = "easy" | "medium" | "hard";

export interface Problem {
  id: string;
  title: string;
  url?: string;
  source: string;
  difficulty: Difficulty;
  topics: string[];
  status: ProblemStatus;
  notes?: string;
  createdAt: number;
  solvedAt?: number;
}

export interface RoadmapStep {
  id: string;
  title: string;
  detail: string;
  resources: string[];
  done: boolean;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  summary: string;
  weeks: number;
  steps: RoadmapStep[];
}

export interface Roadmap {
  goal: string;
  hoursPerWeek: number;
  phases: RoadmapPhase[];
  createdAt: number;
}

export interface ResumeReview {
  score: number;
  verdict: string;
  sections: { name: string; score: number; notes: string[] }[];
  rewrites: { before: string; after: string }[];
  missingKeywords: string[];
}

export interface ResumeState {
  fileName: string;
  text: string;
  targetRole: string;
  review: ResumeReview | null;
  analyzedAt?: number;
}

export type GoalStatus = "active" | "done" | "dropped";

export interface CareerGoal {
  id: string;
  title: string;
  detail?: string;
  due?: string;
  status: GoalStatus;
  createdAt: number;
}

export type OpeningStage = "saved" | "applied" | "interview" | "offer" | "closed";

export interface Opening {
  id: string;
  company: string;
  role: string;
  kind: "internship" | "full-time" | "contract";
  url?: string;
  stage: OpeningStage;
  deadline?: string;
  notes?: string;
  fit?: { score: number; reasons: string[]; gaps: string[] };
  createdAt: number;
  updatedAt: number;
}

export interface FocusSession {
  id: string;
  label: string;
  minutes: number;
  /** unix ms when the session ended */
  endedAt: number;
}

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Profile {
  name: string;
  targetRole: string;
  handles: Partial<Record<Platform, string>>;
  dailyGoal: number;
}
