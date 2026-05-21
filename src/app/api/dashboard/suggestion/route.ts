import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import { executeAI, buildPrompt } from "@/services/ai";
import { z } from "zod";
import { db } from "@/lib/db";

export const GET = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);

    const goals = await db.careerGoal.findMany({ where: { userId: user.id, status: "active" } });
    const dsa = await db.dSAVault.findUnique({ where: { userId: user.id } });
    const roadmap = await db.roadmapProgress.findUnique({ where: { userId: user.id } });

    const aiSchema = z.object({
      suggestion: z.string(),
      actionUrl: z.string(),
      actionLabel: z.string()
    });

    const systemPrompt = `You are Onyx OS. Provide EXACTLY ONE daily actionable tip for a software engineer. Keep it under 2 sentences. Give a relevant URL path to navigate to in the app (e.g. /dsa-vault, /roadmap, /resume).`;
    const userPrompt = `Context: 
Target Role: ${goals[0]?.title || "Unknown"}
DSA Solved: ${dsa?.problemsSolved || 0}
Has Roadmap: ${roadmap && roadmap.nodes.length > 5 ? "Yes" : "No"}`;

    const prompt = buildPrompt(systemPrompt, userPrompt, aiSchema);
    const aiResponse = await executeAI(prompt);

    if (!aiResponse.success || !aiResponse.data) {
      // Fallback if AI fails
      return apiSuccess({
        suggestion: "Keep up the momentum! Solve one more problem today to build your streak.",
        actionUrl: "/dsa-vault",
        actionLabel: "Go to DSA Vault"
      });
    }

    return apiSuccess(aiResponse.data);
  },
});
