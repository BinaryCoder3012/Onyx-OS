import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import { getPlatformProfile, updatePlatformProfile, syncPlatformRatings } from "@/server/services/platform.service";
import { getUserContext, updatePreferences } from "@/server/services/auth.service";
import { z } from "zod";

const updateSchema = z.object({
  leetcodeHandle: z.string().optional(),
  codeforcesHandle: z.string().optional(),
  githubUsername: z.string().optional(),
  linkedinUrl: z.string().optional(),
  ratings: z
    .object({
      leetcode: z.number().nullable(),
      codeforces: z.number().nullable(),
      atcoder: z.number().nullable(),
    })
    .optional(),
  preferences: z
    .object({
      density: z.enum(["compact", "comfortable"]),
      keyboardHints: z.boolean(),
      commandPaletteEnabled: z.boolean(),
    })
    .optional(),
});

export const GET = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    const [profile, context] = await Promise.all([
      getPlatformProfile(user.id),
      getUserContext(user.id),
    ]);
    return apiSuccess({ user, profile, context });
  },
});

export const PATCH = createApiHandler({
  schema: updateSchema,
  handler: async (_req, { body }) => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    if (body.preferences) await updatePreferences(user.id, body.preferences);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { preferences: _preferences, ...platformData } = body;
    if (Object.keys(platformData).length > 0) {
      await updatePlatformProfile(user.id, platformData);
    }
    const [profile, context] = await Promise.all([
      getPlatformProfile(user.id),
      getUserContext(user.id),
    ]);
    return apiSuccess({ user, profile, context });
  },
});

export const POST = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);
    
    // Trigger sync
    await syncPlatformRatings(user.id);
    
    const [profile, context] = await Promise.all([
      getPlatformProfile(user.id),
      getUserContext(user.id),
    ]);
    
    return apiSuccess({ user, profile, context, synced: true });
  }
});
