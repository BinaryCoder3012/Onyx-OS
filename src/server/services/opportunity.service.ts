import { db } from "@/lib/db";
import { softDeleteFilter, softDeleteData } from "@/lib/soft-delete";

export async function getOpportunities(userId: string) {
  const items = await db.opportunityItem.findMany({
    where: { userId, ...softDeleteFilter },
    orderBy: { matchScore: "desc" },
  });
  return items.map((o) => ({
    id: o.id,
    title: o.title,
    company: o.company,
    type: o.type,
    matchScore: o.matchScore,
    url: o.url,
    discoveredAt: o.discoveredAt.toISOString(),
  }));
}

export async function createOpportunity(
  userId: string,
  data: { title: string; company: string; type: string; matchScore?: number; url?: string }
) {
  return db.opportunityItem.create({
    data: {
      userId,
      title: data.title,
      company: data.company,
      type: data.type,
      matchScore: data.matchScore ?? 50,
      url: data.url,
    },
  });
}

export async function deleteOpportunity(userId: string, id: string) {
  return db.opportunityItem.updateMany({
    where: { id, userId },
    data: softDeleteData(),
  });
}
