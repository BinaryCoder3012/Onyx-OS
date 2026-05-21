import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import { analyzeResume } from "@/server/services/resume.service";
import { aiSchemas, buildPrompt, executeAI } from "@/services/ai";
import { SYSTEM_PROMPTS } from "@/services/ai/prompts";
import { z } from "zod";

const postSchema = z.object({
  action: z.enum(["analyze-resume", "insights"]),
  context: z.string().optional(),
});

export const GET = createApiHandler({
  handler: async () => {
    return apiSuccess({ status: "ready", providers: ["gemini", "openai", "claude"] });
  },
});

export const POST = createApiHandler({
  schema: postSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);

    if (body.action === "analyze-resume") {
      const result = await analyzeResume(user.id);
      return apiSuccess(result);
    }

    const prompt = buildPrompt(
      SYSTEM_PROMPTS.analysis,
      body.context ?? "Provide engineering productivity insights.",
      aiSchemas.structuredAnalysis
    );
    const response = await executeAI(prompt);
    if (!response.success) {
      return apiError(ERROR_CODES.AI_EXECUTION_FAILED, response.error?.message ?? "AI failed", 500);
    }
    return apiSuccess(response.data);
  },
});
