import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import { executeAI, buildPrompt } from "@/services/ai";
import { SYSTEM_PROMPTS } from "@/services/ai/prompts";
import { z } from "zod";
import { db } from "@/lib/db";
import { toJson } from "@/lib/json";
import { RoadmapNode } from "@/types";

const generateSchema = z.object({
  targetRole: z.string().optional(),
});

export const POST = createApiHandler({
  schema: generateSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);

    // Fetch user context
    const resume = await db.resumeProfile.findUnique({ where: { userId: user.id } });
    const goals = await db.careerGoal.findMany({ where: { userId: user.id, status: "active" } });

    // Schema for the AI response
    const aiSchema = z.object({
      roadmap: z.array(z.object({
        title: z.string(),
        description: z.string(),
        children: z.array(z.object({
          title: z.string(),
          description: z.string()
        }))
      }))
    });

    const context = `Target Role: ${body.targetRole || "Software Engineer"}\n\nCareer Goals:\n${goals.map(g => g.title).join(", ")}\n\nResume Context:\n${resume ? resume.sections : "No resume provided"}`;

    const prompt = buildPrompt(
      SYSTEM_PROMPTS.resume, // General AI persona
      `Create a detailed, step-by-step learning roadmap for the following user profile. Structure it into major phases (parents) and specific topics/projects (children).

Context:
${context}`,
      aiSchema
    );

    const aiResponse = await executeAI(prompt);

    if (!aiResponse.success || !aiResponse.data) {
      return apiError(ERROR_CODES.AI_EXECUTION_FAILED, "Failed to generate roadmap");
    }

    // Convert AI response to RoadmapNode array
    const nodes: RoadmapNode[] = aiResponse.data.roadmap.map(phase => ({
      id: crypto.randomUUID(),
      title: phase.title,
      status: "active",
      children: phase.children.map(child => ({
        id: crypto.randomUUID(),
        title: child.title,
        status: "locked",
        children: []
      }))
    }));

    // Lock all parents except the first one
    if (nodes.length > 0) {
      for (let i = 1; i < nodes.length; i++) {
        nodes[i].status = "locked";
      }
    }

    await db.roadmapProgress.upsert({
      where: { userId: user.id },
      update: { nodes: toJson(nodes) },
      create: { userId: user.id, nodes: toJson(nodes) }
    });

    return apiSuccess(nodes);
  },
});
