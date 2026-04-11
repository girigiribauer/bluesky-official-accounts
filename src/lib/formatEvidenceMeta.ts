import { formatDateTime } from "./formatDateTime";

export function formatEvidenceMeta(evidence: { created_at: string | null; moderators: { handle: string } | null }): string {
  if (!evidence.moderators || !evidence.created_at) {
    return "[旧管理から移行] 管理者さん";
  }
  return `[${formatDateTime(evidence.created_at)}] ${evidence.moderators.handle} さん`;
}
