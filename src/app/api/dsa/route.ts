import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import {
  createProblem,
  deleteProblem,
  getDSAVault,
  updateProblemStatus,
} from "@/server/services/dsa.service";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  topic: z.string().min(1),
  platform: z.string().optional(),
});

const patchSchema = z.object({
  problemId: z.string(),
  status: z.enum(["todo", "in-progress", "solved"]),
});

export const GET = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    return apiSuccess(await getDSAVault(user.id));
  },
});

export const POST = createApiHandler({
  schema: createSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    await createProblem(user.id, body);
    return apiSuccess(await getDSAVault(user.id));
  },
});

export const PATCH = createApiHandler({
  schema: patchSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    await updateProblemStatus(user.id, body.problemId, body.status);
    return apiSuccess(await getDSAVault(user.id));
  },
});

export const DELETE = createApiHandler({
  handler: async (request) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return apiError(ERROR_CODES.VALIDATION_ERROR, "id required", 422);
    await deleteProblem(user.id, id);
    return apiSuccess(await getDSAVault(user.id));
  },
});
