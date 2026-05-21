import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import { executeAI, buildPrompt } from "@/services/ai";
import { z } from "zod";
import { db } from "@/lib/db";

const chatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional().default([]),
});

export const POST = createApiHandler({
  schema: chatSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);

    // Fetch user context for the AI
    const resume = await db.resumeProfile.findUnique({ where: { userId: user.id } });
    const goals = await db.careerGoal.findMany({ where: { userId: user.id, status: "active" } });
    const roadmap = await db.roadmapProgress.findUnique({ where: { userId: user.id } });
    const dsa = await db.dSAVault.findUnique({ where: { userId: user.id } });

    const aiSchema = z.object({
      reply: z.string()
    });

    const systemPrompt = `You are Onyx OS, an advanced, highly capable AI developer assistant.
You help the user (who is a software engineer/developer) achieve their career goals, learn DSA, and navigate their roadmap.
Be concise, highly technical, and direct. Use markdown for code and formatting.

User Context:
- Target Role: ${goals[0]?.title || "Unknown"}
- Active Goals: ${goals.map(g => g.title).join(", ")}
- Resume Status: ${resume ? "Uploaded (Score: " + resume.score + ")" : "Not uploaded"}
- DSA Progress: ${dsa ? dsa.problemsSolved + " problems solved" : "Unknown"}
- Roadmap: ${roadmap ? "Generated" : "Not generated"}`;

    const conversationContext = body.history.map(msg => `${msg.role === 'user' ? 'User' : 'Onyx OS'}: ${msg.content}`).join("\n");
    const fullUserPrompt = `${conversationContext}\n\nUser: ${body.message}\n\nPlease respond to the user's latest message based on the context provided.`;

    const prompt = buildPrompt(systemPrompt, fullUserPrompt, aiSchema);
    const aiResponse = await executeAI(prompt);

    if (!aiResponse.success || !aiResponse.data) {
      return apiError(ERROR_CODES.AI_EXECUTION_FAILED, "Failed to generate chat response");
    }

    return apiSuccess({ reply: aiResponse.data.reply });
  },
});
