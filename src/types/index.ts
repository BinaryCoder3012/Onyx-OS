export type OnyxModuleId =
  | "dashboard"
  | "dsa-vault"
  | "cp-matrix"
  | "roadmap-engine"
  | "career-radar"
  | "resume-intelligence"
  | "opportunity-radar"
  | "analytics"
  | "settings";

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface OnyxContext {
  id: string;
  userId: string;
  activeModule: OnyxModuleId;
  preferences: OnyxPreferences;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface OnyxPreferences {
  density: "compact" | "comfortable";
  keyboardHints: boolean;
  commandPaletteEnabled: boolean;
}

export interface DSAVault {
  id: string;
  userId: string;
  problemsSolved: number;
  topicsMastered: string[];
  streakDays: number;
  lastActivityAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface PlatformProfile {
  id: string;
  userId: string;
  leetcodeHandle: string | null;
  codeforcesHandle: string | null;
  codechefHandle: string | null;
  atcoderHandle: string | null;
  githubUsername: string | null;
  linkedinUrl: string | null;
  ratings: PlatformRatings;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface PlatformRatings {
  leetcode: number | null;
  codeforces: number | null;
  codechef: number | null;
  atcoder: number | null;
}

export interface StudySession {
  id: string;
  userId: string;
  moduleId: OnyxModuleId;
  durationMinutes: number;
  focusScore: number;
  startedAt: string;
  endedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ProjectArchitecture {
  id: string;
  userId: string;
  name: string;
  stack: string[];
  status: "planning" | "active" | "archived";
  milestones: ProjectMilestone[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueAt: string | null;
}

export interface ResumeIntelligence {
  id: string;
  userId: string;
  version: number;
  score: number;
  sections: ResumeSection[];
  lastAnalyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ResumeSection {
  id: string;
  type: "experience" | "education" | "skills" | "projects";
  content: string;
  score: number;
}

export interface OpportunityRadar {
  id: string;
  userId: string;
  opportunities: Opportunity[];
  filters: OpportunityFilters;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: "internship" | "full-time" | "contract";
  matchScore: number;
  url: string | null;
  discoveredAt: string;
}

export interface OpportunityFilters {
  types: Opportunity["type"][];
  minMatchScore: number;
  remoteOnly: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error: APIError | null;
  meta: APIMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface APIMeta {
  timestamp: string;
  requestId: string;
}

export interface AIResponse<T> {
  success: boolean;
  data: T | null;
  error: AIError | null;
  usage: AIUsage;
}

export interface AIError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  model: string;
}

export interface GlobalThemeConfig {
  mode: "dark";
  accent: "cyber-yellow" | "neon-cyan";
  density: "compact" | "comfortable";
  borderRadius: "none" | "sm";
  fontFamily: "geist-sans" | "geist-mono";
}

export interface RoadmapNode {
  id: string;
  title: string;
  status: "locked" | "active" | "complete";
  children: RoadmapNode[];
}

export interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  group: string;
  action: () => void;
}
