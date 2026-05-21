import { db } from "@/lib/db";
import { softDeleteFilter } from "@/lib/soft-delete";
import { getSessionUserId } from "./session";
import type { User } from "@/types";

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await db.user.findFirst({
    where: { id: userId, ...softDeleteFilter },
  });

  if (!user) return null;

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

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
