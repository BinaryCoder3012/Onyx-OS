import { db } from "@/lib/db";
import { softDeleteFilter, softDeleteData } from "@/lib/soft-delete";

export async function getCareerGoals(userId: string) {
  const goals = await db.careerGoal.findMany({
    where: { userId, ...softDeleteFilter },
    orderBy: { priority: "asc" },
  });
  return goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    targetDate: g.targetDate?.toISOString() ?? null,
    status: g.status,
    priority: g.priority,
  }));
}

export async function createGoal(
  userId: string,
  data: { title: string; description?: string; priority?: number }
) {
  return db.careerGoal.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      priority: data.priority ?? 1,
    },
  });
}

export async function updateGoalStatus(userId: string, goalId: string, status: string) {
  return db.careerGoal.updateMany({
    where: { id: goalId, userId, ...softDeleteFilter },
    data: { status },
  });
}

export async function deleteGoal(userId: string, goalId: string) {
  return db.careerGoal.updateMany({
    where: { id: goalId, userId },
    data: softDeleteData(),
  });
}
