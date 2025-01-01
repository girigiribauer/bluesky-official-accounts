export type TransitionStatus =
  | TransitionStatusNotyet
  | TransitionStatusCreated
  | TransitionStatusCombination
  | TransitionStatusDone
  | TransitionStatusUnknown;

export type TransitionStatusNotyet = "未移行（未確認）";
export type TransitionStatusCreated = "アカウント作成済";
export type TransitionStatusCombination = "両方運用中";
export type TransitionStatusDone = "Bluesky 完全移行";
export type TransitionStatusUnknown = "確認不能";
