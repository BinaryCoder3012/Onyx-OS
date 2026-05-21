import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import {
  createGoal,
  deleteGoal,
  getCareerGoals,
  updateGoalStatus,
} from "@/server/services/career.service";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(10).optional(),
});

const patchSchema = z.object({
  goalId: z.string(),
  status: z.enum(["active", "completed", "archived"]),
});

export const GET = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    return apiSuccess(await getCareerGoals(user.id));
  },
});

export const POST = createApiHandler({
  schema: createSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    await createGoal(user.id, body);
    return apiSuccess(await getCareerGoals(user.id));
  },
});

export const PATCH = createApiHandler({
  schema: patchSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    await updateGoalStatus(user.id, body.goalId, body.status);
    return apiSuccess(await getCareerGoals(user.id));
  },
});

export const DELETE = createApiHandler({
  handler: async (request) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return apiError(ERROR_CODES.VALIDATION_ERROR, "id required", 422);
    await deleteGoal(user.id, id);
    return apiSuccess(await getCareerGoals(user.id));
  },
});
