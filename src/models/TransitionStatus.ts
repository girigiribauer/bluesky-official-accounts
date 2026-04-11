export type TransitionStatus =
  | TransitionStatusNotMigrated
  | TransitionStatusUnverified
  | TransitionStatusAccountCreated
  | TransitionStatusDualActive
  | TransitionStatusMigrated
  | TransitionStatusUnverifiable;

// 未移行（Blueskyアカウントなし）
export type TransitionStatusNotMigrated = "not_migrated";
// 未確認（Blueskyアカウントはあるが同一性未確認）
export type TransitionStatusUnverified = "unverified";
// アカウント作成済
export type TransitionStatusAccountCreated = "account_created";
// 両方運用中
export type TransitionStatusDualActive = "dual_active";
// Bluesky 完全移行
export type TransitionStatusMigrated = "migrated";
// 確認不能
export type TransitionStatusUnverifiable = "unverifiable";

export const TRANSITION_STATUS_LABELS: Record<TransitionStatus, string> = {
  not_migrated: "来てほしい",
  unverified: "未確認",
  account_created: "アカウント作成済",
  dual_active: "両方運用中",
  migrated: "Bluesky 完全移行",
  unverifiable: "確認不能",
};
