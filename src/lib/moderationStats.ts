import type { FieldMembership } from "src/types/moderation";

export function calcReviewCount(
  reviewFieldIds: (string | null)[],
  currentField: string | undefined
): number {
  if (!currentField) return reviewFieldIds.length;
  return reviewFieldIds.filter((f) => f === currentField).length;
}

export function calcMemberCount(
  fieldMemberships: FieldMembership[],
  adminCount: number,
  currentField: string | undefined
): number {
  if (!currentField) {
    const uniqueMembers = new Set(fieldMemberships.map((m) => m.moderator_id));
    return uniqueMembers.size + adminCount;
  }
  const uniqueMembers = new Set(
    fieldMemberships
      .filter((m) => m.field_id === currentField && !m.moderators?.is_admin)
      .map((m) => m.moderator_id)
  );
  return uniqueMembers.size;
}
