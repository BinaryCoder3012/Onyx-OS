import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import { getRoadmap, updateNodeStatus } from "@/server/services/roadmap.service";
import { z } from "zod";

const patchSchema = z.object({
  nodeId: z.string(),
  status: z.enum(["locked", "active", "complete"]),
});

export const GET = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    return apiSuccess(await getRoadmap(user.id));
  },
});

export const PATCH = createApiHandler({
  schema: patchSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    const nodes = await updateNodeStatus(user.id, body.nodeId, body.status);
    return apiSuccess(nodes);
  },
});
