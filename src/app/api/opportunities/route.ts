import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import {
  createOpportunity,
  deleteOpportunity,
  getOpportunities,
} from "@/server/services/opportunity.service";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  type: z.enum(["internship", "full-time", "contract"]),
  matchScore: z.number().int().min(0).max(100).optional(),
  url: z.string().url().optional().or(z.literal("")),
});

export const GET = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    return apiSuccess(await getOpportunities(user.id));
  },
});

export const POST = createApiHandler({
  schema: createSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    await createOpportunity(user.id, {
      ...body,
      url: body.url || undefined,
    });
    return apiSuccess(await getOpportunities(user.id));
  },
});

export const DELETE = createApiHandler({
  handler: async (request) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return apiError(ERROR_CODES.VALIDATION_ERROR, "id required", 422);
    await deleteOpportunity(user.id, id);
    return apiSuccess(await getOpportunities(user.id));
  },
});
