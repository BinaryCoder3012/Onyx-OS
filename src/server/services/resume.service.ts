import { db } from "@/lib/db";
import { parseJson, toJson } from "@/lib/json";
import { softDeleteFilter } from "@/lib/soft-delete";
import type { ResumeSection } from "@/types";
import { buildPrompt, executeAI } from "@/services/ai";
import { SYSTEM_PROMPTS } from "@/services/ai/prompts";
import { z } from "zod";

export async function getResumeProfile(userId: string) {
  const profile = await db.resumeProfile.findFirst({
    where: { userId, ...softDeleteFilter },
  });
  if (!profile) return null;

  return {
    version: profile.version,
    score: profile.score,
    sections: parseJson<ResumeSection[]>(profile.sections, []),
    lastAnalyzedAt: profile.lastAnalyzedAt?.toISOString() ?? null,
  };
}

export async function updateSection(
  userId: string,
  sectionId: string,
  content: string
) {
  const profile = await db.resumeProfile.findFirst({ where: { userId } });
  const sections = parseJson<ResumeSection[]>(profile?.sections ?? "[]", []);
  const updated = sections.map((s) =>
    s.id === sectionId ? { ...s, content, score: scoreSection(content) } : s
  );
  const avgScore = Math.round(
    updated.reduce((a, s) => a + s.score, 0) / Math.max(updated.length, 1)
  );

  await db.resumeProfile.upsert({
    where: { userId },
    update: { sections: toJson(updated), score: avgScore, lastAnalyzedAt: new Date() },
    create: { userId, sections: toJson(updated), score: avgScore, lastAnalyzedAt: new Date() },
  });

  return { sections: updated, score: avgScore };
}

function scoreSection(content: string): number {
  const len = content.trim().length;
  if (len < 20) return 40;
  if (len < 60) return 65;
  if (len < 120) return 80;
  return Math.min(95, 80 + Math.floor(len / 50));
}

export async function analyzeResume(userId: string, targetRole?: string) {
  const profile = await getResumeProfile(userId);
  if (!profile) return null;

  const schema = z.object({
    sections: z.array(z.object({
      id: z.string(),
      score: z.number().min(0).max(100)
    })),
    overallScore: z.number().min(0).max(100)
  });

  const targetContext = targetRole ? `The user is specifically targeting the role of: "${targetRole}". Please tailor your scoring and analysis to how well the resume fits this specific role.` : "Score the resume generally based on software engineering best practices.";

  const prompt = buildPrompt(
    SYSTEM_PROMPTS.resume,
    `Analyze this developer resume and score each section (0-100) based on impact, action verbs, and ATS compatibility. ${targetContext} Also give an overall score.\n\n${JSON.stringify(profile.sections, null, 2)}`,
    schema
  );

  const response = await executeAI(prompt);

  let analyzed = profile.sections;
  let score = 0;

  if (response.success && response.data) {
    const aiData = response.data;
    analyzed = profile.sections.map((s) => {
      const aiScore = aiData.sections.find((x) => x.id === s.id)?.score;
      return { ...s, score: aiScore ?? scoreSection(s.content) };
    });
    score = aiData.overallScore;
  } else {
    // Fallback if AI fails or no key
    analyzed = profile.sections.map((s) => ({
      ...s,
      score: scoreSection(s.content),
    }));
    score = Math.round(
      analyzed.reduce((a, s) => a + s.score, 0) / Math.max(analyzed.length, 1)
    );
  }

  await db.resumeProfile.updateMany({
    where: { userId },
    data: { sections: toJson(analyzed), score, lastAnalyzedAt: new Date() },
  });

  return { sections: analyzed, score, lastAnalyzedAt: new Date().toISOString() };
}
