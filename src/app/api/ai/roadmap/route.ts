import { z } from "zod";
import { chatJson } from "@/lib/ollama";
import { aiRoute } from "@/lib/ai/handler";

export const maxDuration = 60;

const Body = z.object({
  goal: z.string().min(3).max(200),
  level: z.enum(["new", "some", "solid"]),
  hoursPerWeek: z.number().int().min(2).max(60),
  weeks: z.number().int().min(4).max(52),
  context: z.string().max(6000).default(""),
});

const Result = z.object({
  phases: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        weeks: z.number().int().min(1),
        steps: z
          .array(
            z.object({
              title: z.string(),
              detail: z.string(),
              resources: z.array(z.string()).max(4).default([]),
            }),
          )
          .min(2)
          .max(7),
      }),
    )
    .min(2)
    .max(6),
});

const LEVEL = {
  new: "just starting out",
  some: "has built a few things",
  solid: "already works professionally",
};

export const POST = aiRoute(Body, (b) =>
  chatJson(
    Result,
    "You plan learning roadmaps for software engineers. Steps are concrete, checkable deliverables (build X, solve N problems on Y, read Z), not vague topics. Resources are real, well-known and free where possible (official docs, named books, named courses). Week counts across phases must add up to the total.",
    `Goal: ${b.goal}\nLevel: ${LEVEL[b.level]}\nTime: ${b.hoursPerWeek} hours a week for ${b.weeks} weeks\n\nWhat they already have:\n${b.context || "(nothing recorded)"}`,
    `{"phases":[{"title":string,"summary":string (one sentence),"weeks":integer,"steps":[{"title":string (imperative, under 60 chars),"detail":string (one or two sentences),"resources":string[] (0-3)}]}]}  (3 to 5 phases, 3 to 6 steps each)`,
  ),
);
