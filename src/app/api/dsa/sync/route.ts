import { getCurrentUser } from "@/lib/auth/get-user";
import { apiError, apiSuccess } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/errors";
import { createApiHandler } from "@/server/api-handler";
import { db } from "@/lib/db";
import { toJson } from "@/lib/json";

export const POST = createApiHandler({
  handler: async () => {
    const user = await getCurrentUser();
    if (!user) return apiError(ERROR_CODES.UNAUTHORIZED, "Login required", 401);

    const platformProfile = await db.platformProfile.findUnique({
      where: { userId: user.id }
    });

    if (!platformProfile) {
      return apiError(ERROR_CODES.NOT_FOUND, "Platform profile not found");
    }

    let leetcodeSolved = 0;
    let codeforcesRating = null;

    // Fetch LeetCode stats
    if (platformProfile.leetcodeHandle) {
      try {
        const lcRes = await fetch(`https://leetcode-stats-api.herokuapp.com/${platformProfile.leetcodeHandle}`);
        if (lcRes.ok) {
          const lcData = await lcRes.json();
          if (lcData.status === "success") {
            leetcodeSolved = lcData.totalSolved;
          }
        }
      } catch (e) {
        console.error("Failed to fetch LeetCode data", e);
      }
    }

    // Fetch Codeforces stats
    if (platformProfile.codeforcesHandle) {
      try {
        const cfRes = await fetch(`https://codeforces.com/api/user.info?handles=${platformProfile.codeforcesHandle}`);
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          if (cfData.status === "OK" && cfData.result.length > 0) {
            codeforcesRating = cfData.result[0].rating;
          }
        }
      } catch (e) {
        console.error("Failed to fetch Codeforces data", e);
      }
    }

    const currentRatings = JSON.parse(platformProfile.ratings);
    const newRatings = {
      ...currentRatings,
      codeforces: codeforcesRating || currentRatings.codeforces,
      leetcode: currentRatings.leetcode, // we don't have contest rating from this api
    };

    // Update Platform Profile with new ratings
    await db.platformProfile.update({
      where: { userId: user.id },
      data: { ratings: toJson(newRatings) }
    });

    // Update DSA Vault with solved count
    const dsaVault = await db.dSAVault.upsert({
      where: { userId: user.id },
      update: { 
        problemsSolved: { increment: leetcodeSolved > 0 ? leetcodeSolved : 0 } 
      },
      create: { 
        userId: user.id, 
        problemsSolved: leetcodeSolved,
        topicsMastered: "[]"
      }
    });

    return apiSuccess({
      leetcodeSolved,
      codeforcesRating,
      dsaVault
    });
  },
});
