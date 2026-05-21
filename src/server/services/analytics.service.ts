import { db } from "@/lib/db";
import { softDeleteFilter } from "@/lib/soft-delete";

export async function getAnalytics(userId: string) {
  const sessions = await db.studySession.findMany({
    where: { userId, ...softDeleteFilter },
    orderBy: { startedAt: "asc" },
  });

  const byModule: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  let totalMinutes = 0;
  let totalFocus = 0;

  for (const s of sessions) {
    totalMinutes += s.durationMinutes;
    totalFocus += s.focusScore;
    byModule[s.moduleId] = (byModule[s.moduleId] ?? 0) + s.durationMinutes;

    const day = s.startedAt.toISOString().slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + s.durationMinutes;
  }

  const moduleBreakdown = Object.entries(byModule).map(([moduleId, minutes]) => ({
    moduleId,
    minutes,
    percentage: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
  }));

  const dailyActivity = Object.entries(byDay)
    .slice(-14)
    .map(([date, minutes]) => ({ date, minutes }));

  return {
    totalSessions: sessions.length,
    totalMinutes,
    avgFocus: sessions.length > 0 ? totalFocus / sessions.length : 0,
    moduleBreakdown,
    dailyActivity,
  };
}
