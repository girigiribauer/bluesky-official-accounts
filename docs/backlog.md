# バックログ

このファイルは「**いま何が残っているか**」を管理する生きたタスク一覧です。
「あるべき姿（仕様・設計）」は別ドキュメント（`docs/planning_migration/` など）に置き、
ここには進捗と残作業だけを書きます。両者を混在させない。

- チェックボックスで状態管理: `[ ]` 未着手 / `[~]` 進行中 / `[x]` 完了
- 各項目末尾の `→` は根拠・参照先
- `⚠️` は本公開（`/moderation` 一般開放）のブロッカー候補
- `❓` は方針が未確定 or 要相談

> たたき台。分類・粒度・優先度は一緒に調整していく前提。

---

## 技術的なこと

### パフォーマンス
- [ ] ⚠️ Supabase アクセスを PostgREST(HTTP) から Postgres 直結へ寄せる → `attachDatabasePool` 等でコネクションプール共有。`getSupabaseClient()` が呼ぶたび新規 `createClient` している（`src/lib/supabaseClient.ts`）
- [ ] ダッシュボード描画の往復削減 → `(dashboard)/layout.tsx` で7クエリ並列。直結化後に集約 or ビュー化を検討
- [ ] server action の往復削減 → 承認処理（`approveEntrySubmission`）が最大7〜8往復（`src/app/moderation_beta/actions.ts`）。トランザクション/RPC 化の検討
- [ ] ❓ 承認処理の原子性 → 複数 INSERT/DELETE が非トランザクション。途中失敗で中途半端な状態が残りうる。Postgres 関数(RPC)にまとめる案

### 認証・セキュリティ
- [ ] ⚠️ RLS ポリシー未設定 → 全テーブル `enable` だがポリシー無し、サーバーはサービスロールで全バイパス。一般開放前に公開読み取りポリシー等を設計（`supabase/migrations/...initial_schema.sql`）
- [ ] ❓ セッション cookie の有効期限・失効 → HMAC 署名のみで expiry なし（`src/lib/auth.ts`）。要方針
- [ ] betaAllowList の扱い → 一般開放時に撤去/置換（`src/lib/betaAllowList.ts`）

### データ・移行運用
- [ ] `old_category` カラムの廃止 → 表側を新分野ベースに切り替え後（フェーズ5）
- [x] 既知の型エラー解消 → `tsc --noEmit` はクリーン（memory の記述は古かった）
- [ ] fetch スクリプトを新分野ベースへ → `scripts/fetchAccountList.ts` は現状 `old_category` 依存

### テスト・検証
- [ ] ⚠️ 本番デプロイ前の E2E 通し検証手順を用意 → 投稿→DB→モデレーション画面（postmortem 再発防止策）
- [ ] ⚠️ ロールバック手順の明文化（postmortem 再発防止策）

---

## 設計・モデリング的なこと

- [ ] ⚠️ 未分類問題 → 旧カテゴリーの多くが `uncategorized` に流入。新分野への振り分け方針は `docs/planning_migration/categories.md` にあるが、移行実行はこれから
- [ ] 段階制度（3段階の権限）の実装 → 入門/一人前/熟練。現状 `moderators.is_admin` のみ（`moderation.md` フェーズ5）
- [ ] 後追いレビュー（追認レビュー）のモデリング → タスクとして積む仕組み。未実装
- [ ] 異議申し立て機能 → モデレーターからの異議、熟練が対応（`moderation.md`）。未実装
- [ ] ポイント制度 → ゲーミフィケーション。名称・配分未確定（`moderation.md`）
- [ ] 通知システム（サイト内通知のみ）→ 未実装
- [ ] モデレーターのライフサイクル → 半年無活動で権限失効等の自動処理。未実装
- [ ] ❓ フェーズ6: atproto/PDS 対応 → 将来。承認時に PDS へレコード書き込み（`migration.md`）

---

## デザイン・UI的なこと

- [x] オンボーディング（分野選択フロー）→ 実装完了・**未コミット**。`onboard/page.tsx` + `ModerationOnboarding` + `FieldChips` + `joinField`
- [x] 分野切り替え（`last_active_at` / 分野を追加メニュー / デフォルト分野リダイレクト）→ 実装完了・**未コミット**
- [x] 既存アカウント更新の判別（Review / Update 出し分け、旧→新ハンドル表示）→ 実装完了・**未コミット**
- [x] 統合テスト（`tests/moderationFlow.integration.test.ts`）→ 16件パス・冪等性確認済み。`cleanupAccount` が `requests` を消しておらず再実行で重複キー落ちしていたのを修正
- [ ] ⚠️ ダッシュボードの投稿数表示 → `postCount={0}` ハードコード（`(dashboard)/layout.tsx`）。未実装プレースホルダ
- [ ] チームメンバーアイコン → `moderators.avatar` は追加済みか要確認、UI 表示は未対応（memory 由来）
- [ ] 表側（公開ページ）を新分野・分類ベースの表示に切り替え → 現状は旧カテゴリー表示（`migration.md` フェーズ4）
- [ ] `/moderation_beta` → `/moderation` への昇格（本公開時のURL・導線整理）

---

## 運用メモ
- 表側は Supabase を直接見ず、`scripts/fetchAccountList.ts` が生成し GitHub `data` ブランチに置く JSON を配信（`src/lib/fetchData.ts`）。DB 負荷は管理側に集中している
- 大きな未コミット変更が作業ツリーにある（オンボーディング等）。整理・コミット方針は別途
