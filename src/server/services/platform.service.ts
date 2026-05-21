import { db } from "@/lib/db";
import { parseJson, toJson } from "@/lib/json";
import { softDeleteFilter } from "@/lib/soft-delete";
import type { PlatformRatings } from "@/types";

export async function getPlatformProfile(userId: string) {
  const profile = await db.platformProfile.findFirst({
    where: { userId, ...softDeleteFilter },
  });
  if (!profile) return null;

  return {
    id: profile.id,
    leetcodeHandle: profile.leetcodeHandle,
    codeforcesHandle: profile.codeforcesHandle,
    githubUsername: profile.githubUsername,
    linkedinUrl: profile.linkedinUrl,
    ratings: parseJson<PlatformRatings>(profile.ratings, {
      leetcode: null,
      codeforces: null,
      atcoder: null,
    }),
  };
}

export async function updatePlatformProfile(
  userId: string,
  data: Partial<{
    leetcodeHandle: string | null;
    codeforcesHandle: string | null;
    githubUsername: string | null;
    linkedinUrl: string | null;
    ratings: PlatformRatings;
  }>
) {
  const existing = await db.platformProfile.findFirst({ where: { userId } });
  const ratings = data.ratings
    ? toJson(data.ratings)
    : existing?.ratings ?? "{}";

  return db.platformProfile.upsert({
    where: { userId },
    update: {
      ...(data.leetcodeHandle !== undefined && { leetcodeHandle: data.leetcodeHandle }),
      ...(data.codeforcesHandle !== undefined && { codeforcesHandle: data.codeforcesHandle }),
      ...(data.githubUsername !== undefined && { githubUsername: data.githubUsername }),
      ...(data.linkedinUrl !== undefined && { linkedinUrl: data.linkedinUrl }),
      ratings,
    },
    create: {
      userId,
      leetcodeHandle: data.leetcodeHandle ?? null,
      codeforcesHandle: data.codeforcesHandle ?? null,
      githubUsername: data.githubUsername ?? null,
      linkedinUrl: data.linkedinUrl ?? null,
      ratings,
    },
  });
}

export async function syncPlatformRatings(userId: string) {
  const existing = await getPlatformProfile(userId);
  if (!existing) return null;

  const currentRatings = existing.ratings;
  
  // 1. Fetch Codeforces
  if (existing.codeforcesHandle) {
    try {
      const res = await fetch(`https://codeforces.com/api/user.info?handles=${existing.codeforcesHandle}`, {
        next: { revalidate: 3600 }
      });
      const data = await res.json();
      if (data.status === "OK" && data.result?.[0]?.rating) {
        currentRatings.codeforces = data.result[0].rating;
      }
    } catch (e) {
      console.error("[Codeforces Sync Error]", e);
    }
  }

  // 2. Fetch LeetCode (using alfa-leetcode-api which is reliable)
  if (existing.leetcodeHandle) {
    try {
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/${existing.leetcodeHandle}/contest`, {
        next: { revalidate: 3600 }
      });
      const data = await res.json();
      if (data && typeof data.contestRating === "number") {
        currentRatings.leetcode = Math.round(data.contestRating);
      }
    } catch (e) {
      console.error("[LeetCode Sync Error]", e);
    }
  }

  // Save the synced ratings
  await updatePlatformProfile(userId, { ratings: currentRatings });
  
  return currentRatings;
}

