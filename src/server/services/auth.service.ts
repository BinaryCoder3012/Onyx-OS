import { db } from "@/lib/db";
import { toJson } from "@/lib/json";
import { setSessionCookie } from "@/lib/auth/session";
import { softDeleteFilter } from "@/lib/soft-delete";
import type { OnyxPreferences, User } from "@/types";

const DEFAULT_PREFS: OnyxPreferences = {
  density: "compact",
  keyboardHints: true,
  commandPaletteEnabled: true,
};

export async function loginOrRegister(
  email: string,
  displayName?: string
): Promise<User> {
  let user = await db.user.findFirst({
    where: { email, ...softDeleteFilter },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        email,
        displayName: displayName ?? email.split("@")[0] ?? "Operator",
      },
    });

    await Promise.all([
      db.onyxContext.create({
        data: {
          userId: user.id,
          preferences: toJson(DEFAULT_PREFS),
          onboardingComplete: false,
        },
      }),
      db.dSAVault.create({ data: { userId: user.id, topicsMastered: "[]" } }),
      db.platformProfile.create({ data: { userId: user.id } }),
      db.roadmapProgress.create({ data: { userId: user.id, nodes: "[]" } }),
      db.resumeProfile.create({
        data: {
          userId: user.id,
          sections: toJson([]),
        },
      }),
    ]);
  }

  await setSessionCookie(user.id);

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    isDeleted: user.isDeleted,
  };
}

export async function getUserContext(userId: string) {
  const ctx = await db.onyxContext.findFirst({
    where: { userId, ...softDeleteFilter },
  });
  if (!ctx) return null;

  return {
    id: ctx.id,
    userId: ctx.userId,
    activeModule: ctx.activeModule,
    preferences: JSON.parse(ctx.preferences) as OnyxPreferences,
    onboardingComplete: ctx.onboardingComplete,
    createdAt: ctx.createdAt.toISOString(),
    updatedAt: ctx.updatedAt.toISOString(),
    isDeleted: ctx.isDeleted,
  };
}

export async function updatePreferences(userId: string, preferences: OnyxPreferences) {
  return db.onyxContext.updateMany({
    where: { userId },
    data: { preferences: toJson(preferences) },
  });
}
