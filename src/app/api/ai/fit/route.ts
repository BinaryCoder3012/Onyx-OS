import { z } from "zod";
import { chatJson } from "@/lib/ollama";
import { aiRoute } from "@/lib/ai/handler";

export const maxDuration = 60;

const Body = z.object({
  company: z.string().max(120),
  role: z.string().max(160),
  notes: z.string().max(6000).default(""),
  profile: z.string().max(12000),
});

const Result = z.object({
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()).max(4),
  gaps: z.array(z.string()).max(4),
});

export const POST = aiRoute(Body, (b) =>
  chatJson(
    Result,
    "You are a blunt technical recruiter. Judge how well this candidate fits the opening from the evidence given only. A score of 70+ means apply now; under 40 means a long shot. Reasons and gaps are short and specific (name the skill, project or number).",
    `Opening: ${b.role} at ${b.company}\nJob notes / description:\n${b.notes || "(none, judge from the title)"}\n\nCandidate:\n${b.profile}`,
    `{"score":integer 0-100,"reasons":string[] (2-4, why they fit),"gaps":string[] (1-4, what is missing)}`,
  ),
);
