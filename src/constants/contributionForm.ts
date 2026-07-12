// transition_status の選択肢。value は DB に保存される英語値
export const STATUS_OPTIONS = [
  { value: "", label: "（選択してください）" },
  { value: "not_migrated", label: "未移行（未確認）" },
  { value: "account_created", label: "アカウント作成済" },
  { value: "dual_active", label: "両方運用中" },
  { value: "migrated", label: "Bluesky 完全移行" },
  { value: "unknown", label: "確認不能" },
] as const;

export const EVIDENCE_SHORTCUTS: { label: string; template: string | null }[] = [
  { label: "（選択してください）", template: null },
  { label: "カスタムドメインのため", template: "カスタムドメインのため" },
  { label: "X/Twitter プロフィールに記載あり", template: "X/Twitter プロフィールに記載あり" },
  { label: "X/Twitter での言及", template: "X/Twitter での言及あり\nURLは\n\nです。" },
  { label: "公式サイトにリンクあり", template: "公式サイトにリンクあり\nURLは\n\nです。" },
  { label: "その他", template: "同一だとわかる客観的根拠として\n\nがあります。" },
];
