// created_at の降順（新しい順）でソート。null は末尾に置く
export function sortEvidences<T extends { created_at: string | null }>(evidences: T[]): T[] {
  return [...evidences].sort((a, b) => {
    if (!a.created_at) return 1;
    if (!b.created_at) return -1;
    return b.created_at.localeCompare(a.created_at);
  });
}
