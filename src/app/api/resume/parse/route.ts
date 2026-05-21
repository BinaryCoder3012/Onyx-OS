import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import { executeAI, buildPrompt } from "@/services/ai";
import { SYSTEM_PROMPTS } from "@/services/ai/prompts";
import { z } from "zod";
import { db } from "@/lib/db";
import { toJson } from "@/lib/json";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const POST = createApiHandler({
  handler: async (request) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);

    let targetRole = "";
    let resumeText = "";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      targetRole = (formData.get("targetRole") as string) || "";
      
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = file.name.toLowerCase();
        
        try {
          if (filename.endsWith(".pdf")) {
            const parser = new PDFParse({ data: buffer });
            const textResult = await parser.getText();
            resumeText = textResult.text;
          } else if (filename.endsWith(".docx")) {
            const result = await mammoth.extractRawText({ buffer });
            resumeText = result.value;
          } else {
            resumeText = buffer.toString("utf-8");
          }
        } catch (parseError) {
          console.error("File parsing error:", parseError);
          return apiError(
            ERROR_CODES.VALIDATION_ERROR,
            `Failed to parse file: ${parseError instanceof Error ? parseError.message : String(parseError)}`
          );
        }
      } else {
        resumeText = (formData.get("resumeText") as string) || "";
      }
    } else {
      const body = await request.json();
      targetRole = body.targetRole || "";
      resumeText = body.resumeText || "";
    }

    if (!targetRole) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, "Target role is required", 422);
    }
    if (!resumeText || resumeText.trim().length < 10) {
      return apiError(
        ERROR_CODES.VALIDATION_ERROR,
        "Resume text is too short or missing (minimum 10 characters required)",
        422
      );
    }

    // Schema for the AI response
    const aiSchema = z.object({
      extractedSections: z.array(
        z.object({
          type: z.string(),
          content: z.string(),
          score: z.number(),
        })
      ),
      careerGoals: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
        })
      ),
    });

    const prompt = buildPrompt(
      SYSTEM_PROMPTS.resume,
      `Parse the following resume text for a user targeting the role of "${targetRole}". 
Extract logical sections (e.g., Experience, Projects, Skills, Education) and score them out of 100 based on quality and relevance to the target role.
Also, suggest 2-3 immediate, actionable career goals based on the gaps between their resume and their target role.

Resume Text:
${resumeText}`,
      aiSchema
    );

    const aiResponse = await executeAI(prompt);

    if (!aiResponse.success || !aiResponse.data) {
      return apiError(ERROR_CODES.AI_EXECUTION_FAILED, "Failed to parse resume with AI");
    }

    const { extractedSections, careerGoals } = aiResponse.data;

    // Map extracted sections to the ResumeSection format
    const sectionsToSave = extractedSections.map((sec) => ({
      id: crypto.randomUUID(),
      type: sec.type,
      content: sec.content,
      score: sec.score,
    }));

    const avgScore =
      sectionsToSave.length > 0
        ? Math.round(sectionsToSave.reduce((a, b) => a + b.score, 0) / sectionsToSave.length)
        : 0;

    // Save Resume
    await db.resumeProfile.upsert({
      where: { userId: user.id },
      update: {
        sections: toJson(sectionsToSave),
        score: avgScore,
        lastAnalyzedAt: new Date(),
      },
      create: {
        userId: user.id,
        sections: toJson(sectionsToSave),
        score: avgScore,
        lastAnalyzedAt: new Date(),
      },
    });

    // Save Career Goals
    for (const goal of careerGoals) {
      await db.careerGoal.create({
        data: {
          userId: user.id,
          title: goal.title,
          description: goal.description,
          status: "active",
          priority: 1,
        },
      });
    }

    return apiSuccess({
      resumeScore: avgScore,
      sectionsCount: sectionsToSave.length,
      goalsCreated: careerGoals.length,
    });
  },
});
