import { z } from "zod";
import { chatJson } from "@/lib/ollama";
import { aiRoute } from "@/lib/ai/handler";

export const maxDuration = 60;

const Body = z.object({ context: z.string().max(12000) });

const HREFS = [
  "/os/problems",
  "/os/ratings",
  "/os/roadmap",
  "/os/resume",
  "/os/career",
  "/os/openings",
  "/os/focus",
] as const;

const Result = z.object({
  items: z
    .array(z.object({ title: z.string(), why: z.string(), href: z.enum(HREFS).catch("/os/problems") }))
    .min(1)
    .max(3),
});

export const POST = aiRoute(Body, (b) =>
  chatJson(
    Result,
    "You decide what a programmer should do today, from their workspace. Pick the three moves with the most leverage right now: an application deadline beats a roadmap step; a long gap since the last solve beats a new topic. Each title is an imperative under 70 characters naming the exact thing (the problem topic, the company, the step). Each why is one sentence citing their data. If the workspace is nearly empty, the moves are about setting it up (add handles, upload the resume, plan a roadmap).",
    b.context,
    `{"items":[{"title":string,"why":string,"href":one of ${HREFS.map((h) => `"${h}"`).join(" | ")}}]}  (exactly 3 items)`,
  ),
);
