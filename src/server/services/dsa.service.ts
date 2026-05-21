import { db } from "@/lib/db";
import { parseJson, toJson } from "@/lib/json";
import { softDeleteFilter, softDeleteData } from "@/lib/soft-delete";

export async function getDSAVault(userId: string) {
  const [vault, problems] = await Promise.all([
    db.dSAVault.findFirst({ where: { userId, ...softDeleteFilter } }),
    db.dSAProblem.findMany({
      where: { userId, ...softDeleteFilter },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    vault: vault
      ? {
          problemsSolved: vault.problemsSolved,
          streakDays: vault.streakDays,
          topicsMastered: parseJson<string[]>(vault.topicsMastered, []),
          lastActivityAt: vault.lastActivityAt?.toISOString() ?? null,
        }
      : null,
    problems: problems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      topic: p.topic,
      platform: p.platform,
      status: p.status,
      solvedAt: p.solvedAt?.toISOString() ?? null,
      notes: p.notes,
    })),
  };
}

export async function createProblem(
  userId: string,
  data: { title: string; difficulty: string; topic: string; platform?: string }
) {
  const problem = await db.dSAProblem.create({
    data: {
      userId,
      title: data.title,
      difficulty: data.difficulty,
      topic: data.topic,
      platform: data.platform ?? "leetcode",
    },
  });

  await syncVaultCounts(userId);
  return problem;
}

export async function updateProblemStatus(
  userId: string,
  problemId: string,
  status: string
) {
  const problem = await db.dSAProblem.updateMany({
    where: { id: problemId, userId, ...softDeleteFilter },
    data: {
      status,
      solvedAt: status === "solved" ? new Date() : null,
    },
  });
  await syncVaultCounts(userId);
  return problem;
}

export async function deleteProblem(userId: string, problemId: string) {
  await db.dSAProblem.updateMany({
    where: { id: problemId, userId },
    data: softDeleteData(),
  });
  await syncVaultCounts(userId);
}

async function syncVaultCounts(userId: string) {
  const solved = await db.dSAProblem.count({
    where: { userId, status: "solved", ...softDeleteFilter },
  });
  await db.dSAVault.upsert({
    where: { userId },
    update: { problemsSolved: solved, lastActivityAt: new Date() },
    create: {
      userId,
      problemsSolved: solved,
      topicsMastered: "[]",
      lastActivityAt: new Date(),
    },
  });
}

export async function addTopic(userId: string, topic: string) {
  const vault = await db.dSAVault.findFirst({ where: { userId, ...softDeleteFilter } });
  const topics = parseJson<string[]>(vault?.topicsMastered ?? "[]", []);
  if (!topics.includes(topic)) topics.push(topic);
  await db.dSAVault.upsert({
    where: { userId },
    update: { topicsMastered: toJson(topics) },
    create: { userId, topicsMastered: toJson(topics) },
  });
  return topics;
}
