import { db } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { softDeleteFilter } from "@/lib/soft-delete";
import type { PlatformRatings } from "@/types";

export async function getDashboardStats(userId: string) {
  const [vault, profile, problems, sessions, goals, opportunities, resume] =
    await Promise.all([
      db.dSAVault.findFirst({ where: { userId, ...softDeleteFilter } }),
      db.platformProfile.findFirst({ where: { userId, ...softDeleteFilter } }),
      db.dSAProblem.count({ where: { userId, ...softDeleteFilter } }),
      db.studySession.findMany({
        where: { userId, ...softDeleteFilter },
        orderBy: { startedAt: "desc" },
        take: 7,
      }),
      db.careerGoal.count({ where: { userId, status: "active", ...softDeleteFilter } }),
      db.opportunityItem.count({ where: { userId, ...softDeleteFilter } }),
      db.resumeProfile.findFirst({ where: { userId, ...softDeleteFilter } }),
    ]);

  const ratings = parseJson<PlatformRatings>(
    profile?.ratings ?? "{}",
    { leetcode: null, codeforces: null, atcoder: null }
  );

  const totalMinutes = sessions.reduce((s, x) => s + x.durationMinutes, 0);
  const topics = parseJson<string[]>(vault?.topicsMastered ?? "[]", []);

  return {
    problemsSolved: vault?.problemsSolved ?? 0,
    totalProblems: problems,
    streakDays: vault?.streakDays ?? 0,
    topicsMastered: topics.length,
    studyMinutesWeek: totalMinutes,
    activeGoals: goals,
    opportunities: opportunities,
    resumeScore: resume?.score ?? 0,
    ratings,
    recentSessions: sessions.map((s) => ({
      id: s.id,
      moduleId: s.moduleId,
      durationMinutes: s.durationMinutes,
      focusScore: s.focusScore,
      startedAt: s.startedAt.toISOString(),
    })),
  };
}
