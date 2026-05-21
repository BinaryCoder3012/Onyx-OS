import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import { executeAI, buildPrompt } from "@/services/ai";
import { SYSTEM_PROMPTS } from "@/services/ai/prompts";
import { z } from "zod";
import { db } from "@/lib/db";
import { toJson } from "@/lib/json";

const parseSchema = z.object({
  resumeText: z.string().min(10, "Resume text is too short"),
  targetRole: z.string().min(1, "Target role is required"),
});

export const POST = createApiHandler({
  schema: parseSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);

    // Schema for the AI response
    const aiSchema = z.object({
      extractedSections: z.array(z.object({
        type: z.string(),
        content: z.string(),
        score: z.number()
      })),
      careerGoals: z.array(z.object({
        title: z.string(),
        description: z.string(),
      }))
    });

    const prompt = buildPrompt(
      SYSTEM_PROMPTS.resume, // We'll just reuse the general resume prompt or provide a specific one
      `Parse the following resume text for a user targeting the role of "${body.targetRole}". 
Extract logical sections (e.g., Experience, Projects, Skills, Education) and score them out of 100 based on quality.
Also, suggest 2-3 immediate, actionable career goals based on the gaps between their resume and their target role.

Resume Text:
${body.resumeText}`,
      aiSchema
    );

    const aiResponse = await executeAI(prompt);

    if (!aiResponse.success || !aiResponse.data) {
      return apiError(ERROR_CODES.AI_EXECUTION_FAILED, "Failed to parse resume with AI");
    }

    const { extractedSections, careerGoals } = aiResponse.data;

    // Map extracted sections to the ResumeSection format
    const sectionsToSave = extractedSections.map(sec => ({
      id: crypto.randomUUID(),
      type: sec.type,
      content: sec.content,
      score: sec.score
    }));

    const avgScore = sectionsToSave.length > 0 
      ? Math.round(sectionsToSave.reduce((a, b) => a + b.score, 0) / sectionsToSave.length) 
      : 0;

    // Save Resume
    await db.resumeProfile.upsert({
      where: { userId: user.id },
      update: {
        sections: toJson(sectionsToSave),
        score: avgScore,
        lastAnalyzedAt: new Date()
      },
      create: {
        userId: user.id,
        sections: toJson(sectionsToSave),
        score: avgScore,
        lastAnalyzedAt: new Date()
      }
    });

    // Save Career Goals
    for (const goal of careerGoals) {
      await db.careerGoal.create({
        data: {
          userId: user.id,
          title: goal.title,
          description: goal.description,
          status: "active",
          priority: 1
        }
      });
    }

    return apiSuccess({
      resumeScore: avgScore,
      sectionsCount: sectionsToSave.length,
      goalsCreated: careerGoals.length
    });
  },
});
