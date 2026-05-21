export const softDeleteFilter = { isDeleted: false } as const;

export function softDeleteData() {
  return { isDeleted: true, updatedAt: new Date() };
}
