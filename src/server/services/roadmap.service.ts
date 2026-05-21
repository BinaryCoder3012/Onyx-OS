import { db } from "@/lib/db";
import { parseJson, toJson } from "@/lib/json";
import { softDeleteFilter } from "@/lib/soft-delete";
import type { RoadmapNode } from "@/types";

export async function getRoadmap(userId: string): Promise<RoadmapNode[]> {
  const progress = await db.roadmapProgress.findFirst({
    where: { userId, ...softDeleteFilter },
  });
  return parseJson<RoadmapNode[]>(progress?.nodes ?? "[]", []);
}

export async function updateNodeStatus(
  userId: string,
  nodeId: string,
  status: RoadmapNode["status"]
): Promise<RoadmapNode[]> {
  const nodes = await getRoadmap(userId);

  function walk(items: RoadmapNode[]): RoadmapNode[] {
    return items.map((n) => {
      if (n.id === nodeId) return { ...n, status };
      return { ...n, children: walk(n.children) };
    });
  }

  const updated = walk(nodes);
  await db.roadmapProgress.upsert({
    where: { userId },
    update: { nodes: toJson(updated) },
    create: { userId, nodes: toJson(updated) },
  });
  return updated;
}
