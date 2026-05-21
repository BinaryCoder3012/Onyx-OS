import { clearSessionCookie } from "@/lib/auth/session";
import { apiSuccess } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth/get-user";
import { createApiHandler } from "@/server/api-handler";
import { getUserContext, loginOrRegister } from "@/server/services/auth.service";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(64).optional(),
});

export const GET = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiSuccess({ user: null, context: null });
    const context = await getUserContext(user.id);
    return apiSuccess({ user, context });
  },
});

export const POST = createApiHandler({
  schema: loginSchema,
  handler: async (_req, { body }) => {
    const user = await loginOrRegister(body.email, body.displayName);
    const context = await getUserContext(user.id);
    return apiSuccess({ user, context });
  },
});

export const DELETE = createApiHandler({
  handler: async () => {
    await clearSessionCookie();
    return apiSuccess({ loggedOut: true });
  },
});
