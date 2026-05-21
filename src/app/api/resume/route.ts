import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import {
  analyzeResume,
  getResumeProfile,
  updateSection,
} from "@/server/services/resume.service";
import { z } from "zod";

const patchSchema = z.object({
  sectionId: z.string(),
  content: z.string(),
});

export const GET = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    return apiSuccess(await getResumeProfile(user.id));
  },
});

export const PATCH = createApiHandler({
  schema: patchSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    const result = await updateSection(user.id, body.sectionId, body.content);
    return apiSuccess(result);
  },
});

const postSchema = z.object({
  targetRole: z.string().optional(),
});

export const POST = createApiHandler({
  schema: postSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    const result = await analyzeResume(user.id, body.targetRole);
    return apiSuccess(result);
  },
});
